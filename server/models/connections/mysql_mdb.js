/**
 * Created by VinceZK on 6/16/18.
 */
const debug = require('debug')('darkhouse:mysql_mdb');
const async = require('async');
const mysql = require('mysql');
const pool = mysql.createPool({
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
const _ = require('underscore');
const entities = [];
const relations = [];

module.exports = {
  pool: pool,
  entities: entities,
  relations: relations,

  loadEntity: loadEntity,
  loadEntities: loadEntities,
  getEntityMeta: getEntityMeta,
  getRelationMeta: getRelationMeta,
  executeSQL: executeSQL,
  doUpdatesParallel: doUpdatesParallel,
  doUpdatesSeries: doUpdatesSeries,
  closeMDB: closeMDB
};

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
      ATTRIBUTES: [],
      ROLES: []
    };

    async.parallel([
        function(callback){
          _getEntityAttributes(entity, callback);
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

function _getEntityAttributes(entity, callback) {
  let selectSQL = "select * from ATTRIBUTE where RELATION_ID = " + pool.escape(entity.ENTITY_ID) +
                  " order by `ORDER`";
  pool.query(selectSQL, function (err, attrRows) {
    if (err)return callback(err, 'Get Attributes Error');
    entity.ATTRIBUTES = attrRows;

    //Get searchable attributes and their index tables
    let indexTableName;
    entity.UNIQUE_ATTRIBUTE_INDICES = [];
    entity.ATTRIBUTE_INDICES = [];
    _.each(_.where(entity.ATTRIBUTES, {SEARCHABLE: 1, UNIQUE: 1}), function (sAttr) {
      indexTableName = "UIX_" + sAttr['ATTR_GUID'];
      entity.UNIQUE_ATTRIBUTE_INDICES.push(
        {ATTR_NAME: sAttr.ATTR_NAME, IDX_TABLE: indexTableName, AUTO_INCREMENT: sAttr.AUTO_INCREMENT})
    });
    _.each(_.where(entity.ATTRIBUTES, {SEARCHABLE: 1, UNIQUE: 0}), function (sAttr) {
      indexTableName = "NIX_" + sAttr['ATTR_GUID'];
      entity.ATTRIBUTE_INDICES.push({ATTR_NAME: sAttr.ATTR_NAME, IDX_TABLE: indexTableName})
    });

    callback(null);
  })
}

function _getEntityRoles(entity, callback) {
  let selectSQL =
    "SELECT A.ROLE_ID, B.ROLE_DESC, C.RELATION_ID, C.CARDINALITY" +
    "  FROM ENTITY_ROLES AS A" +
    "  JOIN ROLE AS B" +
    "    ON A.ROLE_ID = B.ROLE_ID" +
    "  JOIN ROLE_RELATION AS C" +
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
        groupedRoles.push({
          ROLE_ID: role.ROLE_ID,
          ROLE_DESC: role.ROLE_DESC,
          RELATIONS: [{RELATION_ID: role.RELATION_ID, CARDINALITY: role.CARDINALITY}],
          RELATIONSHIPS: []
        });
      } else {
        groupedRoles[1].RELATIONS.push({RELATION_ID: role.RELATION_ID, CARDINALITY: role.CARDINALITY});
      }
    });
    entity.ROLES = groupedRoles;

    async.parallel([
      function(callback){
        async.map(roleRows, function (role, callbackMap) {
          _getRelation(role.RELATION_ID, callbackMap);
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

function _getRelation(relationID, callback) { //Get Relations and their attributes and associations
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
      let selectSQL =
        "select ROLE_ID, CARDINALITY from RELATIONSHIP_INVOLVES where RELATIONSHIP_ID = " +
        pool.escape(relationship.RELATIONSHIP_ID);
      pool.query(selectSQL, function (err, involves) {
        if (err) return callback(err, 'Get Relationship Involves Error');
        relationship.INVOLVES = involves;
        role.RELATIONSHIPS.push(relationship);
        callback(null);
      })
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
