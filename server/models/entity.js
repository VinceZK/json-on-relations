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
const msgArray = require('./message_entity.js');

const msgStore = new MsgArrayStore(msgArray);
const message = new Message(msgStore, 'EN');

module.exports = {
  entityDB: entityDB,
  getEntityMeta: getEntityMeta,
  getRelationMeta: getRelationMeta,
  getRelationMetaOfEntity: getRelationMetaOfEntity,
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

function getEntityMeta(entityID) {
  let entityMeta = entityDB.getEntityMeta(entityID);
  return entityMeta? entityMeta : message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', entityID);
}

function getRelationMeta(relationID) {
  let relationMeta = entityDB.getRelationMeta(relationID);
  return relationMeta? relationMeta : message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', relationID);
}

function getRelationMetaOfEntity(entityID) {
  let entityMeta = entityDB.getEntityMeta(entityID);
  let relationMetas = [];
  relationMetas.push(entityDB.getRelationMeta(entityID));

  entityMeta.ROLES.forEach(function (role) {
    role.RELATIONS.forEach(function (relation) {
      relationMetas.push(entityDB.getRelationMeta(relation.RELATION_ID));
    });
    role.RELATIONSHIPS.forEach(function (relationship) {
      let relationMeta = entityDB.getRelationMeta(relationship.RELATIONSHIP_ID);
      let isExist = relationMetas.findIndex(function (existRelationMeta) {
        return existRelationMeta.RELATION_ID === relationMeta.RELATION_ID;
      });
      if (isExist === -1)relationMetas.push(relationMeta);
    })
  });
  return relationMetas;
}
/**
 * save the entity JSON object in DB
 * @param instance = JSON object, for example:
 * { ENTITY_ID: 'people',
 *   --attribute1: 'value1', attribute2: 'value2', attribute3: ['s1', 's2', 's3'] ... ,
 *   relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ... ,
 *   relationships:[
 *    {RELATIONSHIP_ID: 'user_role',
       values:[
         {action: 'add', VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2018-07-04 00:00:00', SYNCED: 0,
          PARTNER_INSTANCES: [
            {ENTITY_ID:'system_role', ROLE_ID:'system_role', INSTANCE_GUID:'C1D5765AFB9E92F87C936C079837842C'}
        ]}
       ]}]
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
        _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
        break;
      default:
        if (_isRelation(key)) { //Relations
          results = _generateCreateRelationSQL(value, key, entityMeta, foreignRelations, instanceGUID);
          _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
        } else { //Illegal node
          errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
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
    deleteSQLs.push("delete from " + entityDB.pool.escapeId(entityMeta.ENTITY_ID)
      + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
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
      if(GUIDArray) {
        GUIDArray = GUIDArray + " )";
        deleteSQLs.push("delete from RELATIONSHIP_INSTANCES where RELATIONSHIP_INSTANCE_GUID in " + GUIDArray);
        deleteSQLs.push("delete from RELATIONSHIP_INVOLVES_INSTANCES where RELATIONSHIP_INSTANCE_GUID in " + GUIDArray);
      }

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
 * {  ENTITY_ID: 'people', INSTANCE_GUID: '9718C0E8783C1F86EC212C8436A958C5',
      --HOBBY: ['Reading', 'Movie', 'Coding'], HEIGHT: 170, GENDER: 'male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E',
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
         {RELATIONSHIP_ID: 'user_role', PARTNER_ENTITY_ID: 'system_role',PARTNER_ROLE_ID: 'system_role',
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
      // function (callback) { // Commented due to attributes are not needed
      //   __getAttributeValue(instanceGUID, instance, entityMeta, callback);
      // },
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

  function __getAttributeValue(instanceGUID, instance, entityMeta, callback) {
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

  function __getRelationshipAttributeValue(instanceGUID, instance, relationshipID, callback) {
    let selectSQL = "select * from " + entityDB.pool.escapeId(relationshipID) +
                    " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    entityDB.executeSQL(selectSQL, function (err, results) {
      if(err)return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
      _.each(results[0], function (attrValue, attrKey) {
        if (attrKey === 'INSTANCE_GUID') return;
        instance[attrKey] = attrValue;
      });
      callback(null);
    });
  }

  function __getRelationValue(instance, entityMeta, callback) {
    let relations = [{RELATION_ID: entityMeta.ENTITY_ID, CARDINALITY: '[1..1]'}];
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
        if(results.length > 0){
          results.forEach(function (line) {
            delete line.INSTANCE_GUID;
          });
          instance[relation.RELATION_ID] = results;
        }
        callback(null);
      })
    },function (err) {
      if(err)callback(err);
      callback(null);
    })
  }

  function __getRelationshipValue(instance, entityMeta, callback) {
    let selectSQL =
      "select A.RELATIONSHIP_ID, A.ENTITY_INSTANCE_GUID, A.ENTITY_ID, A.ROLE_ID, B.RELATIONSHIP_INSTANCE_GUID, B.VALID_FROM, B.VALID_TO" +
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
      const groupByRelationshipID = _.groupBy(results, 'RELATIONSHIP_ID');
      _.each(groupByRelationshipID, function (value) {
        let selfRoleID = value.find(function (element) {
          return element['ENTITY_INSTANCE_GUID'] === instanceGUID
        }).ROLE_ID;

        value.forEach(function (row) {
          if(row['ENTITY_INSTANCE_GUID'] === instanceGUID) return; //Bypass self
          let relationship = instance.relationships.find(function (element) {
            return element.RELATIONSHIP_ID === row.RELATIONSHIP_ID;
          });
          if(relationship){
            let relationshipInstance = relationship.values.find(function (element) {
              return element.RELATIONSHIP_INSTANCE_GUID === row['RELATIONSHIP_INSTANCE_GUID'];
            });
            if (relationshipInstance)
              relationshipInstance.PARTNER_INSTANCES.push({
                ENTITY_ID: row['ENTITY_ID'],
                ROLE_ID: row['ROLE_ID'],
                INSTANCE_GUID: row['ENTITY_INSTANCE_GUID']
              });
            else
              relationship.values.push({
                RELATIONSHIP_INSTANCE_GUID: row['RELATIONSHIP_INSTANCE_GUID'],
                VALID_FROM: row['VALID_FROM'], VALID_TO: row['VALID_TO'],
                PARTNER_INSTANCES: [{
                  ENTITY_ID: row['ENTITY_ID'],
                  ROLE_ID: row['ROLE_ID'],
                  INSTANCE_GUID: row['ENTITY_INSTANCE_GUID']
                }]
              });
          }else{
            relationship = {
              RELATIONSHIP_ID: row['RELATIONSHIP_ID'],
              SELF_ROLE_ID: selfRoleID,
              values:[
                {
                  RELATIONSHIP_INSTANCE_GUID: row['RELATIONSHIP_INSTANCE_GUID'],
                  VALID_FROM: row['VALID_FROM'], VALID_TO: row['VALID_TO'],
                  PARTNER_INSTANCES: [{
                    ENTITY_ID: row['ENTITY_ID'],
                    ROLE_ID: row['ROLE_ID'],
                    INSTANCE_GUID: row['ENTITY_INSTANCE_GUID']
                  }]
                }]
            };
            instance.relationships.push(relationship);
          }
        });
      });

      async.map(instance.relationships, function (relationship, callback) {
        async.map(relationship.values, function(value, callback) {
          __getRelationshipAttributeValue(value.RELATIONSHIP_INSTANCE_GUID, value, relationship.RELATIONSHIP_ID, callback)
        }, callback);
      }, callback);
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
 *   --attribute1: 'value1', attribute2: 'value2', attribute3: ['s1', 's2', 's3'] ... ,
 *   relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ... ,
 *   relationships:[
 *     {RELATIONSHIP_ID: 'user_role', PARTNER_ROLE_ID: 'system_role', PARTNER_ENTITY_ID: 'system_role',
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

    //Parse the given instance JSON and convert it SQLs
    _.each(instance, function (value, key) {
      switch (key){
        case 'ENTITY_ID':
          break;
        case 'INSTANCE_GUID':
          break;
        case 'relationships':
          results = _generateRelationshipsSQL(value, entityMeta, instance['INSTANCE_GUID'], relationshipInstances);
          _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
          break;
        default:
          if (_isRelation(key)) { //Relations
            results = _generateChangeRelationSQL(value, key, entityMeta, foreignRelations,
              instance['INSTANCE_GUID'], add01Relations, delete1nRelations);
            _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
          } else { //Illegal node
            errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
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
          _checkRelationshipValueValidity(
            instance['INSTANCE_GUID'], relationshipInstance, callback)
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
 * [ {RELATIONSHIP_ID: 'user_role',
     values:[
       {action: 'update', RELATIONSHIP_INSTANCE_GUID: '59C251A0931A11E8BC10FDF4600DED71', SYNCED: 1},
       {action: 'expire', RELATIONSHIP_INSTANCE_GUID: '59C251A0931A11E8BC10FDF4600DED72'},
       {action: 'delete', RELATIONSHIP_INSTANCE_GUID: '59C251A0931A11E8BC10FDF4600DED73'},
       {action: 'extend', RELATIONSHIP_INSTANCE_GUID: '59C251A0931A11E8BC10FDF4600DED7F', VALID_TO:'2030-12-31 00:00:00',},
       {action: 'add', VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2018-07-04 00:00:00', SYNCED: 0,
        PARTNER_INSTANCES: [
          {ENTITY_ID:'system_role', ROLE_ID:'system_role', INSTANCE_GUID:'C1D5765AFB9E92F87C936C079837842C'}
        ]}
     ]}
   ]
 * actions: 'update','expire','delete','extend' can be operated together without any conflicts
 * However, action 'add' cannot mix with 'expire', 'delete', and 'extend'
 * This is due to the fact that all operations on an entity is submit together
 * without any dependency and sequence. But prohibit mixing 'add' and 'expire' is unacceptable
 * from business point of view. So the model will not check the overlaps on the validity period
 * which caused by uncertainty when mixing the actions. The UI layer can do a pre-check before
 * submitting to the model as most of the time, UI has all the relationships of an entity.
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
    if(!roleMeta)
      return errorMessages.push(
        message.report('ENTITY', 'RELATIONSHIP_NOT_VALID', 'E', relationship['RELATIONSHIP_ID'], entityMeta.ENTITY_ID));
    let relationshipMeta = roleMeta.RELATIONSHIPS.find(function (element) {
      return element.RELATIONSHIP_ID === relationship['RELATIONSHIP_ID'];
    });

    const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
    // let changeOperation = false;
    // let addOperation = false;
    relationship['values'].forEach(function (value) {
      switch (value.action) {
        case 'update':
          if(!value.RELATIONSHIP_INSTANCE_GUID)
            return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
          break;
        case 'delete':
          // if(addOperation)
          //   return errorMessages.push(message.report('ENTITY', 'NO_MIX_OF_CHANGE_ADD_OPERATION', 'E'));
          // changeOperation = true;
          if(!value.RELATIONSHIP_INSTANCE_GUID)
            return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
          SQLs.push("delete from RELATIONSHIP_INSTANCES where RELATIONSHIP_INSTANCE_GUID = "
                     + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
          SQLs.push("delete from RELATIONSHIP_INVOLVES_INSTANCES where RELATIONSHIP_INSTANCE_GUID = "
            + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
          break;
        case 'expire':
          // if(addOperation)
          //   return errorMessages.push(message.report('ENTITY', 'NO_MIX_OF_CHANGE_ADD_OPERATION', 'E'));
          // changeOperation = true;
          if(!value.RELATIONSHIP_INSTANCE_GUID)
            return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
          SQLs.push("update RELATIONSHIP_INSTANCES set VALID_TO = " + entityDB.pool.escape(currentTime)
              + " where RELATIONSHIP_INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
          break;
        case 'extend':
          // if(addOperation)
          //   return errorMessages.push(message.report('ENTITY', 'NO_MIX_OF_CHANGE_ADD_OPERATION', 'E'));
          // changeOperation = true;
          if(!value.RELATIONSHIP_INSTANCE_GUID)
            return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
          if(!value['VALID_TO'])
            value['VALID_TO'] = timeUtil.getFutureDateTime(relationshipMeta.VALID_PERIOD, "yyyy-MM-dd HH:mm:ss");
          if(value['VALID_TO'] <= currentTime)
            return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_EXTEND_BEFORE_CURRENT', 'E'));
          SQLs.push("update RELATIONSHIP_INSTANCES set VALID_TO = " + entityDB.pool.escape(value['VALID_TO'])
            + " where RELATIONSHIP_INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
          break;
        case 'add':
          // if(changeOperation)
          //   return errorMessages.push(message.report('ENTITY', 'NO_MIX_OF_CHANGE_ADD_OPERATION', 'E'));
          // addOperation = true;
          if(!value['PARTNER_INSTANCES'])
            return errorMessages.push(message.report('ENTITY', 'PARTNER_INSTANCES_MISSING','E'));
          if (value['PARTNER_INSTANCES'].length !== relationshipMeta.INVOLVES.length - 1 )
            return errorMessages.push(message.report('ENTITY', 'INVOLVED_ROLE_NUMBER_INCORRECT','E',
              relationship.RELATIONSHIP_ID, relationshipMeta.INVOLVES.length, value['PARTNER_INSTANCES'].length+1));
          value['PARTNER_INSTANCES'].forEach(function (partnerInstance) {
            let index = relationshipMeta.INVOLVES.findIndex(function (involve) {
              return involve.ROLE_ID === partnerInstance.ROLE_ID;
            });
            if(index === -1) errorMessages.push(
              message.report('ENTITY', 'ROLE_NOT_VALID', 'E', partnerInstance.ROLE_ID, relationshipMeta.RELATIONSHIP_ID));
          });

          value.RELATIONSHIP_INSTANCE_GUID = guid.genTimeBased();
          if(!value['VALID_FROM'] ||
            Math.abs(timeUtil.StringToDate(value['VALID_FROM']).DateDiff('s', currentTime)) <= 60) //Tolerance 60 seconds
            value['VALID_FROM'] = currentTime;
          if(value['VALID_FROM'] < currentTime)
            return errorMessages.push(message.report('ENTITY','NEW_RELATIONSHIP_ADD_TO_BEFORE', 'E'));
          if(!value['VALID_TO'])
            value['VALID_TO'] = timeUtil.getFutureDateTime(relationshipMeta.VALID_PERIOD, "yyyy-MM-dd HH:mm:ss");
          if(value['VALID_TO'] < value['VALID_FROM'])
            return errorMessages.push(message.report('ENTITY','VALID_TO_BEFORE_VALID_FROM', 'E', value['VALID_TO'], value['VALID_FROM']));
          SQLs.push("insert into RELATIONSHIP_INSTANCES values (" + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID) + " , "
              + entityDB.pool.escape(value['VALID_FROM']) + " , " + entityDB.pool.escape(value['VALID_TO']) + " , "
              + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + ")");
          SQLs.push("insert into RELATIONSHIP_INVOLVES_INSTANCES values (" + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID) + " , "
              + entityDB.pool.escape(instanceGUID) + " , " + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + " , "
              + entityDB.pool.escape(entityMeta.ENTITY_ID) + " , " + entityDB.pool.escape(roleMeta.ROLE_ID) + ")");
          value['PARTNER_INSTANCES'].forEach(function (partnerInstance) {
            SQLs.push("insert into RELATIONSHIP_INVOLVES_INSTANCES values (" + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID) + " , "
              + entityDB.pool.escape(partnerInstance.INSTANCE_GUID) + " , " + entityDB.pool.escape(relationshipMeta.RELATIONSHIP_ID) + " , "
              + entityDB.pool.escape(partnerInstance.ENTITY_ID)+ " , " + entityDB.pool.escape(partnerInstance.ROLE_ID) + ")");
          });
          break;
        default:
          return errorMessages.push(
            message.report('ENTITY', 'RELATIONSHIP_ACTION_INVALID', 'E', relationship['RELATIONSHIP_ID']));
      }

      let relationMeta = entityDB.getRelationMeta(relationship.RELATIONSHIP_ID);
      if(value.action === 'update'){
        let updateSQL;
        _.each(value, function (attrValue, attrKey) {
          if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' || attrKey === 'PARTNER_INSTANCES'
            || attrKey === 'VALID_FROM' || attrKey === 'VALID_TO') return;

          let attributeMeta = relationMeta.ATTRIBUTES.find(function (ele) {
            return ele.ATTR_NAME === attrKey;
          });
          if(attributeMeta){
            if (updateSQL) {
              updateSQL = updateSQL + " , " + entityDB.pool.escapeId(attrKey) + " = " + entityDB.pool.escape(attrValue);
            }else{
              updateSQL = "update " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID) + " set "
                + entityDB.pool.escapeId(attrKey) + " = " + entityDB.pool.escape(attrValue);
            }
          } else {
            errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', attrKey, relationMeta.RELATION_ID));
          }
        });
        if (updateSQL) {
          updateSQL = updateSQL + " where INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID);
          SQLs.push(updateSQL);
        }
      } else if (value.action === 'add'){
        let insertFields = " ( `INSTANCE_GUID`" ;
        let insertValues = " ( " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID);
        _.each(value, function (attrValue, attrKey) {
          if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' || attrKey === 'PARTNER_INSTANCES'
            || attrKey === 'VALID_FROM' || attrKey === 'VALID_TO') return;

          let attributeMeta = relationMeta.ATTRIBUTES.find(function (ele) {
            return ele.ATTR_NAME === attrKey;
          });
          if(attributeMeta){
            insertFields = insertFields + ", " + entityDB.pool.escapeId(attrKey);
            insertValues = insertValues + ", " + entityDB.pool.escape(attrValue);
          } else {
            errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', attrKey, relationMeta.RELATION_ID));
          }
        });
        insertFields = insertFields + " )";
        insertValues = insertValues + " )";
        SQLs.push("insert into " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID) + insertFields + " values " + insertValues);
      }

      if(relationshipInstances){ //For relationship instance validity check
        let relationshipInstance =
          { RELATIONSHIP_ID: relationship['RELATIONSHIP_ID'],
            RELATIONSHIP_INSTANCE_GUID: value['RELATIONSHIP_INSTANCE_GUID'],
            VALID_FROM: value['VALID_FROM'],
            VALID_TO: value['VALID_TO'],
            action: value.action
          };
        if(value['PARTNER_INSTANCES']){ //Add operation
          value['PARTNER_INSTANCES'].forEach(function (partnerInstance) {
            let relationshipInstanceClone = _.clone(relationshipInstance);
            relationshipInstanceClone.ENTITY_ID = partnerInstance.ENTITY_ID;
            relationshipInstanceClone.PARTNER_INSTANCE_GUID = partnerInstance.INSTANCE_GUID;
            const involveMeta = relationshipMeta.INVOLVES.find(function (involve) {return involve.ROLE_ID === partnerInstance.ROLE_ID;});
            if (involveMeta) relationshipInstanceClone.CARDINALITY = involveMeta.CARDINALITY;
            relationshipInstances.push(relationshipInstanceClone);
          });
        }else{
          relationshipInstances.push(relationshipInstance); //Other operations
        }
      }
    }); // Loop values end

    const groupByCardinality = _.groupBy(relationshipInstances, 'CARDINALITY');
    _.each(groupByCardinality, function (value, key) {
      if(key === '[1..1]') __checkOverlap(value);
      else if(key === '[1..n]'){
        const groupByPartnerInstanceGUID = _.groupBy(value, 'PARTNER_INSTANCE_GUID');
        _.each(groupByPartnerInstanceGUID, function (groupedValue) {
          __checkOverlap(groupedValue);
        })
      }
    });

    if (errorMessages.length > 0) return errorMessages;
  });

  if (errorMessages.length > 0) return errorMessages;
  return SQLs;

  function __checkOverlap(values) {
    values.forEach(function (value, index) {
      for (let i = index+1; i<values.length; i++) {
        if (value.VALID_FROM < values[i].VALID_TO && value.VALID_TO > values[i].VALID_FROM)
          return errorMessages.push(
            message.report('ENTITY','RELATIONSHIP_INSTANCE_OVERLAP','E',
              value.VALID_FROM+'~'+value.VALID_TO, values[i].VALID_FROM+'~'+values[i].VALID_TO));
      }
    });
  }
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
        results = _generateUpdateSingleRelationSQL(relationMeta, value, entityMeta, instanceGUID, foreignRelations);
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
  } else { // Entity or Relationship's attribute relation may not have any attributes. However, the instance GUID must be inserted.
    if (relationMeta.RELATION_ID.substr(0,2) !== 'r_' || relationMeta.RELATION_ID.substr(0,3) !== 'rs_') {
      insertSQLs.push("insert into " + entityDB.pool.escapeId(relationMeta.RELATION_ID) +
        " (`INSTANCE_GUID`) values (" + entityDB.pool.escape(instanceGUID) + " ) ");
    }
  }
  return insertSQLs;
}

/**
 * Generate update SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @param entityMeta
 * @param instanceGUID
 * @param foreignRelations
 * @returns {Array}
 * @private
 */
function _generateUpdateSingleRelationSQL(relationMeta, relationRow, entityMeta, instanceGUID, foreignRelations) {
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

  // in case entity relation, then the primary key is instance_guid.
  if (relationMeta.RELATION_ID === entityMeta.ENTITY_ID) {
    whereClause = " where `INSTANCE_GUID` = " +  entityDB.pool.escape(instanceGUID);
  }

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

        const association = relationMeta.ASSOCIATIONS.find(function (association) {
          if (association.FOREIGN_KEY_CHECK === 1) {
            const index = association.FIELDS_MAPPING.findIndex(function (fieldMap) {
              return fieldMap.LEFT_FIELD === key;
            });
            if (index !== -1) return true;
          }
        });
        if (association)
          foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: relationRow, association: association});
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
  if (relationID === entityMeta.ENTITY_ID) {
    return {RELATION_ID: relationID, CARDINALITY: '[1..1]'};
  }

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
  if (relationshipInstance.action !== 'add') return callback(null, null);
  let selectSQL = "select * from ENTITY_INSTANCES where INSTANCE_GUID = "
    + entityDB.pool.escape(relationshipInstance.PARTNER_INSTANCE_GUID)
    + " and ENTITY_ID = " + entityDB.pool.escape(relationshipInstance.ENTITY_ID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (rows.length === 0)
      callback(null, message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', relationshipInstance.PARTNER_INSTANCE_GUID));
    else callback(null, null);
  })
}

