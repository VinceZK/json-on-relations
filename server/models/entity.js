/**
 * Created by VinceZK on 10/25/14.
 * { ENTITY_ID: 'people',
 *   ENTITY_DESC: 'People Entity',
 *   ATTRIBUTES:
 *   [
 *     RowDataPacket {
 *       ATTR_GUID: '13976E0B39AEBAFBDC35764518DB72D9', RELATION_ID: 'people', ATTR_NAME: 'HEIGHT', ATTR_DESC: null,
 *       DATA_ELEMENT: null, DATA_TYPE: 2, DATA_LENGTH: null, SEARCHABLE: 0, NOT_NULL: 0, UNIQUE: 0, FINALIZE: 0,
 *       AUTO_INCREMENT: 0, IS_MULTI_VALUE: 0 }
 *   ]
 *   ROLES:
 *   [
 *     { ROLE_ID: 'system_user',
 *       ROLE_DESC: 'System user for login',
 *       RELATIONS: ['r_address', 'r_email', 'r_user'],
 *       RELATIONSHIPS: [{ RELATIONSHIP_ID: 'user_role',  RELATIONSHIP_DESC: 'A system user has muliple use roles',
 *                         VALID_PERIOD: 3162240000,
 *                         INVOLVES: [RowDataPacket { ROLE_ID: 'system_user', CARDINALITY: '[1..1]' },
 *                                    RowDataPacket { ROLE_ID: 'user_role', CARDINALITY: '[1..n]' } ]}]
 *     }
 *   ]
 * }
 *
 * {
 *   RELATION_ID: 'r_user',
 *   RELATION_DESC: 'System Logon User',
 *   VERSION_NO: 1,
 *   ATTRIBUTES: [ RowDataPacket {ATTR_GUID: '13976E0B39AEBAFBDC35764518DB72D9', RELATION_ID: 'people', ATTR_NAME: 'HEIGHT',}]
 * }
 */
'use strict';
const _ = require('underscore');
const async = require('async');
const guid = require('../util/guid.js');
const entityDB = require('./connections/mysql_mdb.js');
const timeUtil = require('../util/date_time.js');
const Message = require('ui-message').Message;
const MsgArrayStore = require('ui-message').MsgArrayStore;
const msgArray = require('./message.js');

const msgStore = new MsgArrayStore(msgArray);
const message = new Message(msgStore, 'EN');

module.exports = {
  entityDB: entityDB,
  createInstance: createInstance,
  getInstanceByGUID: getInstanceByGUID,
  getInstanceByID: getInstanceByID,
  changeInstance: changeInstance,
  softDeleteInstanceByGUID: softDeleteInstanceByGUID,
  softDeleteInstanceByID: softDeleteInstanceByID,
  restoreInstanceByGUID: restoreInstanceByGUID,
  restoreInstanceByID: restoreInstanceByID,
  hardDeleteByGUID: hardDeleteByGUID,
  hardDeleteByID: hardDeleteByID
};

/**
 * save the entity JSON object in DB
 * @param instance = JSON object, for example:
 * { ENTITY_GUID: 'people',
 *   attribute1: 'value1', attribute2: 'value2', attribute3: ['s1', 's2', 's3'] ... ,
 *   relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ... ,
 *   relationships:[
 *     {RELATIONSHIP_ID: 'user_role', ENTITY_ID: 'system_role',
 *      values:[{INSTANCE_GUID: '8BFB602731CBCD2090D7F9347957C4C5',
 *               VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00'}]
 *     }]
 * }
 * @param callback(err,result,instanceGuid), result is the JSON of the instance created
 */
function createInstance(instance, callback) {
  let instanceGUID = guid.genTimeBased();
  let entityMeta;
  let insertSQL;
  let insertSQLs = [];
  let errorMessages = [];
  let foreignRelations = [];
  let relationshipInstances = [];
  let results;

  if(!instance['ENTITY_ID']){
    return callback(message.report('ENTITY', 'ENTITY_ID_MISSING', 'E'));
  }else{
    entityMeta = entityDB.getEntityMeta(instance['ENTITY_ID'])
  }

  if(!entityMeta)
    return callback(message.report('ENTITY', 'ENTITY_NOT_EXIST', 'E', instance['ENTITY_ID']));

  entityMeta.ROLES.forEach(function(role){
    role.RELATIONS.forEach(function(relation){
      if((relation.CARDINALITY === '[1..1]' || relation.CARDINALITY === '[1..n]') && !instance[relation.RELATION_ID])
        errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', relation.RELATION_ID, entityMeta.ENTITY_ID))
    })
  });
  if(errorMessages.length > 0) return callback(errorMessages);

  //Parse the give instance JSON and convert it SQLs
  _.each(instance, function (value, key) {
    switch (key){
      case 'ENTITY_ID':
        break;
      case 'INSTANCE_GUID':
        break;
      case 'relationships':
        results = _generateRelationshipsSQL(value, entityMeta, instanceGUID, relationshipInstances);
        if(_hasErrors(results)) {
          _mergeResults(errorMessages, results)
        }else{
          results.forEach(function (element) {
            if(element.action === 'add')
              insertSQLs.push(element.SQL);
          });
        }
        break;
      default:
        if (typeof value === 'object') { //Relations or multiple value attributes
          if (_isRelation(key)) { //Relations
            results = _generateCreateRelationSQL(value, key, entityMeta, foreignRelations, instanceGUID);
            _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
          } else { //multiple value attributes
            results = _generateInsertMultiValueAttributeSQL(key, value, entityMeta, instanceGUID);
            _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
          }
        } else { //Single value attributes
          results = _generateInsertSingleValueAttributeSQL(key, value, entityMeta, instanceGUID);
          _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
        }
    }
  });

  if(errorMessages.length > 0) return callback(errorMessages);

  //Insert entity instance
  insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
    + entityDB.pool.escape(instance['ENTITY_ID']) + ","
    + entityDB.pool.escape(instanceGUID) + ", 0 ," + "'1')";
  insertSQLs.push(insertSQL);

  // console.log(insertSQLs);
  async.series([
    function (callback) {//Foreign key check
      async.map(foreignRelations, function (relation, callback) {
        _checkForeignKey(relation.relationRow, relation.association, callback);
      }, function (err, results) {
        if(err) return callback(err);
        if(results.length > 0 && results[0]) return callback(results);//The results should already be error messages
          else return callback(null);
      });
    },
    function (callback) {//Relationship instances check
      async.map(relationshipInstances, function (relationshipInstance, callback) {
        _checkEntityExist(relationshipInstance, callback)
      }, function (err, results) {
        if(err) return callback(err);
        if(results.length > 0 && results[0]) return callback(results); //The results should already be error messages
          else return callback(null);
      });
    },
    function (callback) {//Run all insert SQLs parallel
      entityDB.doUpdatesParallel(insertSQLs, function (err) {
        if (err) {
          callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
        } else {
          callback(null);
        }
      });
    }
  ],function (err) {
    if(err) return callback(err); //The err should already be error messages
    else {
      instance['INSTANCE_GUID'] = instanceGUID;
      return callback(null,instance);
    }
  });
}

