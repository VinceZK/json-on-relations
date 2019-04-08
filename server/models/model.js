/*
Created by VinceZK on 2018.10.02
 */
const entityDB = require('./connections/sql_mdb.js');
const timeUtil = require('../util/date_time.js');
const guid = require('../util/guid.js');
const Message = require('ui-message').Message;
const MsgArrayStore = require('ui-message').MsgArrayStore;
const msgArray = require('./message_model.js');

const msgStore = new MsgArrayStore(msgArray);
const message = new Message(msgStore, 'EN');

module.exports = {
  listEntityType: listEntityType,
  getEntityTypeDesc: getEntityTypeDesc,
  saveEntityType: saveEntityType,
  listRelation: listRelation,
  getRelationDesc: getRelationDesc,
  saveRelation: saveRelation,
  listRelationship: listRelationship,
  getRelationship: getRelationship,
  getRelationshipDesc: getRelationshipDesc,
  saveRelationship: saveRelationship,
  listRole: listRole,
  getRole: getRole,
  getRoleDesc: getRoleDesc,
  saveRole: saveRole
};

function listEntityType(term, callback) {
  let selectSQL = "select * from ENTITY";
  let searchTerm = term?term.trim():null;
  if (searchTerm) {
    searchTerm = '%' + searchTerm + '%';
    selectSQL = selectSQL + " where ENTITY_ID like " + entityDB.pool.escape(searchTerm) +
      " or ENTITY_DESC like " + entityDB.pool.escape(searchTerm) +
      " order by LAST_CHANGE_TIME desc limit 10";
  } else {
    selectSQL = selectSQL + " order by LAST_CHANGE_TIME desc limit 10";
  }
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });
}

function getEntityTypeDesc(entityID, callback) {
  let selectSQL =
    "select ENTITY_DESC from ENTITY where ENTITY_ID = "+ entityDB.pool.escape(entityID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'ENTITY_TYPE_NOT_EXIST', 'E', entityID));
    callback(null, rows[0].ENTITY_DESC);
  })
}

function saveEntityType(entityType, userID, callback) {
  if (!entityType || entityType === {}) {
    return callback(message.report('MODEL', 'NOTHING_TO_SAVE', 'W'));
  }

  if (!entityType.ENTITY_ID) {
    return callback(message.report('MODEL', 'ENTITY_ID_MISSING', 'E'));
  }

  const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
  const updateSQLs = [];
  if (entityType.action === 'update') {
    let updateSQL = "update ENTITY set LAST_CHANGE_BY = " + entityDB.pool.escape(userID) +
      ", LAST_CHANGE_TIME = " + entityDB.pool.escape(currentTime) + ", VERSION_NO = VERSION_NO + 1";
    if (entityType.ENTITY_DESC !== null)
      updateSQL = updateSQL + ", ENTITY_DESC = " + entityDB.pool.escape(entityType.ENTITY_DESC);
    updateSQL = updateSQL + " where ENTITY_ID = " + entityDB.pool.escape(entityType.ENTITY_ID);
    updateSQLs.push(updateSQL);
  } else if (entityType.action === 'add') {
    let insertSQL = "insert into ENTITY ( ENTITY_ID, ENTITY_DESC, VERSION_NO, CREATE_BY, CREATE_TIME, LAST_CHANGE_BY, LAST_CHANGE_TIME)" +
      " values ( " + entityDB.pool.escape(entityType.ENTITY_ID) + ", " + entityDB.pool.escape(entityType.ENTITY_DESC) +
      ", 1, " + entityDB.pool.escape(userID) + ", " + entityDB.pool.escape(currentTime) + ", " + entityDB.pool.escape(userID) +
      ", "  + entityDB.pool.escape(currentTime) + " )";
    updateSQLs.push(insertSQL);
  }

  let relation = {
    action: entityType.action,
    RELATION_ID: entityType.ENTITY_ID,
    RELATION_DESC: entityType.ENTITY_DESC
  };
  _generateUpdateRelationSQL(relation, updateSQLs, userID, currentTime);

  if (entityType.ATTRIBUTES) {
    let errMessages = [];
    entityType.ATTRIBUTES.forEach(function (attribute) {
      if (!attribute.RELATION_ID){
        attribute.RELATION_ID = entityType.ENTITY_ID;
      } else {
        if (attribute.RELATION_ID !== entityType.ENTITY_ID) {
          errMessages.push(
            message.report('MODEL', 'ATTRIBUTE_NOT_BELONG_TO_RELATION', 'E',
              attribute.ATTR_NAME, attribute.RELATION_ID, entityType.ENTITY_ID));}
      }
      updateSQLs.push(_generateUpdateAttributeSQL(attribute));
    });
    if(errMessages.length > 0 ){
      return callback(errMessages);
    }
  }

  if (entityType.ROLES) {
    entityType.ROLES.forEach(function (role) {
      updateSQLs.push(_generateUpdateRoleSQL(role, entityType.ENTITY_ID));
    })
  }

  entityDB.doUpdatesParallel(updateSQLs, function (err) {
    if (err) {
      callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    } else {
      _syncDBTable(relation.RELATION_ID, callback);
    }
  })
}

