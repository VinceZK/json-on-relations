/**
 * Created by VinceZK on 6/16/18.
 *
 */
const debug = require('debug')('darkhouse:mysql_mdb');
const async = require('async');
const mysql = require('mysql');
const _ = require('underscore');
const entities = [];
const relations = [];
const dataTypes = [
  {key: 1, dataType: 'Char', sqlType: 'varchar'},
  {key: 2, dataType: 'Integer', sqlType: 'int'},
  {key: 3, dataType: 'Boolean', sqlType: 'tinyint'},
  {key: 4, dataType: 'Decimal', sqlType: 'decimal'},
  {key: 5, dataType: 'String', sqlType: 'text'},
  {key: 6, dataType: 'Binary', sqlType: 'blob'},
  {key: 7, dataType: 'Date', sqlType: 'date'},
  {key: 8, dataType: 'Timestamp', sqlType: 'datetime'}
];
let pool = null;
setConnPool('mysql', { //Default connection pool
  connectionLimit : 10,
  host: 'localhost',
  user: 'nodejs',
  password: 'nodejs',
  database: 'MDB',
  createDatabaseTable: true,
  multipleStatements: true,
  dateStrings: true,
  port: 3306
});

module.exports = {
  pool: pool,
  entities: entities,
  relations: relations,
  setConnPool: setConnPool,
  loadEntity: loadEntity,
  loadEntities: loadEntities,
  loadRelation: getRelation,
  listEntityID: listEntityID,
  listEntityIDbyRole: listEntityIDbyRole,
  getEntityMeta: getEntityMeta,
  getRelationMeta: getRelationMeta,
  checkDBConsistency: checkDBConsistency,
  syncDBTable: syncDBTable,
  createDBTable: createDBTable,
  executeSQL: executeSQL,
  doUpdatesParallel: doUpdatesParallel,
  doUpdatesSeries: doUpdatesSeries,
  closeMDB: closeMDB
};

function setConnPool(nodeDB, config) {
  if (!nodeDB) return debug("Node DB connector is missing!");
  if (!config) return debug("Connection configuration is not provided!");
  switch (nodeDB) {
    case 'mysql':
    default:
      if (!config.createDatabaseTable || !config.multipleStatements || !config.dateStrings)
        debug("createDatabaseTable, multipleStatements, dateStrings must be set to true");
      pool = mysql.createPool(config);
  }
}
/**
 * Load multiple entities meta into cache
 * TODO Use REDIS as the global cache layer to store entities meta
 * @param entities
 * @param done
 */
function loadEntities(entities, done) {
  if(!Array.isArray(entities)) return done('The first parameter must be an Array!');

  async.map(entities, function (entity, callback) {
    loadEntity(entity, callback);
  }, function (err, result) {
    if(err){
      debug("%s.\n" +
        "Error detail: %s \n", JSON.stringify(result), err);
      return done(err);
    }
    done(null);
  })
}