/**
 * Soft delete an instance by the given business ID
 * @param idAttr
 * for example {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(err)
 */
function softDeleteInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err);
    softDeleteInstanceByGUID(instanceGUID,callback);
  })
}
/**
 * Soft delete an entity instance by set the DEL flag to 1 through instance GUID
 * @param instanceGUID
 * @param callback(err)
 */
function softDeleteInstanceByGUID(instanceGUID, callback) {
  let updateSQL = "update ENTITY_INSTANCES set DEL = 1 where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(updateSQL, function (err) {
    if(err) callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    else callback(null);
  })
}
/**
 * Restore the soft deleted instance by the given business ID
 * @param idAttr
 * @param callback(err)
 */
function restoreInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err);
    restoreInstanceByGUID(instanceGUID,callback);
  })
}
/**
 * Restore the soft deleted blog, set DEL flag = 0
 * @param instanceGUID
 * @param callback(err)
 */
function restoreInstanceByGUID(instanceGUID, callback) {
  let updateSQL = "update ENTITY_INSTANCES set DEL = 0 where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(updateSQL, function (err) {
    if(err) callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    else callback(null);
  })
}

/**
 * Delete the object from the DB by a unique business ID
 * @param idAttr
 * for example {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(err)
 */
function hardDeleteByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err);
    hardDeleteByGUID(instanceGUID,callback);
  })
}
/**
 * Delete the object from the DB by INSTANCE_GUID
 * @param instanceGUID
 * @param callback(err)
 */
function hardDeleteByGUID(instanceGUID, callback) {
  let deleteSQLs = [];
  _getEntityInstanceHead(instanceGUID, function (err, instanceHead) {
    if(err)return callback(err); //Already message instance
    if(instanceHead['DEL'] === 0)
      return callback(message.report('ENTITY', 'INSTANCE_NOT_MARKED_DELETE', 'E', instanceHead.INSTANCE_GUID, instanceHead.ENTITY_ID));

    let entityMeta = entityDB.getEntityMeta(instanceHead.ENTITY_ID);

    deleteSQLs.push("delete from ENTITY_INSTANCES where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
    deleteSQLs.push("delete from VALUE where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
    entityMeta.UNIQUE_ATTRIBUTE_INDICES.forEach(function (element) {
      deleteSQLs.push("delete from " + entityDB.pool.escapeId(element.IDX_TABLE)
        + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
    });
    entityMeta.ATTRIBUTE_INDICES.forEach(function (element) {
      deleteSQLs.push("delete from " + entityDB.pool.escapeId(element.IDX_TABLE)
        + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
    });
    entityMeta.ROLES.forEach(function (role) {
      role.RELATIONS.forEach(function (relation){
        deleteSQLs.push("delete from " + entityDB.pool.escapeId(relation.RELATION_ID)
          + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
      });
    });

    let selectSQL = "select RELATIONSHIP_INSTANCE_GUID from RELATIONSHIP_INVOLVES_INSTANCES "
      + " where ENTITY_INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    entityDB.executeSQL(selectSQL, function (err, results) {
      if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
      let GUIDArray;
      results.forEach(function(row){
        GUIDArray?GUIDArray = GUIDArray + " , " + entityDB.pool.escape(row['RELATIONSHIP_INSTANCE_GUID'])
          : GUIDArray = "( " + entityDB.pool.escape(row['RELATIONSHIP_INSTANCE_GUID']);
      });
      if(GUIDArray) GUIDArray = GUIDArray + " )";
      deleteSQLs.push("delete from RELATIONSHIP_INSTANCES where RELATIONSHIP_INSTANCE_GUID in " + GUIDArray);
      deleteSQLs.push("delete from RELATIONSHIP_INVOLVES_INSTANCES where RELATIONSHIP_INSTANCE_GUID in " + GUIDArray);

      entityDB.doUpdatesParallel(deleteSQLs, function (err) {
        if (err) {
          callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
        } else {
          callback(null);
        }
      });
    });
  });
}

/**
 * Get an instance in a JSON format from its business ID
 * @param idAttr
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(err, instance)
 * For the return instance example, please refer method getInstanceByGUID
 */
function getInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err);
    getInstanceByGUID(instanceGUID, callback);
  })
}
/**
 * Get an instance in a JSON format from its instanceGUID
 * @param instanceGUID
 * @param callback(err,instance)
 * instance is a JSON object or NULL if the ID is not exist!
 * Here is an example:
 * {  ENTITY_ID: 'people',
      HOBBY: ['Reading', 'Movie', 'Coding'], HEIGHT: 170, GENDER: 'male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E',
      r_user: {action: 'add', USER_ID: 'DH001', USER_NAME:'VINCEZK', DISPLAY_NAME: 'Vincent Zhang'},
      r_email: [{EMAIL: 'zklee@hotmail.com', TYPE: 'private', PRIMARY:1},
                {EMAIL: 'vinentzklee@gmail.com', TYPE: 'private important', PRIMARY:0}
        ],
      r_address: [{COUNTRY: 'China', CITY:'Shanghai', POSTCODE: '201202',
                   ADDRESS_VALUE:'Room #402, Building #41, Dongjing Road #393',
                   TYPE: 'Current Live', PRIMARY:1},
                  {COUNTRY: 'China', CITY:'Haimen', POSTCODE: '226126',
                   ADDRESS_VALUE:'Group 8 Lizhu Tangjia',
                   TYPE: 'Born Place', PRIMARY:0}],
      r_employee: {USER_ID: 'DH001', COMPANY:'Darkhouse', DEPARTMENT: 'Development', TITLE: 'Developer', GENDER:'Male'},
      relationships:[
         {RELATIONSHIP_ID: 'user_role', PARTNER_ENTITY_ID: 'system_role',PARTNER_ENTITY_ID: 'system_role',
            values:[{INSTANCE_GUID: '5F50DE92743683E1ED7F964E5B9F6167',
                       VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00'}]
           }]
    }
 */