function listRelation(term, callback) {
  let selectSQL = "select * from RELATION where substr(`RELATION_ID`, 1, 2) = 'r_'";
  let searchTerm = term?term.trim():null;
  if (searchTerm) {
    searchTerm = '%' + searchTerm + '%';
    selectSQL = selectSQL + " and (RELATION_ID like " + entityDB.pool.escape(searchTerm) +
      " or RELATION_DESC like " + entityDB.pool.escape(searchTerm) +
      ") order by LAST_CHANGE_TIME desc limit 10";
  } else {
    selectSQL = selectSQL + " order by LAST_CHANGE_TIME desc limit 10";
  }
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });
}

function getRelationDesc(relationID, callback) {
  let selectSQL =
    "select RELATION_DESC from RELATION where RELATION_ID = "+ entityDB.pool.escape(relationID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'RELATION_NOT_EXIST', 'E', relationID));
    callback(null, rows[0].RELATION_DESC);
  })
}

function saveRelation(relation, userID, callback) {
  if (!relation || relation === {}) {
    return callback(message.report('MODEL', 'NOTHING_TO_SAVE', 'W'));
  }

  if (!relation.RELATION_ID) {
    return callback(message.report('MODEL', 'RELATION_ID_MISSING', 'E'));
  }

  const updateSQLs = [];
  const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
  _generateUpdateRelationSQL(relation, updateSQLs, userID, currentTime);

  if (relation.ATTRIBUTES) {
    let errMessages = [];
    relation.ATTRIBUTES.forEach(function (attribute) {
      if (!attribute.RELATION_ID){
        attribute.RELATION_ID = relation.RELATION_ID;
      } else {
        if (attribute.RELATION_ID !== relation.RELATION_ID) {
          errMessages.push(
            message.report('MODEL', 'ATTRIBUTE_NOT_BELONG_TO_RELATION', 'E',
              attribute.ATTR_NAME, attribute.RELATION_ID, relation.RELATION_ID));}
      }
      updateSQLs.push(_generateUpdateAttributeSQL(attribute));
    });
    if(errMessages.length > 0 ){
      return callback(errMessages);
    }
  }

  if (relation.ASSOCIATIONS && Array.isArray(relation.ASSOCIATIONS)) {
    relation.ASSOCIATIONS.forEach(function (association) {
      _generateUpdateAssociation(relation.RELATION_ID, association, updateSQLs);
    })
  }

  entityDB.doUpdatesParallel(updateSQLs, function (err) {
    if (err) {
      callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    } else {
      _syncDBTable(relation.RELATION_ID, callback);
    }
  })
}