/**
 * Load a specific entity's meta into cache
 *
 * { ENTITY_ID: 'person',
 *   ENTITY_DESC: 'People Entity',
 *   ROLES:
 *   [
 *     { ROLE_ID: 'system_user',
 *       ROLE_DESC: 'System user for login',
 *       RELATIONS: [{RELATION_ID: 'r_address', CARDINALITY: '[0..n]'},
 *                   {RELATION_ID: 'r_email', CARDINALITY: '[1..n]'},
 *                   {RELATION_ID: 'r_user', CARDINALITY: '[1..1]'}],
 *       RELATIONSHIPS: [{ RELATIONSHIP_ID: 'rs_user_role',
 *                         RELATIONSHIP_DESC: 'A system user has multiple use roles',
 *                         VALID_PERIOD: 3162240000,
 *                         INVOLVES: [ { ROLE_ID: 'system_user', CARDINALITY: '[1..1]' },
 *                                     { ROLE_ID: 'system_role', CARDINALITY: '[1..n]' } ]}]
 *     }
 *   ]
 * }
 *
 *[{RELATION_ID: 'person',
 *  RELATION_DESC: 'People Entity Default Relation',
 *  VERSION_NO: 1,
 *  ATTRIBUTES: []
 * },
 * {
 *   RELATION_ID: 'r_user',
 *   RELATION_DESC: 'System Logon User',
 *   VERSION_NO: 1,
 *   ATTRIBUTES: [
 *     RowDataPacket {
 *       ATTR_GUID: '13976E0B39AEBAFBDC35764518DB72D9', RELATION_ID: 'person', ATTR_NAME: 'HEIGHT', ATTR_DESC: null,
 *       DATA_ELEMENT: null, DATA_TYPE: 2, DATA_LENGTH: null, SEARCHABLE: 0, NOT_NULL: 0, UNIQUE: 0, FINALIZE: 0,
 *       AUTO_INCREMENT: 0, IS_MULTI_VALUE: 0 }
 *   ]
 *   ASSOCIATIONS: [
 *     { RIGHT_RELATION_ID: assoc.RIGHT_RELATION_ID,
 *       CARDINALITY: assoc.CARDINALITY,
 *       FOREIGN_KEY_CHECK: assoc.FOREIGN_KEY_CHECK,
 *       FIELDS_MAPPING: [{LEFT_FIELD: assoc.LEFT_FIELD, RIGHT_FIELD: assoc.RIGHT_FIELD}]
 *     }
 *   ]
 * }]
 *
 * @param entityID
 * @param done
 */
function loadEntity(entityID, done) {
  let selectSQL = "select * from ENTITY where ENTITY_ID = " + pool.escape(entityID);

  pool.query(selectSQL, function (err, entityRows) {
    if(err){
      debug("Get entity %s error: %s", entityID, err);
      done(err);
    }
    if(entityRows.length === 0) return done(null);

    let entity = {
      ENTITY_ID: entityRows[0].ENTITY_ID,
      ENTITY_DESC: entityRows[0].ENTITY_DESC,
      VERSION_NO: entityRows[0].VERSION_NO,
      CREATE_BY: entityRows[0].CREATE_BY,
      CREATE_TIME: entityRows[0].CREATE_TIME,
      LAST_CHANGE_BY: entityRows[0].LAST_CHANGE_BY,
      LAST_CHANGE_TIME: entityRows[0].LAST_CHANGE_TIME,
      ROLES: []
    };

    async.parallel([
        function(callback){
          getRelation(entity.ENTITY_ID, callback)
        },
        function(callback){
          _getEntityRoles(entity,callback);
        }],
      function (err, parallelResults) {
        if(err){
          debug("%s.\n" +
            "Error detail: %s \n", JSON.stringify(parallelResults), err);
          return done(err, entity.ENTITY_ID);
        }
        _modifyEntities(entity);
        done(null);
      }
    )
  })
}

function listEntityID() {
  return _.map(this.entities, function (entity) {
    return entity.ENTITY_ID;
  })
}

function listEntityIDbyRole(roleID) {
  const entityIDs = [];
  this.entities.forEach( entity => {
    const idx = entity.ROLES.findIndex( role => role.ROLE_ID === roleID );
    if (idx > -1) entityIDs.push(entity.ENTITY_ID);
  });
  return entityIDs;
}

