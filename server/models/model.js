/*
Created by VinceZK on 2018.10.02
 */
const entityDB = require('./connections/mysql_mdb.js');
const timeUtil = require('../util/date_time.js');
const guid = require('../util/guid.js');
const Message = require('ui-message').Message;
const MsgArrayStore = require('ui-message').MsgArrayStore;
const msgArray = require('./message_model.js');

const msgStore = new MsgArrayStore(msgArray);
const message = new Message(msgStore, 'EN');

module.exports = {
  listEntityType: listEntityType,
  saveEntityType: saveEntityType
};

function listEntityType(term, callback) {
  let selectSQL = "select * from ENTITY";
  let searchTerm = term.trim();
  if (searchTerm) {
    searchTerm = '%' + searchTerm + '%';
    selectSQL = selectSQL + " where ENTITY_ID like " + entityDB.pool.escape(searchTerm) +
      " or ENTITY_DESC like " + entityDB.pool.escape(searchTerm) +
      " limit 20";
  } else {
    selectSQL = selectSQL + " limit 20";
  }
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('MODEL', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });
}

function saveEntityType(entityType, callback) {
  if (!entityType || entityType === {}) {
    return callback(message.report('MODEL', 'NOTHING_TO_SAVE', 'W'));
  }

  if (!entityType.ENTITY_ID) {
    return callback(message.report('MODEL', 'ENTITY_ID_MISSING', 'E'));
  }

  const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
  const updateSQLs = [];
  if (entityType.action === 'update') {
    let updateSQL = "update ENTITY set LAST_CHANGE_BY = 'DH001', LAST_CHANGE_TIME = " + entityDB.pool.escape(currentTime) +
      ", VERSION_NO = VERSION_NO + 1";
    if (entityType.ENTITY_DESC) updateSQL = updateSQL + ", ENTITY_DESC = " + entityDB.pool.escape(entityType.ENTITY_DESC);
    updateSQL = updateSQL + " where ENTITY_ID = " + entityDB.pool.escape(entityType.ENTITY_ID);
    updateSQLs.push(updateSQL);
  } else if (entityType.action === 'add') {
    let insertSQL = "insert into ENTITY ( ENTITY_ID, ENTITY_DESC, VERSION_NO, CREATE_BY, CREATE_TIME, LAST_CHANGE_BY, LAST_CHANGE_TIME)" +
      " values ( " + entityDB.pool.escape(entityType.ENTITY_ID) + ", " + entityDB.pool.escape(entityType.ENTITY_DESC) +
      ", 1, DH001, " + entityDB.pool.escape(currentTime) + ", DH001, " + entityDB.pool.escape(currentTime) + " )";
    updateSQLs.push(insertSQL);
  }

  if (entityType.ATTRIBUTES) {
    entityType.ATTRIBUTES.forEach(function (attribute) {
      updateSQLs.push(_generateUpdateAttributeSQL(attribute));
    })
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
      callback(null);
    }
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
        updateSQL = updateSQL? "update ATTRIBUTE set " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(attribute[key])
          :updateSQL + ", " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(attribute[key]);
      });
      if (updateSQL) updateSQL += " where ATTR_GUID = " + entityDB.pool.escape(attribute['ATTR_GUID']);
      break;
    case 'add':
      let columnString = "( ATTR_GUID, ";
      let valueString = "( " + guid.genTimeBased() + ", ";
      Object.keys(attribute).forEach(function (key) {
        if (key === 'action' || key === 'ATTR_GUID') return;
        columnString += entityDB.pool.escapeId(key) + ", ";
        valueString += entityDB.pool.escape(attribute[key]) + ", ";
      });
      columnString += ") ";
      valueString += ") ";
      updateSQL = "insert into ATTRIBUTE " + columnString + " values " + valueString;
      break;
    case 'delete':
      updateSQL = "delete ATTRIBUTE where ATTR_GUID = " + entityDB.pool.escape(attribute.ATTR_GUID);
      break;
    default:
  }
  return updateSQL;
}

function _generateUpdateRoleSQL(role, entityID) {
  let updateSQL;
  switch (role.action) {
    case 'add':
      updateSQL = "insert into ROLE ( ENTITY_ID, ROLE_ID ) values ( " + entityDB.pool.escape(entityID) + ", "
        + entityDB.pool.escape(role.ROLE_ID) + " )";
      break;
    case 'delete':
      updateSQL = "delete ROLE where ENTITY_ID = " + entityDB.pool.escape(entityID) +
        " and ROLE_ID = " + entityDB.pool.escape(role.ROLE_ID);
      break;
    default:
  }
  return updateSQL;
}