function _generateUpdateRelationSQL(relation, updateSQLs, userID, currentTime) {
  if (relation.action === 'update') {
    let updateSQL = "update RELATION set LAST_CHANGE_BY = " + entityDB.pool.escape(userID) + ", LAST_CHANGE_TIME = "
      + entityDB.pool.escape(currentTime) + ", VERSION_NO = VERSION_NO + 1";
    if (relation.RELATION_DESC !== null)
      updateSQL = updateSQL + ", RELATION_DESC = " + entityDB.pool.escape(relation.RELATION_DESC);
    updateSQL = updateSQL + " where RELATION_ID = " + entityDB.pool.escape(relation.RELATION_ID);
    updateSQLs.push(updateSQL);
  } else if (relation.action === 'add') {
    let insertSQL = "insert into RELATION ( RELATION_ID, RELATION_DESC, VERSION_NO, CREATE_BY, CREATE_TIME, LAST_CHANGE_BY, LAST_CHANGE_TIME)" +
      " values ( " + entityDB.pool.escape(relation.RELATION_ID) + ", " + entityDB.pool.escape(relation.RELATION_DESC) +
      ", 1, " + entityDB.pool.escape(userID) + ", " + entityDB.pool.escape(currentTime) + ", " + entityDB.pool.escape(userID)
      + ", " + entityDB.pool.escape(currentTime) + " )";
    updateSQLs.push(insertSQL);
  }
}

function _generateUpdateAssociation(relationID, association, updateSQLs) {
  let whereStr = " where LEFT_RELATION_ID = " + entityDB.pool.escape(relationID) +
                 " and RIGHT_RELATION_ID = " + entityDB.pool.escape(association.RIGHT_RELATION_ID);
  switch (association.action) {
    case 'update':
      let updateSQL;
      if (association.CARDINALITY)
        updateSQL = "update RELATION_ASSOCIATION set CARDINALITY = " + entityDB.pool.escape(association.CARDINALITY);
      if (association.FOREIGN_KEY_CHECK)
        updateSQL = updateSQL? updateSQL + ", FOREIGN_KEY_CHECK = " + entityDB.pool.escape(association.FOREIGN_KEY_CHECK)
               :"update RELATION_ASSOCIATION set FOREIGN_KEY_CHECK = " + entityDB.pool.escape(association.FOREIGN_KEY_CHECK);
      if (updateSQL)
        updateSQLs.push(updateSQL += whereStr);
      if (association.FIELDS_MAPPING && Array.isArray(association.FIELDS_MAPPING)){
        association.FIELDS_MAPPING.forEach(function (fieldsMap) {
          if (fieldsMap.action === 'delete') {
            updateSQLs.push("delete from RELATION_ASSOCIATION_FIELDS_MAPPING where " +
            "LEFT_RELATION_ID = " + entityDB.pool.escape(relationID) +
            " and LEFT_FIELD = " + entityDB.pool.escape(fieldsMap.LEFT_FIELD) +
            " and RIGHT_RELATION_ID = " + entityDB.pool.escape(association.RIGHT_RELATION_ID) +
            " and RIGHT_FIELD = " + entityDB.pool.escape(fieldsMap.RIGHT_FIELD));
          } else { // All add
            updateSQLs.push("insert into RELATION_ASSOCIATION_FIELDS_MAPPING" +
            "( LEFT_RELATION_ID, LEFT_FIELD, RIGHT_RELATION_ID, RIGHT_FIELD ) values ( " +
              entityDB.pool.escape(relationID) + ", " + entityDB.pool.escape(fieldsMap.LEFT_FIELD) + ", " +
              entityDB.pool.escape(association.RIGHT_RELATION_ID) + ", " + entityDB.pool.escape(fieldsMap.RIGHT_FIELD) + " )");
          }
        })
      }
      break;
    case 'delete':
      updateSQLs.push("delete from RELATION_ASSOCIATION" + whereStr);
      updateSQLs.push("delete from RELATION_ASSOCIATION_FIELDS_MAPPING where LEFT_RELATION_ID = " + entityDB.pool.escape(relationID));
      break;
    case 'add':
    default:
      updateSQLs.push("insert into RELATION_ASSOCIATION " +
        "(LEFT_RELATION_ID, RIGHT_RELATION_ID, CARDINALITY, FOREIGN_KEY_CHECK) values ( " +
        entityDB.pool.escape(relationID) + ", " + entityDB.pool.escape(association.RIGHT_RELATION_ID) +
      ", " + entityDB.pool.escape(association.CARDINALITY) + ", " + entityDB.pool.escape(association.FOREIGN_KEY_CHECK) + ")");
      association.FIELDS_MAPPING.forEach(function (fieldsMap) {
        updateSQLs.push("insert into RELATION_ASSOCIATION_FIELDS_MAPPING" +
          "( LEFT_RELATION_ID, LEFT_FIELD, RIGHT_RELATION_ID, RIGHT_FIELD ) values ( " +
          entityDB.pool.escape(relationID) + ", " + entityDB.pool.escape(fieldsMap.LEFT_FIELD) + ", " +
          entityDB.pool.escape(association.RIGHT_RELATION_ID) + ", " + entityDB.pool.escape(fieldsMap.RIGHT_FIELD) + " )");
      })
  }
}