function getInstanceByGUID(instanceGUID, callback) {

  _getEntityInstanceHead(instanceGUID, function (err, instanceHead) {
    if(err)return callback(err); //Already message instance
    let instance = {INSTANCE_GUID: instanceGUID};
    instance.ENTITY_ID = instanceHead.ENTITY_ID;
    let entityMeta = entityDB.getEntityMeta(instance.ENTITY_ID);

    async.parallel([
      function (callback) {
        __getAttributeValue(instance, entityMeta, callback);
      },
      function (callback) {
        __getRelationValue(instance, entityMeta, callback);
      },
      function (callback) {
        __getRelationshipValue(instance, entityMeta, callback);
      }
    ],function (err) {
      if(err)callback(err); //Already message instance
      callback(null, instance)
    })

  });

  function __getAttributeValue(instance, entityMeta, callback) {
    let selectSQL =
      "select * from VALUE where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    entityDB.executeSQL(selectSQL, function (err, results) {
      if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
      results.forEach(function(attributeValue){
        let attributeMeta = entityMeta.ATTRIBUTES.find(function (attributeMeta) {
          return attributeMeta['ATTR_GUID'] === attributeValue['ATTR_GUID'];
        });
        if(attributeMeta['IS_MULTI_VALUE'] === 1){
          instance[attributeMeta.ATTR_NAME]?instance[attributeMeta.ATTR_NAME].push(attributeValue['VALUE']):
            instance[attributeMeta.ATTR_NAME] = [attributeValue['VALUE']];
        }else{
          instance[attributeMeta.ATTR_NAME] = attributeValue['VALUE'];
        }
      });
      callback(null);
    });
  }

  function __getRelationValue(instance, entityMeta, callback) {
    let relations = [];
    entityMeta.ROLES.forEach(function (role) {
      role.RELATIONS.forEach(function (relation) {
        relations.push(relation);
      })
    });

    async.map(relations, function (relation, callback) {
      let selectSQL = "select * from " + entityDB.pool.escapeId(relation.RELATION_ID)
        + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
      entityDB.executeSQL(selectSQL, function (err, results) {
        if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
        if(results.length > 0)
          instance[relation.RELATION_ID] = results;
        callback(null);
      })
    },function (err) {
      if(err)callback(err);
      callback(null);
    })
  }

  function __getRelationshipValue(instance, entityMeta, callback) {
    let selectSQL =
      "select A.RELATIONSHIP_ID, A.ENTITY_INSTANCE_GUID, A.ENTITY_ID, A.ROLE_ID, B.VALID_FROM, B.VALID_TO" +
      "  from RELATIONSHIP_INVOLVES_INSTANCES as A " +
      "  join RELATIONSHIP_INSTANCES as B " +
      "    on A.RELATIONSHIP_INSTANCE_GUID = B.RELATIONSHIP_INSTANCE_GUID " +
      " where B.RELATIONSHIP_INSTANCE_GUID in " +
      "(select RELATIONSHIP_INSTANCE_GUID from RELATIONSHIP_INVOLVES_INSTANCES " +
      " where ENTITY_INSTANCE_GUID =" + entityDB.pool.escape(instanceGUID) + ")";
    entityDB.executeSQL(selectSQL, function (err, results) {
      if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
      if(results.length === 0)return callback(null);

      instance.relationships = [];
      let selfRoleID = results.find(function (row) {
        return row['ENTITY_INSTANCE_GUID'] === instanceGUID;
      }).ROLE_ID;
      results.forEach(function (row) {
        if(row['ENTITY_INSTANCE_GUID'] === instanceGUID){//Bypass self
          return;
        }
        let relationship = instance.relationships.find(function (element) {
          return element.RELATIONSHIP_ID === row.RELATIONSHIP_ID &&
                 element.PARTNER_ENTITY_ID === row.ENTITY_ID;
        });
        if(relationship){
          relationship.values.push(
            {INSTANCE_GUID: row['ENTITY_INSTANCE_GUID'], VALID_FROM:row['VALID_FROM'], VALID_TO:row['VALID_TO']}
          );
        }else{
          relationship = {
            RELATIONSHIP_ID: row['RELATIONSHIP_ID'],
            SELF_ROLE_ID: selfRoleID,
            PARTNER_ENTITY_ID: row['ENTITY_ID'],
            PARTNER_ROLE_ID: row['ROLE_ID'],
            values:[{INSTANCE_GUID: row['ENTITY_INSTANCE_GUID'], VALID_FROM:row['VALID_FROM'], VALID_TO:row['VALID_TO']}]
          };
          instance.relationships.push(relationship);
        }
      });

      callback(null);
    })
  }
}

/**
 * Get a piece of information from an instance.
 * For example, only get the named attributes or relations
 * @param instanceGUID
 * @param piece
 * {ATTRIBUTES: ['HOBBY', 'HEIGHT'],
 *  RELATIONS: ['r_user', 'r_email'],
 *  RELATIONSHIPS: ['user_role'] }
 */
function getInstancePieceByGUID(instanceGUID, piece) {
  //TODO
}

/**
 * Change an instance from the provided instance JSON.
 * Only list attributes, relations, and relationships are got updated.
 * @param instance
 * { ENTITY_ID: 'people', INSTANCE_GUID: '43DAE23498B6FC121D67717E79B8F3C0',
 *   attribute1: 'value1', attribute2: 'value2', attribute3: ['s1', 's2', 's3'] ... ,
 *   relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ... ,
 *   relationships:[
 *     {RELATIONSHIP_ID: 'user_role', PARTNER_ENTITY_ID: 'system_role',
 *      values:[{INSTANCE_GUID: '8BFB602731CBCD2090D7F9347957C4C5',
 *               VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00'}]
 *     }]
 * }
 * @param callback(err)
 * @returns {*}
 */