function _getEntityRoles(entity, callback) {
  let selectSQL =
    "SELECT A.ROLE_ID, A.CONDITIONAL_ATTR, A.CONDITIONAL_VALUE, B.ROLE_DESC, C.RELATION_ID, C.CARDINALITY" +
    "  FROM ENTITY_ROLES AS A" +
    "  JOIN ROLE AS B" +
    "    ON A.ROLE_ID = B.ROLE_ID" +
    "  LEFT JOIN ROLE_RELATION AS C" +
    "    ON A.ROLE_ID = C.ROLE_ID" +
    " WHERE A.ENTITY_ID = " + pool.escape(entity.ENTITY_ID);

  pool.query(selectSQL, function (err, roleRows) {
    if (err)return callback(err, 'Get Roles Error');

    let groupedRoles = [];
    roleRows.forEach(function (role) {
      let idx = groupedRoles.findIndex(function (row) {
        return row.ROLE_ID === role.ROLE_ID;
      });
      if (idx === -1) {
        let roleInstance = {
            ROLE_ID: role.ROLE_ID,
            ROLE_DESC: role.ROLE_DESC,
            CONDITIONAL_ATTR: role.CONDITIONAL_ATTR,
            CONDITIONAL_VALUE: role.CONDITIONAL_VALUE,
            RELATIONS: [],
            RELATIONSHIPS: []
          };
        if (role.RELATION_ID) roleInstance.RELATIONS.push({RELATION_ID: role.RELATION_ID, CARDINALITY: role.CARDINALITY});
        groupedRoles.push(roleInstance);
      } else {
        groupedRoles[idx].RELATIONS.push({RELATION_ID: role.RELATION_ID, CARDINALITY: role.CARDINALITY});
      }
    });
    entity.ROLES = groupedRoles;

    async.parallel([
      function(callback){
        async.map(roleRows, function (role, callbackMap) {
          getRelation(role.RELATION_ID, callbackMap);
        }, function (err, mapResults) {
          if(err){
            debug("%s.\n" +
              "Error detail: %s \n", JSON.stringify(mapResults), err);
            return callback(err, entity.ENTITY_ID);
          }
          callback(null);
        });
      },
      function(callback){
        async.map(entity.ROLES, function (role, callbackMap) {
          _getRelationships(role, callbackMap);
        }, function (err, mapResults) {
          if(err){
            debug("%s.\n" +
              "Error detail: %s \n", JSON.stringify(mapResults), err);
            return callback(err, entity.ENTITY_ID);
          }
          callback(null);
        });
      }],function (err, parallelResults) {
        if(err){
          debug("%s.\n" +
            "Error detail: %s \n", JSON.stringify(parallelResults), err);
          return callback(err, entity.ENTITY_ID);
        }
        callback(null);
      });
  })
}

function getRelation(relationID, callback) { //Get Relations and their attributes and associations
  if (!relationID) return callback(null);
  let selectSQL = "select * from RELATION where RELATION_ID = " + pool.escape(relationID);
  pool.query(selectSQL, function (err, relationRows) {
    if (err)return callback(err, 'Get Relations Error');
    if(relationRows.length === 0) return callback(null);

    let relation = {
      RELATION_ID: relationRows[0].RELATION_ID,
      RELATION_DESC: relationRows[0].RELATION_DESC,
      VERSION_NO: relationRows[0].VERSION_NO
    };
    async.parallel([
      function(callback){
        _getRelationAttributes(relation, callback);
      },
      function(callback){
        _getRelationAssociations(relation, callback);
      }],
      function (err, parallelResults) {
        if(err){
          debug("%s.\n" +
            "Error detail: %s \n", JSON.stringify(parallelResults), err);
          return callback(err, relation.RELATION_ID);
        }
        _modifyRelations(relation);
        callback(null);
      }
    )
  }) //pool.query finish
}

function _getRelationAssociations(relation, callback) {
  let selectSQL =
    "select A.CARDINALITY, A.FOREIGN_KEY_CHECK, B.LEFT_RELATION_ID, B.LEFT_FIELD, B.RIGHT_RELATION_ID, B.RIGHT_FIELD" +
    "  from RELATION_ASSOCIATION as A" +
    "  join RELATION_ASSOCIATION_FIELDS_MAPPING as B" +
    "    on A.LEFT_RELATION_ID = B.LEFT_RELATION_ID" +
    "   and A.RIGHT_RELATION_ID = B.RIGHT_RELATION_ID" +
    " where A.LEFT_RELATION_ID = " + pool.escape(relation.RELATION_ID);

  pool.query(selectSQL, function (err, associations) {
    if (err) return callback(err, 'Get Associations Error');

    let groupedAssociations = [];
    associations.forEach(function (assoc) {
      let idx = groupedAssociations.findIndex(function (row) {
        return row.RIGHT_RELATION_ID === assoc.RIGHT_RELATION_ID;
      });
      if (idx === -1) {
        groupedAssociations.push({
          RIGHT_RELATION_ID: assoc.RIGHT_RELATION_ID,
          CARDINALITY: assoc.CARDINALITY,
          FOREIGN_KEY_CHECK: assoc.FOREIGN_KEY_CHECK,
          FIELDS_MAPPING: [{LEFT_FIELD: assoc.LEFT_FIELD, RIGHT_FIELD: assoc.RIGHT_FIELD}]
        });
      } else {
        groupedAssociations[idx].FIELDS_MAPPING.push({LEFT_FIELD: assoc.LEFT_FIELD, RIGHT_FIELD: assoc.RIGHT_FIELD});
      }
    });
    relation.ASSOCIATIONS = groupedAssociations;
    callback(null);
  })
}