function _syncDBTable(relationID, callback) {
  let selectSQL = "select * from ATTRIBUTE where RELATION_ID = " + entityDB.pool.escape(relationID) + " order by `ORDER`";
  entityDB.executeSQL(selectSQL, function (err, attributes) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    let relation = { RELATION_ID: relationID, ATTRIBUTES: attributes};
    entityDB.syncDBTable(relation, function (err) {
      if(err) callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
      else callback(null);
    });
  })
}
/**
 * Update data in the table ATTRIBUTE.
 * For entity attributes, which are not derived from a relation, have attributes "UNIQUE" and "SEARCHABLE".
 * These 2 attributes of a Attribute are used to decide whether to create a unique index table(UIX_) or
 * a non-unique index table(NIX_). Creation such 2 kinds of index tables not only requires meta data integrity,
 * but also the application data integrity. If an Attribute is before not searchable, but then changed to searchable,
 * its existing data requires an index rebuild, which populates data into the new index table and is supposed to
 * take some time. Thus, the process should not be included in the normal Entity changing activities,
 * but should be separated into an consistency checking utility process. A separate tool will be given
 * which can check if index tables exist in the database according to the model definition. If not, a batch process will
 * create and populate them.
 *
 * Maybe, keeping ENTITY level attributes is not a good idea. Why not all use RELATION? While the current concept of
 * using RELATION is indirectly through ROLE, the ENTITY attributes do not always have ROLEs. For example, height or age
 * of a person, why one has to assign a ROLE to a person ENTITY so that it can have height or age? If each ENTITY is
 * by default assign a RELATION to include all ENTITY level attributes, then it seems everything is much less confusion
 * and the design is more tight.
 *
 * The default relation has the same name with ENTITY. Table is altered when attributes are added or removed from the entity.
 * Whether an ENTITY should be allowed to have more than one default relation? Not necessary, so far as my understanding.
 * All entity level attributes can not exist independently without an entity instance.
 * It is always a literal stuff without any independent physic counterparts. For example, Height, Age, Hobbies, and so on.
 * Those social attributes, like marriage, ownership, position, address, and so on are more well represented using ROLE
 * and RELATIONSHIP.
 * @param attribute
 * @returns {*}
 * @private
 */
function _generateUpdateAttributeSQL(attribute) {
  let updateSQL;
  switch (attribute.action) {
    case 'update':
      Object.keys(attribute).forEach(function (key) {
        if (key === 'action' || key === 'ATTR_GUID') return;
        updateSQL = !updateSQL? "update ATTRIBUTE set " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(attribute[key])
          :updateSQL + ", " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(attribute[key]);
      });
      if (updateSQL) updateSQL += " where ATTR_GUID = " + entityDB.pool.escape(attribute['ATTR_GUID']);
      break;
    case 'delete':
      updateSQL = "delete from ATTRIBUTE where ATTR_GUID = " + entityDB.pool.escape(attribute.ATTR_GUID);
      break;
    case 'add':

    default:
      let columnString = "( `ATTR_GUID`";
      let attrGUID = attribute.ATTR_GUID? attribute.ATTR_GUID : guid.genTimeBased();
      let valueString = "( '" + attrGUID + "'";
      Object.keys(attribute).forEach(function (key) {
        if (key === 'action' || key === 'ATTR_GUID') return;
        columnString += ", " + entityDB.pool.escapeId(key) ;
        valueString += ", " + entityDB.pool.escape(attribute[key]);
      });
      columnString += ") ";
      valueString += ") ";
      updateSQL = "insert into ATTRIBUTE " + columnString + " values " + valueString;
  }
  return updateSQL;
}