function changeInstance(instance, callback) {
  let errorMessages = [];
  let entityMeta;
  if(!instance['ENTITY_ID']){
    errorMessages.push(message.report('ENTITY', 'ENTITY_ID_MISSING', 'E'));
    return callback(errorMessages);
  }else{
    entityMeta = entityDB.getEntityMeta(instance['ENTITY_ID'])
  }
  if(!entityMeta){
    errorMessages.push(message.report('ENTITY', 'ENTITY_NOT_EXIST', 'E', instance['ENTITY_ID']));
    return callback(errorMessages);
  }

  if(!instance['INSTANCE_GUID']){
    errorMessages.push(message.report('ENTITY', 'INSTANCE_GUID_MISSING', 'E'));
    return callback(errorMessages);
  }

  _getEntityInstanceHead(instance['INSTANCE_GUID'], function (err, instanceHead) {
    if(err)return callback(err); //Already message instance
    if(instanceHead['DEL'] === 1){
      errorMessages.push(
        message.report('ENTITY', 'INSTANCE_MARKED_DELETE', 'E', instanceHead.INSTANCE_GUID, instanceHead.ENTITY_ID));
      return callback(errorMessages);
    }

    let updateSQLs = [];
    let foreignRelations = [];
    let add01Relations = [];
    let delete1nRelations = [];
    let relationshipInstances = [];
    let results;
    let relationshipSQLs;

    //Parse the given instance JSON and convert it SQLs
    _.each(instance, function (value, key) {
      switch (key){
        case 'ENTITY_ID':
          break;
        case 'INSTANCE_GUID':
          break;
        case 'relationships':
          relationshipSQLs = _generateRelationshipsSQL(value, entityMeta, instance['INSTANCE_GUID'], relationshipInstances);
          if(_hasErrors(relationshipSQLs))_mergeResults(errorMessages, relationshipSQLs);
          break;
        default:
          if (typeof value === 'object') { //Relations or multiple value attributes
            if (_isRelation(key)) { //Relations
              results = _generateChangeRelationSQL(value, key, entityMeta, foreignRelations,
                instance['INSTANCE_GUID'], add01Relations, delete1nRelations);
              _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
            } else { //Multiple value attributes
              results = _generateUpdateMultiValueAttributeSQL(key, value, entityMeta, instance['INSTANCE_GUID']);
              _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
            }
          } else { //Single value attributes
            let results = _generateUpdateSingleValueAttributeSQL(key, value, entityMeta, instance['INSTANCE_GUID']);
            _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
          }
      }
    });

    if(errorMessages.length > 0) return callback(errorMessages);

    async.series([
      function (callback) {//Foreign key check
        async.map(foreignRelations, function (relation, callback) {
          _checkForeignKey(relation.relationRow, relation.association, callback);
        }, function (err, results) {
          if(err) return callback(err);
          if(results.length > 0 && results[0]) return callback(results);//The results should already be error messages
          else return callback(null);
        });
      },
      function (callback) {//Check adding [0..1] relations
        async.map(add01Relations, function(relation, callback){
          _checkAdd01Relation(relation, instance['INSTANCE_GUID'], callback)
        }, function (err, results) {
          if(err) return callback(err);
          if(results.length > 0 && results[0]) return callback(results); //The results should already be error messages
          else return callback(null);
        })
      },
      function (callback) {//Check deleting [1..n] relations
        async.map(delete1nRelations, function(relation, callback){
          _checkDelete1nRelation(relation, instance['INSTANCE_GUID'], callback)
        }, function (err, results) {
          if(err) return callback(err);
          if(results.length > 0 && results[0]) return callback(results); //The results should already be error messages
          else return callback(null);
        })
      },
      function (callback) {//Relationship involved instances check
        async.map(relationshipInstances, function (relationshipInstance, callback) {
          _checkEntityExist(relationshipInstance, callback)
        }, function (err, results) {
          if(err) return callback(err);
          if(results.length > 0 && results[0]) return callback(results); //The results should already be error messages
          else return callback(null);
        });
      },
      function (callback) {//Relationship update/add check
        async.map(relationshipInstances, function (relationshipInstance, callback){
          _checkInstanceInvolvedInRelationship(
            instance['INSTANCE_GUID'], relationshipInstance, relationshipSQLs, updateSQLs, callback)
        }, function (err) {
          if(err) return callback(err);
          else return callback(null);
        })
      },
      function (callback) {//Run all insert SQLs parallel
        entityDB.doUpdatesParallel(updateSQLs, function (err) {
          if (err) {
            callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
          } else {
            callback(null);
          }
        });
      }
    ],function (err) {
      if(err) return callback(err); //The err should already be error messages
      else return callback(null);
    });

  })
}

function _hasErrors(results) {
  return results.find(function (element) {
    return element['msgCat'];
  })
}

function _isRelation(relationID) {
  return entityDB.getRelationMeta(relationID);
}

function _mergeResults(to, from) {
  from.forEach(function (element) {
    to.push(element);
  })
}

/**
 * Get the instance head information from table ENTITY_INSTANCES.
 * Always used for existence check.
 * @param instanceGUID
 * @param callback
 * @private
 */
function _getEntityInstanceHead(instanceGUID, callback) {
  let selectSQL = "select * from ENTITY_INSTANCES where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if(results.length === 0)
      return callback(message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', instanceGUID));
    callback(null, results[0]);
  })
}

/**
 * @param relationships
 * [
 *  {RELATIONSHIP_ID: 'user_role', PARTNER_ENTITY_ID: 'system_role', PARTNER_ROLE_ID: 'system_role',
 *   values:[{INSTANCE_GUID: '8BFB602731CBCD2090D7F9347957C4C5',
 *            VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00'},
 *           {INSTANCE_GUID: 'C1D5765AFB9E92F87C936C079837842C',
 *            VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2018-07-04 00:00:00'}]
 *  }
 * ]
 * @param entityMeta
 * @param instanceGUID
 * @param relationshipInstances
 * @returns {*}
 * @private
 */
function _generateRelationshipsSQL(relationships, entityMeta, instanceGUID, relationshipInstances) {
  let errorMessages = [];
  let SQLs = [];

  relationships.forEach(function (relationship) {
    let roleMeta = _checkEntityInvolvesRelationship(relationship['RELATIONSHIP_ID'], entityMeta);
    if(!roleMeta){
      errorMessages.push(
        message.report('ENTITY', 'RELATIONSHIP_NOT_VALID', 'E', relationship['RELATIONSHIP_ID'], entityMeta.ENTITY_ID));
      return;
    }

    let relationshipMeta = roleMeta.RELATIONSHIPS.find(function (element) {
      return element.RELATIONSHIP_ID === relationship['RELATIONSHIP_ID'];
    });
    let involvesMeta = relationshipMeta.INVOLVES.find(function (element) {
      return element.ROLE_ID === relationship['PARTNER_ROLE_ID'];
    });
    if(!involvesMeta){
      errorMessages.push(
        message.report('ENTITY', 'ROLE_NOT_VALID', 'E', relationship['PARTNER_ROLE_ID'], relationshipMeta.RELATIONSHIP_ID));
      return;
    }
    if(involvesMeta.CARDINALITY === '[1..1]' && values.length > 1){
      errorMessages.push(
        message.report('ENTITY', 'RELATIONSHIP_INSTANCE_SINGULAR', 'E', involvesMeta.ROLE_ID, relationshipMeta.RELATIONSHIP_ID));
      return;
    }

    relationship['values'].forEach(function (value) {
      if(relationshipInstances)relationshipInstances.push( //For relationship partner entity existence check
        {RELATIONSHIP_ID: relationship['RELATIONSHIP_ID'],
          ENTITY_ID: relationship['PARTNER_ENTITY_ID'] ,
          INSTANCE_GUID: value['INSTANCE_GUID']});

      let relationshipInstanceGUID = guid.genTimeBased();
      let currentTime = timeUtil.getCurrentDateTime();
      let validFrom;
      let validTo;
      if(value['VALID_FROM']){
        validFrom = value['VALID_FROM'] < currentTime?currentTime:value['VALID_FROM'];
      }else{
        validFrom = currentTime;
      }
      if(value['VALID_TO']){
        if(timeUtil.StringToDate(value['VALID_TO']) < timeUtil.StringToDate(validFrom)){
          errorMessages.push(message.report('ENTITY','VALID_TO_BEFORE_VALID_FROM', 'E', value['VALID_TO'], validFrom));
          return;
        }else{
          validTo = value['VALID_TO'];
        }
      }else{
        validTo = timeUtil.getFutureDateTime(relationshipMeta.VALID_PERIOD);
      }
      SQLs.push({action: "update", PARTNER_INSTANCE_GUID: value['INSTANCE_GUID'],
        SQL: "update RELATIONSHIP_INSTANCES set VALID_TO = " + entityDB.pool.escape(validTo)
             + " where RELATIONSHIP_INSTANCE_GUID = "});
      SQLs.push({ action: "add", PARTNER_INSTANCE_GUID: value['INSTANCE_GUID'],
        SQL: "insert into RELATIONSHIP_INSTANCES values (" + entityDB.pool.escape(relationshipInstanceGUID) + " , "
             + entityDB.pool.escape(validFrom) + " , " + entityDB.pool.escape(validTo) + " , "
             + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + ")"}
      );
      SQLs.push({action: "add", PARTNER_INSTANCE_GUID: value['INSTANCE_GUID'], //Self
        SQL: "insert into RELATIONSHIP_INVOLVES_INSTANCES values (" + entityDB.pool.escape(relationshipInstanceGUID) + " , "
             + entityDB.pool.escape(instanceGUID) + " , " + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + " , "
             + entityDB.pool.escape(entityMeta.ENTITY_ID) + " , " + entityDB.pool.escape(roleMeta.ROLE_ID) + ")"}
      );
      SQLs.push({action: "add", PARTNER_INSTANCE_GUID: value['INSTANCE_GUID'], //Counter part
        SQL: "insert into RELATIONSHIP_INVOLVES_INSTANCES values (" + entityDB.pool.escape(relationshipInstanceGUID) + " , "
             + entityDB.pool.escape(value['INSTANCE_GUID']) + " , " + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + " , "
             + entityDB.pool.escape(relationship['PARTNER_ENTITY_ID'])+ " , " + entityDB.pool.escape(relationship['PARTNER_ROLE_ID']) + ")"}
      );
    });
  });

  if (errorMessages.length > 0) return errorMessages;
  return SQLs;
}