function _getRelationAttributes(relation, callback) {
  let selectSQL =
    "select * from ATTRIBUTE where RELATION_ID = " + pool.escape(relation.RELATION_ID) +
    " order by `ORDER`";
  pool.query(selectSQL, function (err, attrRows) {
    if (err)return callback(err, 'Get Relation Attributes Error');

    relation.ATTRIBUTES = attrRows;
    callback(null);
  })
}

function _getRelationships(role, callback) {
  let selectSQL =
    "select A.RELATIONSHIP_ID, A.RELATIONSHIP_DESC, A.VALID_PERIOD" +
    "  from RELATIONSHIP as A" +
    "  join RELATIONSHIP_INVOLVES as B" +
    "    on A.RELATIONSHIP_ID = B.RELATIONSHIP_ID " +
    " where B.ROLE_ID = "+ pool.escape(role.ROLE_ID);

  pool.query(selectSQL, function (err, relationships) {
    if (err) return callback(err, 'Get Relationships Error');

    async.map(relationships, function(ele, callback){
      let relationship = {
        RELATIONSHIP_ID: ele.RELATIONSHIP_ID,
        RELATIONSHIP_DESC: ele.RELATIONSHIP_DESC,
        VALID_PERIOD: ele.VALID_PERIOD
      };

      async.parallel([
          function (callback) {
            getRelation(relationship.RELATIONSHIP_ID, callback);
          },
          function(callback){
            _getRelationshipInvolves(relationship, callback);
          }],
        function (err, parallelResults) {
          if(err){
            debug("%s.\n" +
              "Error detail: %s \n", JSON.stringify(parallelResults), err);
            return callback(err, relationship.RELATIONSHIP_ID);
          }
          role.RELATIONSHIPS.push(relationship);
          callback(null);
        });
    }, function (err, results) {
      if(err){
        debug("%s.\n" +
          "Error detail: %s \n", JSON.stringify(results), err);
        return callback(err, role.ROLE_ID);
      }
      callback(null);
    });
  });
}

function _getRelationshipInvolves(relationship, callback) {
  let selectSQL = "select ROLE_ID, CARDINALITY from RELATIONSHIP_INVOLVES where RELATIONSHIP_ID = " +
    pool.escape(relationship.RELATIONSHIP_ID);
  pool.query(selectSQL, function (err, involves) {
    if (err) return callback(err, 'Get Relationship Involves Error');
    relationship.INVOLVES = involves;
    callback(null);
  })
}

function _modifyEntities(entity){
  let idx = entities.findIndex(function (element) {
    return element.ENTITY_ID === entity.ENTITY_ID;
  });

  if (idx === -1) { //The entity doesn't exist in cache, then add it
    entities.push(entity);
  } else {  //The entity is in the cache, then update it
    entities[idx] = entity;
  }
}

function _modifyRelations(relation){
  let idx = relations.findIndex(function (element) {
    return element.RELATION_ID === relation.RELATION_ID
  });

  if (idx === -1) { //The entity doesn't exist in cache, then add it
    relations.push(relation);
  } else { //The relation is in the cache, then update it
    relations[idx] = relation;
  }
}

/**
 * Get the meta of an entity
 * @param entity_id
 */
function getEntityMeta(entity_id) {
  return entities.find(function (ele) {
    return ele.ENTITY_ID === entity_id;
  })
}

/**
 * Get the meta of a relation
 * @param relation_id
 */
function getRelationMeta(relation_id) {
  return relations.find(function (ele) {
    return ele.RELATION_ID === relation_id;
  })
}