function _generateUpdateRoleSQL(role, entityID) {
  let updateSQL;
  switch (role.action) {
    case 'delete':
      updateSQL = "delete from ENTITY_ROLES where ENTITY_ID = " + entityDB.pool.escape(entityID) +
        " and ROLE_ID = " + entityDB.pool.escape(role.ROLE_ID);
      break;
    case 'add':

    default:
      updateSQL = "insert into ENTITY_ROLES ( ENTITY_ID, ROLE_ID ) values ( " + entityDB.pool.escape(entityID) + ", "
        + entityDB.pool.escape(role.ROLE_ID) + " )";
  }
  return updateSQL;
}

function listRelationship(term, callback) {
  let selectSQL = "select * from RELATIONSHIP";
  let searchTerm = term?term.trim():null;
  if (searchTerm) {
    searchTerm = '%' + searchTerm + '%';
    selectSQL = selectSQL + " where RELATIONSHIP_ID like " + entityDB.pool.escape(searchTerm) +
      " or RELATIONSHIP_DESC like " + entityDB.pool.escape(searchTerm) +
      " order by LAST_CHANGE_TIME desc limit 10";
  } else {
    selectSQL = selectSQL + " order by LAST_CHANGE_TIME desc limit 10";
  }
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });
}

function getRelationshipDesc(relationshipID, callback) {
  let selectSQL =
    "select RELATIONSHIP_DESC from RELATIONSHIP where RELATIONSHIP_ID = "+ entityDB.pool.escape(relationshipID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'RELATIONSHIP_NOT_EXIST', 'E', relationshipID));
    callback(null, rows[0].RELATIONSHIP_DESC);
  })
}

function getRelationship(relationshipID, callback) {
  let selectSQL =
    "select * from RELATIONSHIP where RELATIONSHIP_ID = "+ entityDB.pool.escape(relationshipID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'RELATIONSHIP_NOT_EXIST', 'E', relationshipID));
    let relationship = rows[0];
    let selectSQL =
      "select A.ROLE_ID, B.ROLE_DESC, A.CARDINALITY, A.DIRECTION from RELATIONSHIP_INVOLVES as A" +
      " join ROLE as B on A.ROLE_ID = B.ROLE_ID where RELATIONSHIP_ID = "
      + entityDB.pool.escape(relationshipID);
    entityDB.executeSQL(selectSQL, function (err, rows) {
      if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
      relationship['INVOLVES'] = rows;
      callback(null, relationship);
    })
  })
}

function saveRelationship(relationship, userID, callback) {
  if (!relationship || relationship === {}) {
    return callback(message.report('MODEL', 'NOTHING_TO_SAVE', 'W'));
  }

  if (!relationship.RELATIONSHIP_ID) {
    return callback(message.report('MODEL', 'ENTITY_ID_MISSING', 'E'));
  }

  const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
  const updateSQLs = [];
  if (relationship.action === 'update') {
    let updateSQL = "update RELATIONSHIP set LAST_CHANGE_BY = " + entityDB.pool.escape(userID) +
      ", LAST_CHANGE_TIME = " + entityDB.pool.escape(currentTime) + ", VERSION_NO = VERSION_NO + 1";
    if (relationship.RELATIONSHIP_DESC !== null)
      updateSQL += ", RELATIONSHIP_DESC = " + entityDB.pool.escape(relationship.RELATIONSHIP_DESC);
    if (relationship.VALID_PERIOD !== null)
      updateSQL += ", VALID_PERIOD = " + entityDB.pool.escape(relationship.VALID_PERIOD);
    updateSQL += " where RELATIONSHIP_ID = " + entityDB.pool.escape(relationship.RELATIONSHIP_ID);
    updateSQLs.push(updateSQL);
  } else if (relationship.action === 'add') {
    let insertSQL = "insert into RELATIONSHIP ( RELATIONSHIP_ID, RELATIONSHIP_DESC, VALID_PERIOD, VERSION_NO, CREATE_BY, CREATE_TIME, LAST_CHANGE_BY, LAST_CHANGE_TIME)" +
      " values ( " + entityDB.pool.escape(relationship.RELATIONSHIP_ID) + ", " +
      entityDB.pool.escape(relationship.RELATIONSHIP_DESC) + ", " + entityDB.pool.escape(relationship.VALID_PERIOD) +
      ", 1, " + entityDB.pool.escape(userID) + ", " + entityDB.pool.escape(currentTime) + ", " + entityDB.pool.escape(userID) +
      ", "  + entityDB.pool.escape(currentTime) + " )";
    updateSQLs.push(insertSQL);
  }

  let relation = {
    action: relationship.action,
    RELATION_ID: relationship.RELATIONSHIP_ID,
    RELATION_DESC: relationship.RELATIONSHIP_DESC
  };
  _generateUpdateRelationSQL(relation, updateSQLs, userID, currentTime);

  if (relationship.ATTRIBUTES) {
    let errMessages = [];
    relationship.ATTRIBUTES.forEach(function (attribute) {
      if (!attribute.RELATION_ID){
        attribute.RELATION_ID = relationship.RELATIONSHIP_ID;
      } else {
        if (attribute.RELATION_ID !== relationship.RELATIONSHIP_ID) {
          errMessages.push(
            message.report('MODEL', 'ATTRIBUTE_NOT_BELONG_TO_RELATION', 'E',
              attribute.ATTR_NAME, attribute.RELATION_ID, relationship.RELATIONSHIP_ID));}
      }
      updateSQLs.push(_generateUpdateAttributeSQL(attribute));
    });
    if(errMessages.length > 0 ){
      return callback(errMessages);
    }
  }

  if (relationship.INVOLVES) {
    relationship.INVOLVES.forEach(function (involvement) {
      updateSQLs.push(_generateUpdateInvolvementSQL(involvement, relationship.RELATIONSHIP_ID));
    })
  }

  entityDB.doUpdatesParallel(updateSQLs, function (err) {
    if (err) {
      callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    } else {
      //TODO Not only sync DB table, but also the involved entities need to be reloaded
      _syncDBTable(relation.RELATION_ID, callback);
    }
  })
}