/**
 * Generate creation SQLs for the relation values
 * @param value: a value row of a relation
 * @param key: the name of the relation
 * @param entityMeta
 * @param foreignRelations
 * @param instanceGUID
 * @returns {*}
 * @private
 */
function _generateCreateRelationSQL(value, key, entityMeta, foreignRelations, instanceGUID){
  let errorMessages = [];
  let results;

  let roleRelationMeta = _checkEntityHasRelation(key, entityMeta);
  if(!roleRelationMeta){
    errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
    return errorMessages;
  }

  let relationMeta = entityDB.getRelationMeta(key);
  if (_.isArray(value)){
    if(roleRelationMeta.CARDINALITY === '[0..1]' || roleRelationMeta.CARDINALITY === '[1..1]'){
      errorMessages.push(message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', roleRelationMeta.RELATION_ID));
      return errorMessages;
    }

    results = [];
    value.forEach(function (element) {
      _mergeResults(results, __processSingleRelation(element));
    });
  }else{ //Single line
    results = __processSingleRelation(value);
  }
  if(errorMessages.length > 0) return errorMessages;
  else return results;

  function __processSingleRelation(value) {
    if(value['action'] === 'update' || value['action'] === 'delete'){
      errorMessages.push(message.report('ENTITY', 'UPDATE_DELETE_NOT_ALLOWED', 'E'));
      return [];
    }

    relationMeta.ASSOCIATIONS.forEach(function(association){
      if(association.FOREIGN_KEY_CHECK === 1)
        foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: value, association: association});
    });

    return _generateInsertSingleRelationSQL(relationMeta, value, instanceGUID);
  }
}

/**
 * Generate SQLs for changing already existing relations' value. It is rather complex due to cardinality.
 * Following matrix indicates the behaviours:
 * | action | [0..1] | [1..1] | [0..n] | [1..n] |
 * |--------|--------|--------|--------|--------|
 * | delete |   √    |    X   |    √   |    ?   |
 * | add    |   ?    |    X   |    √   |    √   |
 * | update |   √    |    √   |    √   |    √   |
 * @param value
 * @param key
 * @param entityMeta
 * @param foreignRelations: record relations that have foreign key check associations
 * @param instanceGUID
 * @param add01Relations: record relations that have cardinality [0..1] and are asked for adding
 * @param delete1nRelations: record relations that have cardinality [1..n] and are asked for deletion
 * @returns {*}
 * @private
 */
function _generateChangeRelationSQL(value, key, entityMeta, foreignRelations, instanceGUID, add01Relations, delete1nRelations){
  let errorMessages = [];
  let results;

  let roleRelationMeta = _checkEntityHasRelation(key, entityMeta);
  if(!roleRelationMeta){
    errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
    return errorMessages;
  }

  let relationMeta = entityDB.getRelationMeta(key);
  if (_.isArray(value)){
    results = [];
    value.forEach(function (element) {
      _mergeResults(results, __processSingleRelation(element));
    })
  }else{ //Single line
    results = __processSingleRelation(value);
  }
  if(errorMessages.length > 0) return errorMessages;
  else return results;

  function __processSingleRelation(value) {
    let results;
    switch (value['action']){
      case 'add':
        __validateForAdd();
        results = _generateInsertSingleRelationSQL(relationMeta, value, instanceGUID);
        break;
      case 'update':
        relationMeta.ASSOCIATIONS.forEach(function(association){
          if(association.FOREIGN_KEY_CHECK === 1)
            foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: value, association: association});
        });
        results = _generateUpdateSingleRelationSQL(relationMeta, value);
        break;
      case 'delete':
        if(roleRelationMeta.CARDINALITY === '[1..1]')
          errorMessages.push(
            message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', roleRelationMeta.RELATION_ID, entityMeta.ENTITY_ID));
        if(roleRelationMeta.CARDINALITY === '[1..n]'){
          let deleteRelation = delete1nRelations.find(function (element) {
            return element.RELATION_ID === roleRelationMeta.RELATION_ID;
          });
          if(deleteRelation)
            deleteRelation.COUNT = deleteRelation.COUNT + 1;
          else
            delete1nRelations.push({RELATION_ID:roleRelationMeta.RELATION_ID, COUNT: 1});
        }
        results = _generateDeleteSingleRelationSQL(relationMeta, value);
        break;
      default:
        __validateForAdd();
        results = _generateInsertSingleRelationSQL(relationMeta, value, instanceGUID);
    }
    return results;
  }

  function __validateForAdd() {
    if(roleRelationMeta.CARDINALITY === '[1..1]')
      errorMessages.push(message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', roleRelationMeta.RELATION_ID));
    if(roleRelationMeta.CARDINALITY === '[0..1]'){
      if(_.contains(add01Relations, roleRelationMeta.RELATION_ID))
        errorMessages.push(message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', roleRelationMeta.RELATION_ID));
      else add01Relations.push(roleRelationMeta.RELATION_ID);
    }
    if(roleRelationMeta.CARDINALITY === '[1..n]'){
      let deleteRelation = delete1nRelations.find(function (element) {
        return element.RELATION_ID === roleRelationMeta.RELATION_ID;
      });
      if(deleteRelation)
        deleteRelation.COUNT = deleteRelation.COUNT - 1;
      else
        delete1nRelations.push({RELATION_ID:roleRelationMeta.RELATION_ID, COUNT: -1});
    }
    relationMeta.ASSOCIATIONS.forEach(function(association){
      if(association.FOREIGN_KEY_CHECK === 1)
        foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: value, association: association});
    });
  }
}