/**
 * Check whether the relation definition is consistent with DB table
 * @param relation
 * @param callback
 */
function checkDBConsistency(relation, callback) {
  if (!relation || !relation.RELATION_ID) return callback('Relation ID is not provided!');
  let selectSQL = "select column_comment as 'ATTR_GUID', column_name as 'ATTR_NAME', ordinal_position as 'ORDER', " +
    "DATA_TYPE, CHARACTER_MAXIMUM_LENGTH as 'DATA_LENGTH', numeric_precision, numeric_scale, column_key, extra " +
    "from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='MDB' and TABLE_NAME = " + pool.escape(relation.RELATION_ID) +
    " order by ordinal_position";

  pool.query(selectSQL, function (err, columns) {
    if (err) {
      debug("Get DB table '%s' columns error: %s", relation.RELATION_ID, err);
      return callback(err);
    }

    let result = {
      tableExists: false,
      attributesOnlyInRelation: [],
      attributesOnlyInTable: [],
      changedAttributes: []
    };

    if (columns.length === 0) { 
      return callback(null, result) // Table doesn't exist
    }

    result.tableExists = true;

    columns.forEach(function (column) {
      if (column.ATTR_NAME === 'INSTANCE_GUID') return;
      const attribute = relation.ATTRIBUTES.find(function (ele) {
        return column.ATTR_GUID === ele.ATTR_GUID;
      });

      if(attribute){
        let sqlType = _map2sqlType(attribute.DATA_TYPE);
        if (sqlType !== column.DATA_TYPE) {
          result.changedAttributes.push(
            {ATTR_NAME: attribute.ATTR_NAME,
              DIFFERENCE: "Data type '" + sqlType + "' is different with the DB data type '" + column.DATA_TYPE + "'"});
        } else {
          switch (sqlType){
            case 'varchar':
              if (attribute.DATA_LENGTH !== column.DATA_LENGTH){
                result.changedAttributes.push(
                {ATTR_NAME: attribute.ATTR_NAME,
                  DIFFERENCE: "Character length " + attribute.DATA_LENGTH + " is different with the DB data length " + column.DATA_LENGTH});
              }
              break;
            case 'decimal':
              if (attribute.DATA_LENGTH !== column['numeric_precision'] || attribute.DECIMAL !== column['numeric_scale']) {
                result.changedAttributes.push(
                  {ATTR_NAME: attribute.ATTR_NAME,
                    DIFFERENCE: "Decimal (" + attribute.DATA_LENGTH + "," + attribute.DECIMAL + ") is different with the DB decimal ("
                      + column.DATA_LENGTH + "," + attribute.DECIMAL + ")"});
              }
              break;
            default:
          }

          if (attribute.PRIMARY_KEY){
            if ((column['extra'] !== 'auto_increment' && attribute.AUTO_INCREMENT) ||
                (column['extra'] === 'auto_increment' && !attribute.AUTO_INCREMENT))
            {
              result.changedAttributes.push(
                {ATTR_NAME: attribute.ATTR_NAME,
                  DIFFERENCE: "Auto Increment is different"});
            }
            if (column['column_key'] !== 'PRI') {
              result.changedAttributes.push(
                {ATTR_NAME: attribute.ATTR_NAME,
                  DIFFERENCE: "Primary key is not checked in DB"});
            }
          } else {
            if (column['column_key'] === 'PRI') {
              result.changedAttributes.push(
                {ATTR_NAME: attribute.ATTR_NAME,
                  DIFFERENCE: "Primary key is still checked in DB"});
            }
          }
        }
      }else{
        result.attributesOnlyInTable.push(column.ATTR_NAME);
      }
    });

    relation.ATTRIBUTES.forEach(function (attribute) {
      const found = columns.findIndex(function (ele) {
        return attribute.ATTR_GUID === ele.ATTR_GUID;
      });
      if (found === -1) { // Not exist in DB table
        result.attributesOnlyInRelation.push(attribute.ATTR_NAME)
      }
    });

    if (result.attributesOnlyInRelation.length > 0 ||
        result.attributesOnlyInTable.length > 0 ||
        result.changedAttributes.length > 0){
      callback(null, result);
    } else {
      callback(null, null);
    }
  })
}