function _generateUpdateInvolvementSQL(involvement, relationshipID) {
  let updateSQL;
  switch (involvement.action) {
    case 'update':
      Object.keys(involvement).forEach(function (key) {
        if (key === 'action' || key === 'RELATIONSHIP_ID' || key === 'ROLE_ID') return;
        updateSQL = !updateSQL? "update RELATIONSHIP_INVOLVES set " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(involvement[key])
          :updateSQL + ", " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(involvement[key]);
      });
      if (updateSQL) updateSQL += " where RELATIONSHIP_ID = " + entityDB.pool.escape(relationshipID) +
                                    " and ROLE_ID = " + entityDB.pool.escape(involvement.ROLE_ID);
      break;
    case 'delete':
      updateSQL = "delete from RELATIONSHIP_INVOLVES where RELATIONSHIP_ID = " + entityDB.pool.escape(relationshipID) +
        " and ROLE_ID = " + entityDB.pool.escape(involvement.ROLE_ID);
      break;
    case 'add':

    default:
      updateSQL = "insert into RELATIONSHIP_INVOLVES ( RELATIONSHIP_ID, ROLE_ID, CARDINALITY, DIRECTION ) values ( " +
        entityDB.pool.escape(relationshipID) + ", " + entityDB.pool.escape(involvement.ROLE_ID) + ", " +
        entityDB.pool.escape(involvement.CARDINALITY) + ", " + entityDB.pool.escape(involvement.DIRECTION) + " )";
  }
  return updateSQL;
}

function listRole(term, callback) {
  let selectSQL = "select * from ROLE";
  let searchTerm = term?term.trim():null;
  if (searchTerm) {
    searchTerm = '%' + searchTerm + '%';
    selectSQL = selectSQL + " where ROLE_ID like " + entityDB.pool.escape(searchTerm) +
      " or ROLE_DESC like " + entityDB.pool.escape(searchTerm) +
      " order by LAST_CHANGE_TIME desc limit 10";
  } else {
    selectSQL = selectSQL + " order by LAST_CHANGE_TIME desc limit 10";
  }
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });
}

function getRole(roleID, callback) {
  let selectSQL =
    "select * from ROLE where ROLE_ID = "+ entityDB.pool.escape(roleID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'ROLE_NOT_EXIST', 'E', roleID));
    let role = rows[0];
    let selectSQL = "select A.RELATION_ID, RELATION_DESC, CARDINALITY " +
      "from ROLE_RELATION as A join RELATION as B on A.RELATION_ID = B.RELATION_ID" +
      " where ROLE_ID = " + entityDB.pool.escape(roleID);
    entityDB.executeSQL(selectSQL, function (err, rows) {
      if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
      role['RELATIONS'] = rows;
      callback(null, role);
    })
  })
}