/**
 * Generate insert SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateInsertSingleRelationSQL(relationMeta, relationRow, instanceGUID) {
  let errorMessages = [];
  let insertSQLs = [];
  let insertColumns;
  let insertValues;

  _.each(relationRow, function (value, key) {
    let attributeMeta = relationMeta.ATTRIBUTES.find(function (ele) {
      return ele.ATTR_NAME === key;
    });

    if(attributeMeta){
      insertColumns?insertColumns = insertColumns + "," + entityDB.pool.escapeId(key):
        insertColumns = " (" + entityDB.pool.escapeId(key);
      insertValues?insertValues = insertValues +  "," + entityDB.pool.escape(value):
        insertValues = " (" + entityDB.pool.escape(value);
    } else {
      if (key !== 'action'){ //Reserved key "Action" is ignored in creation, as it is supposed to be all 'add'
        errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', key, relationMeta.RELATION_ID));
      }
    }
  });
  if (errorMessages.length > 0) return errorMessages;

  if(insertColumns)insertColumns = insertColumns + ", `INSTANCE_GUID` ) ";
  if(insertValues)insertValues = insertValues + " , " + entityDB.pool.escape(instanceGUID) + " ) ";
  if(insertColumns && insertValues){
    insertSQLs.push("insert into " + entityDB.pool.escapeId(relationMeta.RELATION_ID) + insertColumns + " values " + insertValues);
  }
  return insertSQLs;
}

/**
 * Generate update SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @returns {Array}
 * @private
 */
function _generateUpdateSingleRelationSQL(relationMeta, relationRow) {
  let errorMessages = [];
  let updateSQLs = [];
  let updateColumns;
  let whereClause;

  //Check if primary keys are provided correctly.
  _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1}).forEach(function(attribute){
    if(!relationRow[attribute.ATTR_NAME])
      errorMessages.push(message.report('ENTITY','PRIMARY_KEY_MISSING','E', attribute.ATTR_NAME));
  });
  if (errorMessages.length > 0) return errorMessages;

  _.each(relationRow, function (value, key) {
    if(key === 'action') return true; //reserved key "action"

    let attributeMeta = relationMeta.ATTRIBUTES.find(function (ele) {
      return ele.ATTR_NAME === key;
    });

    if(attributeMeta){
      if(attributeMeta['PRIMARY_KEY'] === 1){
        whereClause?whereClause = whereClause + " and " + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(value):
          whereClause = " where " + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(value);
      }else{
        updateColumns?updateColumns = updateColumns + "," + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(value):
          updateColumns = entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(value);
      }
    } else {
      errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', key, relationMeta.RELATION_ID));
    }
  });
  if (errorMessages.length > 0) return errorMessages;

  if(updateColumns && whereClause){
    updateSQLs.push("update " + entityDB.pool.escapeId(relationMeta.RELATION_ID) + " set " + updateColumns + whereClause);
  }
  return updateSQLs;
}

/**
 * Generate delete SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @returns {Array}
 * @private
 */
function _generateDeleteSingleRelationSQL(relationMeta, relationRow) {
  let errorMessages = [];
  let deleteSQLs = [];
  let whereClause;
  let primaryKeys = _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1});

  //Check if primary keys are provided correctly.
  primaryKeys.forEach(function(attribute){
    if(!relationRow[attribute.ATTR_NAME]){
      errorMessages.push(message.report('ENTITY','PRIMARY_KEY_MISSING','E', attribute.ATTR_NAME));
    }else{
      whereClause?
        whereClause = whereClause + " and " + entityDB.pool.escapeId(attribute.ATTR_NAME) + "=" + entityDB.pool.escape(relationRow[attribute.ATTR_NAME]):
        whereClause = " where " + entityDB.pool.escapeId(attribute.ATTR_NAME) + "=" + entityDB.pool.escape(relationRow[attribute.ATTR_NAME]);
    }
  });
  if (errorMessages.length > 0) return errorMessages;
  if (whereClause){
    deleteSQLs.push("delete from " + entityDB.pool.escapeId(relationMeta.RELATION_ID) + whereClause);
  }
  return deleteSQLs;
}