/**
 * sync the relation definition to DB table
 ALTER TABLE `MDB`.`rs_marriage`
 ADD COLUMN `ORDER` INT UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT COMMENT 'Marriage Order' AFTER `INSTANCE_GUID`,
 DROP PRIMARY KEY,
 ADD PRIMARY KEY (`ORDER`, `INSTANCE_GUID`),
 ADD UNIQUE INDEX `ORDER_UNIQUE` (`ORDER` ASC);
 * @param relation
 * @param callback
 */
function syncDBTable(relation, callback) {

  let selectSQL = "select column_comment as 'ATTR_GUID', column_name as 'ATTR_NAME', ordinal_position as 'ORDER', " +
    "DATA_TYPE, CHARACTER_MAXIMUM_LENGTH as 'DATA_LENGTH', numeric_precision, numeric_scale, column_key, extra " +
    "from INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA='MDB' and TABLE_NAME = " + pool.escape(relation.RELATION_ID) +
    " order by ordinal_position";

  pool.query(selectSQL, function (err, columns) {
    if (err) {
      debug("Get DB table '%s' columns error: %s", relation.RELATION_ID, err);
      return callback(err);
    }

    if (columns.length === 0) { // No such table in DB
      createDBTable(relation, callback);
      return;
    }

    let alterTable = '';
    const primaryKeys = [];
    let isPrimaryKeyChanged = false;
    columns.forEach(function (column) {
      if (column.ATTR_NAME === 'INSTANCE_GUID') return;
      const attribute = relation.ATTRIBUTES.find(function (ele) {
        return column.ATTR_GUID === ele.ATTR_GUID;
      });
      if (attribute) {
        let changeColumn = " change column " + pool.escapeId(column.ATTR_NAME) + " " + pool.escapeId(attribute.ATTR_NAME);
        let isChanged = column.ATTR_NAME !== attribute.ATTR_NAME;
        let sqlType = _map2sqlType(attribute.DATA_TYPE);
        switch (sqlType){
          case 'varchar':
            changeColumn += " varchar(" + attribute.DATA_LENGTH + ")";
            isChanged = isChanged || attribute.DATA_LENGTH !== column.DATA_LENGTH;
            break;
          case 'decimal':
            changeColumn += " decimal(" + attribute.DATA_LENGTH + "," + attribute.DECIMAL+ ")";
            isChanged = isChanged || attribute.DATA_LENGTH !== column['numeric_precision'] || attribute.DECIMAL !== column['numeric_scale'] ;
            break;
          default:
            changeColumn += " " + sqlType;
        }
        isChanged = isChanged || sqlType !== column.DATA_TYPE;

        if (attribute.PRIMARY_KEY){
          changeColumn += " NOT NULL";
          if (attribute.AUTO_INCREMENT) changeColumn += " AUTO_INCREMENT";
          isChanged = isChanged || (column['extra'] !== 'auto_increment' && attribute.AUTO_INCREMENT) ||
            (column['extra'] === 'auto_increment' && !attribute.AUTO_INCREMENT);
          primaryKeys.push(attribute.ATTR_NAME);
          if (column['column_key'] !== 'PRI') isPrimaryKeyChanged = true;
        } else {
          changeColumn += " NULL DEFAULT NULL";
          if (column['column_key'] === 'PRI') {
            isPrimaryKeyChanged = true;
            isChanged = true;
          }
        }
        if(isChanged)
          alterTable += changeColumn + " COMMENT " + pool.escape(attribute.ATTR_GUID) + ",";
      } else {
        alterTable += " drop column " + pool.escapeId(column.ATTR_NAME) + ",";
      }
    });

    relation.ATTRIBUTES.forEach(function (attribute) {
      const found = columns.findIndex(function (ele) {
        return attribute.ATTR_GUID === ele.ATTR_GUID;
      });
      if (found === -1){ // Not exist in DB table
        alterTable += " add column " + pool.escapeId(attribute.ATTR_NAME);
        let sqlType = _map2sqlType(attribute.DATA_TYPE);
        switch (sqlType){
          case 'varchar':
            alterTable += " varchar(" + attribute.DATA_LENGTH + ")";
            break;
          case 'decimal':
            alterTable += " decimal(" + attribute.DATA_LENGTH + "," + attribute.DECIMAL+ ")";
            break;
          default:
            alterTable += " " + sqlType;
        }
        if (attribute.PRIMARY_KEY){
          alterTable += " NOT NULL";
          if (attribute.AUTO_INCREMENT) alterTable += " AUTO_INCREMENT";
          primaryKeys.push(attribute.ATTR_NAME);
          isPrimaryKeyChanged = true;
        } else {
          alterTable += " NULL DEFAULT NULL";
        }
        alterTable += " COMMENT " + pool.escape(attribute.ATTR_GUID) + ",";
      }
    });

    if(isPrimaryKeyChanged) {
      alterTable += "drop primary key, ";
      let addPrimaryKey = "add primary key (";
      if (relation.RELATION_ID.substring(0,2) === 'r_' && primaryKeys.length === 0)
        return callback('Relation must have primary key(s)');
      primaryKeys.forEach(function (primaryKey, i) {
        if (i === 0){
          addPrimaryKey += pool.escapeId(primaryKey);
        } else {
          addPrimaryKey += ", " + pool.escapeId(primaryKey);
        }
      });
      alterTable += addPrimaryKey + ")";
    }else{
      alterTable = alterTable.slice(0, -1); // Remove the last ","
    }

    if (alterTable){
      executeSQL("alter table " + pool.escapeId(relation.RELATION_ID) + alterTable, callback);
    } else {
      callback(null);
    }
  })
}