function _checkRelationshipValueValidity(selfGUID, relationship, callback) {
  let selectSQL;
  if (relationship.action === 'add'){
    selectSQL = "SELECT A.RELATIONSHIP_INSTANCE_GUID, A.VALID_FROM, A.VALID_TO, " +
      "B.ENTITY_INSTANCE_GUID AS SELF_GUID, C.ENTITY_INSTANCE_GUID AS PARTNER_INSTANCE_GUID " +
      "FROM RELATIONSHIP_INSTANCES as A " +
      "JOIN RELATIONSHIP_INVOLVES_INSTANCES as B " +
      "ON A.RELATIONSHIP_INSTANCE_GUID = B.RELATIONSHIP_INSTANCE_GUID " +
      "JOIN RELATIONSHIP_INVOLVES_INSTANCES as C " +
      "ON A.RELATIONSHIP_INSTANCE_GUID = C.RELATIONSHIP_INSTANCE_GUID " +
      "WHERE B.RELATIONSHIP_ID = " + entityDB.pool.escape(relationship.RELATIONSHIP_ID) +
      " AND B.ENTITY_INSTANCE_GUID = " + entityDB.pool.escape(selfGUID);
    if (relationship.CARDINALITY === '[1..1]')
      selectSQL = selectSQL + " AND C.ENTITY_INSTANCE_GUID != " + entityDB.pool.escape(selfGUID);
    else if (relationship.CARDINALITY === '[1..n]')
      selectSQL = selectSQL + " AND C.ENTITY_INSTANCE_GUID = " + entityDB.pool.escape(relationship.PARTNER_INSTANCE_GUID);
  } else {
    selectSQL = "SELECT * from RELATIONSHIP_INSTANCES where RELATIONSHIP_INSTANCE_GUID = " +
      entityDB.pool.escape(relationship.RELATIONSHIP_INSTANCE_GUID);
  }

  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
    if (relationship.action === 'add') {
      const line = results.find(function (result) {
        return (relationship.VALID_FROM < result.VALID_TO && relationship.VALID_TO > result.VALID_FROM);
      });
      if (line)
        return callback(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_OVERLAP', 'E',
          relationship.VALID_FROM+'~'+relationship.VALID_TO, line.VALID_FROM+'~'+line.VALID_TO));
    } else {
      const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
      if (results.length === 0)
        return callback(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_NOT_EXIST', 'E', relationship.RELATIONSHIP_INSTANCE_GUID));
      let originalValue = results[0];
      if (originalValue.VALID_TO <= currentTime)
        return callback(message.report('ENTITY', 'CHANGE_TO_EXPIRED_RELATIONSHIP', 'E', relationship.RELATIONSHIP_INSTANCE_GUID));
      if((relationship.action === 'expire' || relationship.action === 'extend') && originalValue.VALID_FROM > currentTime)
        return callback(message.report('ENTITY', 'FUTURE_RELATIONSHIP', 'E', originalValue.RELATIONSHIP_INSTANCE_GUID));
      if(relationship.action === 'delete' && originalValue.VALID_FROM <= currentTime)
        return callback(message.report('ENTITY', 'RELATIONSHIP_DELETION_NOT_ALLOWED', 'E'));
    }
    callback(null);
  });
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

  let relationMeta = entityDB.getRelationMeta(idAttr.RELATION_ID);
  if(!relationMeta)return callback(message.report('ENTITY', 'RELATION_NOT_EXIST', 'E', idAttr.RELATION_ID));

  let uniqueAttributes = _.where(relationMeta.ATTRIBUTES, {UNIQUE: 1});
  let primaryAttributes = _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY: 1});
  if (!uniqueAttributes) uniqueAttributes = [];
  if (!primaryAttributes) primaryAttributes = [];

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
      selectSQL = "select INSTANCE_GUID from " + entityDB.pool.escapeId(idAttr.RELATION_ID)
        + " where " + entityDB.pool.escapeId(uniqueAttribute) + " = " + entityDB.pool.escape(_.values(uniqueIDKey)[0]);
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