/**
 * Generate insert SQLs for multiple values attributes
 * @param attributeName
 * @param value
 * @param entityMeta
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateInsertMultiValueAttributeSQL(attributeName, value, entityMeta, instanceGUID) {
  let errorMessages = [];
  let attributeMeta = _checkEntityHasAttribute(attributeName, entityMeta);
  if(!attributeMeta){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_VALID', 'E', entityMeta.ENTITY_ID, attributeName));
    return errorMessages;
  }
  if(attributeMeta['IS_MULTI_VALUE'] !== 1){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_MULTI_VALUE', 'E', attributeName, entityMeta.ENTITY_ID));
    return errorMessages;
  }

  let insertSQLs = [];
  let insertSQL;
  let multipleValues = _.unique(value); // Remove duplicate values

  //Insert attribute value
  multipleValues.forEach(function (element, index) {
    insertSQL = "insert into VALUE (`INSTANCE_GUID`, `ATTR_GUID`, `VALUE_ID`, `VALUE`, `VERSION_NO`, `CHANGE_NO`) values ("
      + entityDB.pool.escape(instanceGUID) + ","
      + entityDB.pool.escape(attributeMeta.ATTR_GUID) + ","
      + index.toString() + ","
      + entityDB.pool.escape(element) + ","
      + "'0', '1')";
    insertSQLs.push(insertSQL);
  });

  //Insert non-unique indices
  let attributeIndex = entityMeta.ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  if(attributeIndex){
    multipleValues.forEach(function (element) { // Remove duplicate values
      insertSQL = "insert into " + attributeIndex.IDX_TABLE + " (`VALUE`, `INSTANCE_GUID`) values ("
        + entityDB.pool.escape(element) + "," + entityDB.pool.escape(instanceGUID) + ")";
      insertSQLs.push(insertSQL);
    });
  }

  return insertSQLs;
}

/**
 * Generate update SQLs for multiple values attributes
 * @param attributeName
 * @param value
 * @param entityMeta
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateUpdateMultiValueAttributeSQL(attributeName, value, entityMeta, instanceGUID) {
  let errorMessages = [];
  let attributeMeta = _checkEntityHasAttribute(attributeName, entityMeta);
  if(!attributeMeta){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_VALID', 'E', entityMeta.ENTITY_ID, attributeName));
    return errorMessages;
  }
  if(attributeMeta['IS_MULTI_VALUE'] !== 1){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_MULTI_VALUE', 'E', attributeName, entityMeta.ENTITY_ID));
    return errorMessages;
  }

  let insertSQLs = [];
  let insertSQL = "delete from VALUE where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID)
    + " and ATTR_GUID = " + entityDB.pool.escape(attributeMeta['ATTR_GUID']) + " ; "
    + "insert into VALUE (`INSTANCE_GUID`, `ATTR_GUID`, `VALUE_ID`, `VALUE`, `VERSION_NO`, `CHANGE_NO`) values";
  let multipleValues = _.unique(value); // Remove duplicate values

  //Insert attribute value one by one
  multipleValues.forEach(function (element, index) {
    let valueString = " ("
      + entityDB.pool.escape(instanceGUID) + ","
      + entityDB.pool.escape(attributeMeta['ATTR_GUID']) + ","
      + index.toString() + ","
      + entityDB.pool.escape(element) + ","
      + "'0', '1')";
    if(index === 0){
      insertSQL = insertSQL + valueString;
    }else{
      insertSQL = insertSQL + "," + valueString;
    }
  });
  insertSQLs.push(insertSQL);

  //Insert non-unique indices
  let attributeIndex = entityMeta.ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  insertSQL = "delete from " + entityDB.pool.escapeId(attributeIndex.IDX_TABLE)
  + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID) + "; "
  +  "insert into " + entityDB.pool.escapeId(attributeIndex.IDX_TABLE) + " (`VALUE`, `INSTANCE_GUID`) values ";
  if(attributeIndex){
    multipleValues.forEach(function (element, index) {
      let valueString = "(" + entityDB.pool.escape(element) + "," + entityDB.pool.escape(instanceGUID) + ")";
      if(index === 0){
        insertSQL = insertSQL + valueString;
      }else{
        insertSQL = insertSQL + "," + valueString;
      }
    });
    insertSQLs.push(insertSQL);
  }

  return insertSQLs;
}

/**
 * Generate insert SQLs for a single value attribute
 * @param attributeName
 * @param value
 * @param entityMeta
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateInsertSingleValueAttributeSQL(attributeName, value, entityMeta, instanceGUID) {
  let errorMessages = [];
  let attributeMeta = _checkEntityHasAttribute(attributeName, entityMeta);
  if(!attributeMeta){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_VALID', 'E', entityMeta.ENTITY_ID, attributeName));
    return errorMessages;
  }

  let insertSQLs = [];
  let insertSQL;
  //Insert unique indices
  let uniqueIndex = entityMeta.UNIQUE_ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  if(uniqueIndex){
    insertSQL = "INSERT INTO " + uniqueIndex.IDX_TABLE + " (`VALUE`, `INSTANCE_GUID`) VALUES ("
      + entityDB.pool.escape(value) + "," + entityDB.pool.escape(instanceGUID) + ")";
    insertSQLs.push(insertSQL);
  }

  //Insert non-unique indices
  let attributeIndex = entityMeta.ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  if(attributeIndex){
    insertSQL = "INSERT INTO " + attributeIndex.IDX_TABLE + " (`VALUE`, `INSTANCE_GUID`) VALUES ("
      + entityDB.pool.escape(value) + "," + entityDB.pool.escape(instanceGUID) + ")";
    insertSQLs.push(insertSQL);
  }

  //Insert attribute value
  insertSQL = "INSERT INTO VALUE (`INSTANCE_GUID`, `ATTR_GUID`, `VALUE_ID`, `VALUE`, `VERSION_NO`, `CHANGE_NO`) VALUES ("
    + entityDB.pool.escape(instanceGUID) + ","
    + entityDB.pool.escape(attributeMeta['ATTR_GUID']) + ","
    + "'0'," //To-Do: Multi Value is not considered yet
    + entityDB.pool.escape(value) + ","
    + "'0', '1')";
  insertSQLs.push(insertSQL);

  return insertSQLs;
}

/**
 * Generate update SQLs for a single value attribute
 * @param attributeName
 * @param value
 * @param entityMeta
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateUpdateSingleValueAttributeSQL(attributeName, value, entityMeta, instanceGUID) {
  let errorMessages = [];
  let attributeMeta = _checkEntityHasAttribute(attributeName, entityMeta);
  if(!attributeMeta){
    errorMessages.push(message.report('ENTITY', 'ATTRIBUTE_NOT_VALID', 'E', entityMeta.ENTITY_ID, attributeName));
    return errorMessages;
  }

  let updateSQLs = [];
  let updateSQL;
  //Update unique indices
  let uniqueIndex = entityMeta.UNIQUE_ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  if(uniqueIndex){
    updateSQL = "update " + entityDB.pool.escapeId(uniqueIndex.IDX_TABLE) + " set VALUE = "
      + entityDB.pool.escape(value) + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    updateSQLs.push(updateSQL);
  }

  //Update non-unique indices
  let attributeIndex = entityMeta.ATTRIBUTE_INDICES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  });
  if(attributeIndex){
    updateSQL = "update " + entityDB.pool.escapeId(attributeIndex.IDX_TABLE) + " set VALUE = "
      + entityDB.pool.escape(value) + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    updateSQLs.push(updateSQL);
  }

  //Update attribute value
  updateSQL = "update VALUE set VALUE = " + entityDB.pool.escape(value)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID)
    + " and ATTR_GUID = " + entityDB.pool.escape(attributeMeta['ATTR_GUID']);
  updateSQLs.push(updateSQL);

  return updateSQLs;
}

function _checkEntityHasAttribute(attributeName, entityMeta) {
  return entityMeta.ATTRIBUTES.find(function (element) {
    return element.ATTR_NAME === attributeName;
  })
}

function _checkEntityInvolvesRelationship(relationshipID, entityMeta) {
  return entityMeta.ROLES.find(function (element) {
    let relationship = element.RELATIONSHIPS.find(function (element) {
      return element.RELATIONSHIP_ID === relationshipID;
    });
    if(relationship) return true;
  });
}

function _checkEntityHasRelation(relationID, entityMeta) {
  let role = entityMeta.ROLES.find(function (element) {
    return element.RELATIONS.find(function (element) {
      return element.RELATION_ID === relationID;
    })
  });

  return role?role.RELATIONS.find(function (element) {
    return element.RELATION_ID === relationID;
  }):false;
}
/**
 * Check foreign key exist from the right relation
 * @param relationRow
 * @param association
 * {
 *    RIGHT_RELATION_ID: 'r_employee',
 *    CARDINALITY: '[1..1]',
 *    FOREIGN_KEY_CHECK: 0,
 *    FIELDS_MAPPING: [{LEFT_FIELD: 'USER_ID', RIGHT_FIELD: 'USER_ID'}]
 *  }
 * @param callback
 * @private
 */
function _checkForeignKey(relationRow, association, callback) {
  let selectSQL = "select * from " + entityDB.pool.escapeId(association.RIGHT_RELATION_ID) + " where ";
  let foreignKeyValue = '';

  association.FIELDS_MAPPING.forEach(function (element, index) {
    if(index === 0){
      selectSQL = selectSQL +
        entityDB.pool.escapeId(element.RIGHT_FIELD) + " = " + entityDB.pool.escape(relationRow[element.LEFT_FIELD]);
      foreignKeyValue = foreignKeyValue + element.RIGHT_FIELD + " : " + relationRow[element.LEFT_FIELD];
    }else{
      selectSQL = selectSQL + " and " +
        entityDB.pool.escapeId(element.RIGHT_FIELD) + " = " + entityDB.pool.escape(relationRow[element.LEFT_FIELD]);
      foreignKeyValue = foreignKeyValue + " , " + element.RIGHT_FIELD + " : " + relationRow[element.LEFT_FIELD];
    }
  });

  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (rows.length === 0)
      callback(null, message.report('ENTITY','FOREIGN_KEY_CHECK_ERROR','E',foreignKeyValue,association.RIGHT_RELATION_ID));
    else callback(null, null);
  })
}