/**
 * Generate DDL of create a table:
 * CREATE TABLE `MDB`.`test_tab` (
 `FIELD1` INT NOT NULL AUTO_INCREMENT COMMENT '<ATTR_GUID>',
 `FIELD2` VARCHAR(45) NOT NULL COMMENT '<ATTR_GUID>',
 `FIELD3` TINYINT(1) NULL COMMENT '<ATTR_GUID>',
 `FIELD4` DECIMAL(23,2) NULL COMMENT '<ATTR_GUID>',
 `FIELD5` TEXT NULL COMMENT '<ATTR_GUID>',
 `FIELD6` BLOB NULL COMMENT '<ATTR_GUID>',
 `FIELD7` DATE NULL COMMENT '<ATTR_GUID>',
 `FIELD8` DATETIME NULL COMMENT '<ATTR_GUID>',
 PRIMARY KEY (`FIELD1`, `FIELD2`));
 */
function createDBTable(relation, callback) {
  let createTable = "create table " + pool.escapeId(relation.RELATION_ID) + " (";
  const primaryKeys = [];
  if (relation.RELATION_ID.substring(0,2) !== 'r_') { // Entity or Relationship
    createTable += "`INSTANCE_GUID` varchar(32) NOT NULL, ";
  }
  relation.ATTRIBUTES.forEach(function(attribute){
    createTable += pool.escapeId(attribute.ATTR_NAME) + " " +
      _generateColumnType(attribute.DATA_TYPE, attribute.DATA_LENGTH, attribute.DECIMAL);
    if(attribute.PRIMARY_KEY){
      primaryKeys.push(attribute.ATTR_NAME);
      createTable += " NOT NULL ";
      if(attribute.AUTO_INCREMENT) createTable += "AUTO_INCREMENT ";
    } else {
      createTable += " NULL ";
    }
    createTable += "COMMENT " + pool.escape(attribute.ATTR_GUID) + ", ";
  });
  if (relation.RELATION_ID.substring(0,2) === 'r_'){
    createTable += " `INSTANCE_GUID` varchar(32) NULL";
    if (primaryKeys.length === 0){
      return callback("Relation must have primary key(s)");
    }else{
      createTable += ", PRIMARY KEY ";
      primaryKeys.forEach(function (primaryKey, i) {
        if (i === 0){
          createTable += "(" + pool.escapeId(primaryKey);
        } else {
          createTable += "," + pool.escapeId(primaryKey);
        }
      });
      createTable += "))";
    }
  } else {
    if (primaryKeys.length > 0)
      return callback("Entity or Relationship table doesn't have primary key other than INSTANCE_GUID");
    createTable += " PRIMARY KEY (`INSTANCE_GUID`))";
  }
  executeSQL(createTable, callback);
}