function getRoleDesc(roleID, callback) {
  let selectSQL =
    "select ROLE_DESC from ROLE where ROLE_ID = "+ entityDB.pool.escape(roleID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    if(!rows[0]) return callback(message.report('MODEL', 'ROLE_NOT_EXIST', 'E', roleID));
    callback(null, rows[0].ROLE_DESC);
  })
}

function saveRole(role, userID, callback) {
  if (!role || role === {}) {
    return callback(message.report('MODEL', 'NOTHING_TO_SAVE', 'W'));
  }

  if (!role.ROLE_ID) {
    return callback(message.report('MODEL', 'ROLE_ID_MISSING', 'E'));
  }

  const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
  const updateSQLs = [];
  if (role.action === 'update') {
    let updateSQL = "update ROLE set LAST_CHANGE_BY = " + entityDB.pool.escape(userID) +
      ", LAST_CHANGE_TIME = " + entityDB.pool.escape(currentTime) + ", VERSION_NO = VERSION_NO + 1";
    if (role.ROLE_DESC !== null)
      updateSQL += ", ROLE_DESC = " + entityDB.pool.escape(role.ROLE_DESC);
    updateSQL += " where ROLE_ID = " + entityDB.pool.escape(role.ROLE_ID);
    updateSQLs.push(updateSQL);
  } else if (role.action === 'add') {
    let insertSQL = "insert into ROLE ( ROLE_ID, ROLE_DESC, VERSION_NO, CREATE_BY, CREATE_TIME, LAST_CHANGE_BY, LAST_CHANGE_TIME)" +
      " values ( " + entityDB.pool.escape(role.ROLE_ID) + ", " + entityDB.pool.escape(role.ROLE_DESC) +
      ", 1, " + entityDB.pool.escape(userID) + ", " + entityDB.pool.escape(currentTime) + ", " + entityDB.pool.escape(userID) +
      ", "  + entityDB.pool.escape(currentTime) + " )";
    updateSQLs.push(insertSQL);
  }

  if (role.RELATIONS) {
    role.RELATIONS.forEach(function (roleRelation) {
      updateSQLs.push(_generateUpdateRoleRelationSQL(roleRelation, role.ROLE_ID));
    })
  }

  entityDB.doUpdatesParallel(updateSQLs, function (err) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));

    let selectSQL = "select ENTITY_ID from ENTITY_ROLES where ROLE_ID = " + entityDB.pool.escape(role.ROLE_ID);
    entityDB.executeSQL(selectSQL, function (err, rows) {
      if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
      const entities = [];
      rows.forEach(function (row) {
        entities.push(row.ENTITY_ID);
      });
      entityDB.loadEntities(entities, callback);
    });
  })
}

function _generateUpdateRoleRelationSQL(roleRelation, roleID) {
  let updateSQL;
  switch (roleRelation.action) {
    case 'update':
      Object.keys(roleRelation).forEach(function (key) {
        if (key === 'action' || key === 'ROLE_ID' || key === 'RELATION_ID') return;
        updateSQL = !updateSQL? "update ROLE_RELATION set " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(roleRelation[key])
          :updateSQL + ", " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(roleRelation[key]);
      });
      if (updateSQL) updateSQL += " where ROLE_ID = " + entityDB.pool.escape(roleID) +
        " and RELATION_ID = " + entityDB.pool.escape(roleRelation.RELATION_ID);
      break;
    case 'delete':
      updateSQL = "delete from ROLE_RELATION where ROLE_ID = " + entityDB.pool.escape(roleID) +
        " and RELATION_ID = " + entityDB.pool.escape(roleRelation.RELATION_ID);
      break;
    case 'add':

    default:
      updateSQL = "insert into ROLE_RELATION ( ROLE_ID, RELATION_ID, CARDINALITY ) values ( " +
        entityDB.pool.escape(roleID) + ", " + entityDB.pool.escape(roleRelation.RELATION_ID) + ", " +
        entityDB.pool.escape(roleRelation.CARDINALITY)  + " )";
  }
  return updateSQL;
}