function _checkEntityExist(relationshipInstance, callback) {
  let selectSQL = "select * from ENTITY_INSTANCES where INSTANCE_GUID = "
    + entityDB.pool.escape(relationshipInstance.INSTANCE_GUID)
    + " and ENTITY_ID = " + entityDB.pool.escape(relationshipInstance.ENTITY_ID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (rows.length === 0)
      callback(null, message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', relationshipInstance.INSTANCE_GUID));
    else callback(null, null);
  })
}

function _checkInstanceInvolvedInRelationship(selfGUID, relationship, relationshipSQLs, SQLs, callback) {
  let selectSQL = "SELECT A.RELATIONSHIP_INSTANCE_GUID FROM RELATIONSHIP_INVOLVES_INSTANCES as A " +
    "JOIN RELATIONSHIP_INVOLVES_INSTANCES as B ON A.RELATIONSHIP_INSTANCE_GUID = B.RELATIONSHIP_INSTANCE_GUID " +
    "WHERE A.RELATIONSHIP_ID = " + entityDB.pool.escape(relationship.RELATIONSHIP_ID) +
    " AND A.ENTITY_INSTANCE_GUID = " + entityDB.pool.escape(selfGUID) +
    " AND B.ENTITY_INSTANCE_GUID = " + entityDB.pool.escape(relationship.INSTANCE_GUID);

  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (results.length === 0) {
      relationshipSQLs.forEach(function (element) {
        if (element.PARTNER_INSTANCE_GUID === relationship.INSTANCE_GUID && element.action === 'add')
          SQLs.push(element.SQL)
      })
    } else {
      relationshipSQLs.forEach(function (element) {
        if (element.PARTNER_INSTANCE_GUID === relationship.INSTANCE_GUID && element.action === 'update')
          SQLs.push(element.SQL + entityDB.pool.escape(results[0]['RELATIONSHIP_INSTANCE_GUID']));
      })
    }
    callback(null);
  })
}

function _checkAdd01Relation(relationID, instanceGUID, callback) {
  let selectSQL = "select * from " + entityDB.pool.escapeId(relationID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (results.length > 0) callback(null, message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', relationID));
    else callback(null, null);
  })
}

function _checkDelete1nRelation(deleteRelation, instanceGUID, callback) {
  let selectSQL = "select * from " + entityDB.pool.escapeId(deleteRelation.RELATION_ID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (results.length <= deleteRelation.COUNT)
      callback(null, message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', deleteRelation.RELATION_ID));
    else callback(null, null);
  })
}
/**
 * Get the instance GUID from a give business ID.
 * The given business ID must have 1:1 relationship with the Entity
 * @param idAttr
 * example: {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(err, instanceGUID)
 * @private
 */
function _getGUIDFromBusinessID(idAttr, callback) {
  if(!idAttr.RELATION_ID)return callback(message.report('ENTITY', 'RELATION_ID_MISSING', 'E'));

  let entityMeta = entityDB.getEntityMeta(idAttr.RELATION_ID);
  let relationMeta = entityDB.getRelationMeta(idAttr.RELATION_ID);
  if(!entityMeta && !relationMeta)return callback(message.report('ENTITY', 'RELATION_NOT_EXIST', 'E', idAttr.RELATION_ID));

  let uniqueAttributes;
  let primaryAttributes;
  if(entityMeta){
    uniqueAttributes = _.where(entityMeta.ATTRIBUTES, {UNIQUE: 1});
  } else {
    uniqueAttributes = _.where(relationMeta.ATTRIBUTES, {UNIQUE: 1});
    primaryAttributes = _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY: 1});
  }

  let uniqueIDKey = {};
  let primaryIDKeys = {};
  _.every(idAttr, function (value, key) { //Get unique attribute or primary key attributes
    if(key === 'RELATION_ID') return true; //Continue

    if(uniqueAttributes.find(function (element) {
      return element.ATTR_NAME === key;
    })){
      uniqueIDKey[key] = value;
      return false; //Break
    }

    if(primaryAttributes.find(function (element) {
      return element.ATTR_NAME === key;
    })) primaryIDKeys[key] = value;
  });

  //Compose select SQL
  let selectSQL;
  if(_.keys(uniqueIDKey).length === 1){ //If unique ID is provided
    let uniqueAttribute = _.keys(uniqueIDKey)[0];
    if(entityMeta){ //Get GUID from unique attribute index table
      let uniqueAttributeIndex = entityMeta.UNIQUE_ATTRIBUTE_INDICES.find(function(element){
        return element.ATTR_NAME === uniqueAttribute;
      });
      selectSQL = "select INSTANCE_GUID from " + entityDB.pool.escapeId(uniqueAttributeIndex.IDX_TABLE)
        + " where VALUE = " + entityDB.pool.escape(_.values(uniqueIDKey)[0]);
    }else{ //Get GUID from corresponding relation table
      selectSQL = "select INSTANCE_GUID from " + entityDB.pool.escapeId(idAttr.RELATION_ID)
        + " where " + entityDB.pool.escapeId(uniqueAttribute) + " = " + entityDB.pool.escape(_.values(uniqueIDKey)[0]);
    }
  }else{ //If primary keys are provided
    let missingPrimaryKey;
    _.every(primaryAttributes, function (element) {
      if(!primaryIDKeys[element.ATTR_NAME]){
        missingPrimaryKey = element.ATTR_NAME;
        return false;
      }
    });

    if(missingPrimaryKey)
      return callback(message.report('ENTITY', 'PRIMARY_KEY_INCOMPLETE', 'E', missingPrimaryKey));

    selectSQL = "select INSTANCE_GUID from " + entityDB.pool.escapeId(idAttr.RELATION_ID);
    let whereClause;
    _.each(primaryIDKeys, function(value, key){
      whereClause?whereClause = whereClause + " and " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(value):
        whereClause = " where " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(value);
    });
    if(whereClause)selectSQL = selectSQL + whereClause;
  }

  entityDB.executeSQL(selectSQL, function(err, results){
    if(err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if(results.length === 0) return callback(message.report('ENTITY', 'INSTANCE_NOT_EXIST', 'E', uniqueIDKey));

    if(entityMeta) return callback(null, results[0].INSTANCE_GUID); // Unique attribute index table

    _getEntityInstanceHead(results[0].INSTANCE_GUID, function (err, instanceHead) {
      if(err) return callback(err);
      let entityMeta = entityDB.getEntityMeta(instanceHead.ENTITY_ID);
      let roleRelationMeta = _checkEntityHasRelation(idAttr.RELATION_ID, entityMeta);
      if (roleRelationMeta && ( roleRelationMeta.CARDINALITY === '[1..1]' || roleRelationMeta.CARDINALITY === '[0..1]'))
        callback(null, instanceHead.INSTANCE_GUID);
      else
        callback(message.report('ENTITY', 'INSTANCE_NOT_DERIVE', 'E', idAttr.RELATION_ID));
    })
  })
}