function _map2sqlType(dataType) {
  return dataTypes.find(function (ele) {
    return ele.key === dataType;
  }).sqlType;
}

function _generateColumnType(dataType, length, decimal) {
  let columnType = '';
  switch (dataType) {
    case 1: // varchar
      columnType = 'varchar(' + length + ')';
      break;
    case 3: // boolean
      columnType = 'tinyint(1)';
      break;
    case 4:
      if(!decimal) decimal = 0;
      columnType = 'decimal(' + length + ',' + decimal + ')';
      break;
    default:
      columnType = _map2sqlType(dataType);
  }
  return columnType;
}

/**
 * Execute select SQL, no update/delete/insert
 * @param selectSQL
 * @param callback
 */
function executeSQL(selectSQL,callback) {
  pool.getConnection(function (err, conn) {
    if (err) {
      debug("mySql POOL ==> %s", err);
      return callback(err);
    }

    conn.query(selectSQL, function (err, rows) {
      if (err) {
        debug("mySql Select ==> %s", selectSQL);
        conn.release();
        return callback(err);
      }
      conn.release();
      callback(null, rows);
    })
  });
}

/**
 * Run update/delete/insert SQLs in parallel
 * @param updateSQLs
 * @param callback
 */
function doUpdatesParallel(updateSQLs, callback){
  pool.getConnection(function(err, conn){
    if (err) {
      debug("mySql POOL ==> %s", err);
      return callback(err);
    }
    conn.beginTransaction(function(err){
      if (err) {
        debug("mySql TRANSACTION error ==> %s", err);
        return callback(err);
      }

      async.map(updateSQLs, function (updateSQL, callback){
        conn.query(updateSQL, function(err,result){
          if (err) {
            debug("mySql Update Error ==> %s", updateSQL);
            conn.rollback(function(){
              callback(err, result);
            });
            return;
          }
          callback(null,  result);
        })
      },function (err, results) {
        if (err) {
          debug("Error occurs in doUpdatesParallel() when executing update SQLs ==> %s", err);
          conn.release();
          return callback(err, results);
        }
        conn.commit(function(err){
          if(err){
            debug("mySql Commit ==> %s",err);
            conn.rollback(function(){
              callback(err, results);
            });
            conn.release();
            return;
          }
          conn.release();
          callback(null, results);
        })
      })
    })
  })
}

/**
 * Run update/delete/insert SQLs in sequential
 * @param updateSQLs
 * @param callback
 */
function doUpdatesSeries(updateSQLs, callback){
  pool.getConnection(function(err, conn){
    if (err) {
      debug("mySql POOL ==> %s", err);
      return callback(err);
    }
    conn.beginTransaction(function(err){
      if (err) {
        debug("mySql TRANSACTION error ==> %s", err);
        return callback(err);
      }

      async.mapSeries(updateSQLs, function (updateSQL, callback){
        conn.query(updateSQL, function(err,result){
          if (err) {
            debug("mySql Update Error ==> %s", updateSQL);
            conn.rollback(function(){
              callback(err, result);
            });
            return;
          }
          callback(null, result);
        })
      },function (err, results) {
        if (err) {
          debug("Error occurs in doUpdatesSeries() when executing update SQLs ==> %s", err);
          conn.release();
          return callback(err, results);
        }
        conn.commit(function(err){
          if(err){
            debug("mySql Commit ==> %s",err);
            conn.rollback(function(){
              callback(err, results);
            });
            conn.release();
            return;
          }
          conn.release();
          callback(null, results);
        })
      })
    })
  })
}

/**
 * Close the Database
 * @param callback
 */
function closeMDB(callback){
  pool.end(function(err){
    if(err)debug('mysql connection pool closing error: %s',err);
    callback();
  })
}
