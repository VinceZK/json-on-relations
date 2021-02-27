/**
 * Created by VinceZK on 10/25/14.
 * { ENTITY_ID: 'people',
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
 *                         INVOLVES: [ { ROLE_ID: 'system_user', CARDINALITY: '[1..1]' },
 *                                     { ROLE_ID: 'user_role', CARDINALITY: '[1..n]' } ]}]
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
const entityDB = require('./connections/sql_mdb.js');
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
  listAllEntityIDs: listAllEntityIDs,
  listEntityIDbyRole: listEntityIDbyRole,
  createInstance: createInstance,
  getInstanceByGUID: getInstanceByGUID,
  getInstanceByID: getInstanceByID,
  getInstancePieceByGUID: getInstancePieceByGUID,
  getInstancePieceByID: getInstancePieceByID,
  changeInstance: changeInstance,
  overwriteInstance: overwriteInstance,
  softDeleteInstanceByGUID: softDeleteInstanceByGUID,
  softDeleteInstanceByID: softDeleteInstanceByID,
  restoreInstanceByGUID: restoreInstanceByGUID,
  restoreInstanceByID: restoreInstanceByID,
  hardDeleteByGUID: hardDeleteByGUID,
  hardDeleteByID: hardDeleteByID,
  orchestrate: orchestrate
};

/**
 * Get the meta of an entity through its entity ID
 * @param entityID
 * @param callback(errs|entityMeta)
 */
function getEntityMeta(entityID, callback) {
  entityDB.getEntityMeta(entityID, function(err, entityMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (entityMeta) {
      callback(entityMeta);
    } else {
      callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', entityID)]);
    }
  });
}

/**
 * Get the meta of a relation through its relation ID
 * @param relationID
 * @param callback(errs|relationMeta)
 */
function getRelationMeta(relationID, callback) {
  entityDB.getRelationMeta(relationID, function(err, relationMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (relationMeta) {
      callback(relationMeta);
    } else {
      callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', relationID)]);
    }
  });
}

/**
 * Get all relations meta of an entity through its entity ID
 * @param entityID
 * @param callback(errs|relationMeta[])
 */
function getRelationMetaOfEntity(entityID, callback) {
  entityDB.getEntityMeta(entityID, function (err, entityMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', entityID)]);

    const allRelevantRelationIDs = [entityID];
    entityMeta.ROLES.forEach( role => {
      role.RELATIONS.forEach( relation => allRelevantRelationIDs.push(relation.RELATION_ID) );
      role.RELATIONSHIPS.forEach( relationship => {
        if (allRelevantRelationIDs.findIndex(existRelationID => existRelationID === relationship.RELATIONSHIP_ID) === -1)
          allRelevantRelationIDs.push(relationship.RELATIONSHIP_ID);
      })
    });

    async.map(allRelevantRelationIDs, function (relationID, callback) {
      entityDB.getRelationMeta(relationID, function(err, relationMeta) {
        if (err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));
        if (!relationMeta) return callback(message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', relationID));
        callback(null, relationMeta);
      });
    }, function (err, result) {
      if (err) callback([err]);
      else callback(result);
    })
  });
}

/**
 * List all the entity IDs in the JOR system
 * @param callback(errs, IDs)
 */
function listAllEntityIDs(callback) {
  let selectSQL = "select ENTITY_ID from ENTITY order by ENTITY_ID";
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback([message.report('MODEL', 'GENERAL_ERROR', 'E', err)]);
    else callback(null, rows.map( row => row.ENTITY_ID ));
  });
}

/**
 * List all the entity IDs that are assigned with the given role
 * @param roleID
 * @param callback(errs, IDs)
 */
function listEntityIDbyRole(roleID, callback) {
  let selectSQL = "select ENTITY_ID from ENTITY_ROLES where ROLE_ID = " +
    entityDB.pool.escape(roleID) + " order by ENTITY_ID";
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback([message.report('MODEL', 'GENERAL_ERROR', 'E', err)]);
    else callback(null, rows.map( row => row.ENTITY_ID ));
  });
}

/**
 * Create an entity instance in DB from a given JSON object.
 * @param instance An entity instance in JSON.
 * @param callback (errs, result, insertSQLs)
 * errs: null if successful, or error messages;
 * result: JSON object with INSTANCE_GUID;
 * insertSQLs: the generated SQL scripts in creating the instance.
 * @param noCommit If true, the transaction will not be submitted to DB.
 *
 * @example
 * Following JSON is given to the instance parameter
 * ```
 *  { ENTITY_ID: 'person',
 *    person: {INSTANCE_GUID: 'C1D5765AFB9E92F87C936C079837842C'}
 *    relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *    relation2: {c: '3', b: '4'}, ... ,
 *    relationships:[
 *     {RELATIONSHIP_ID: 'rs_user_role',
 *      values:[
 *        {action: 'add', VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2018-07-04 00:00:00', SYNCED: 0,
 *         PARTNER_INSTANCES: [
 *           {ENTITY_ID:'system_role', ROLE_ID:'system_role', INSTANCE_GUID:'C1D5765AFB9E92F87C936C079837842C'}
 *       ]}
 *      ]}]}
 *  ```
 */
function createInstance(instance, callback, noCommit) {
  const instanceGUID = guid.genTimeBased();
  const insertSQLs = [];
  const errorMessages = [];
  const foreignRelations = [];
  const relationshipInstances = [];
  const valueCheckDomains = [];
  let insertSQL;
  if(!instance['ENTITY_ID']){
    return callback([message.report('ENTITY', 'ENTITY_ID_MISSING', 'E')]);
  }

  if(!instance[instance['ENTITY_ID']]){
    return callback([message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', instance['ENTITY_ID'], instance['ENTITY_ID'])]);
  }

  entityDB.getEntityMeta(instance['ENTITY_ID'], function (err, entityMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);
    entityMeta.ROLES.forEach( role => {
      if(_checkEntityRoleCondition(role, instance[entityMeta.ENTITY_ID])) {
        role.RELATIONS.forEach( relation => {
          if((relation.CARDINALITY === '[1..1]' || relation.CARDINALITY === '[1..n]') && !instance[relation.RELATION_ID])
            errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', relation.RELATION_ID, entityMeta.ENTITY_ID))
        })
      }
    });
    if(errorMessages.length > 0) return callback(errorMessages);

    const entityRelation = Array.isArray(instance[instance.ENTITY_ID])? instance[instance.ENTITY_ID][0] : instance[instance.ENTITY_ID];
    //Parse the given instance JSON and convert it to SQLs
    async.forEachOfSeries(instance, function (value, key, callback) {
      if (key === 'ENTITY_ID' || key === 'INSTANCE_GUID') {
        callback(null);
      } else if (key === 'relationships') {
        _generateRelationshipsSQL(value, entityMeta, instanceGUID, relationshipInstances, valueCheckDomains, entityRelation,
          function (results) {
            _hasErrors(results) ? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
            callback(null);
          });
      } else {
        _generateCreateRelationSQL(value, key, entityMeta, foreignRelations, valueCheckDomains, instance, instanceGUID,
          function (results) {
            _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(insertSQLs, results);
            callback(null);
          });
      }
    }, function ()
    {
      if(errorMessages.length > 0) return callback(errorMessages);
      //Insert entity instance
      insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
        + entityDB.pool.escape(instance['ENTITY_ID']) + ","
        + entityDB.pool.escape(instanceGUID) + ", 0 ," + "'1')";
      insertSQLs.push(insertSQL);

      async.series([
        function (callback) {//Foreign key check
          async.map(foreignRelations, function (relation, callback) {
            _checkForeignKey(relation.relationRow, relation.association, callback);
          }, function (err, results) {
            if(err) return callback(err); // err is an array
            const errMsgs = _condenseErrorMessages(results);
            if(errMsgs.length > 0) return callback(errMsgs);//The results should already be error messages
            else return callback(null);
          });
        },
        function (callback) {// Domain value check
          async.map(valueCheckDomains, function (valueCheckDomain, callback) {
            _checkDomainValue(valueCheckDomain, callback);
          }, function (err, results) {
            if(err) return callback(err); // err is an array
            const errMsgs = _condenseErrorMessages(results);
            if(errMsgs.length > 0) return callback(errMsgs);//The results should already be error messages
            else return callback(null);
          });
        },
        function (callback) {//Relationship instances check
          async.map(relationshipInstances, function (relationshipInstance, callback) {
            _checkEntityExist(relationshipInstance, callback)
          }, function (err, results) {
            if(err) return callback(err);
            const errMsgs = _condenseErrorMessages(results);
            if(errMsgs.length > 0) return callback(errMsgs); //The results should already be error messages
            else return callback(null);
          });
        },
        function (callback) {//Run all insert SQLs parallel
          if (noCommit) {
            callback(null);
          } else {
            entityDB.doUpdatesParallel(insertSQLs, function (err) {
              if (err) {
                callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
              } else {
                callback(null);
              }
            });
          }
        }
      ],function (errs) {
        if(errs) callback(errs); //The err should already be error messages
        else {
          instance['INSTANCE_GUID'] = instanceGUID;
          callback(null,instance,insertSQLs);
        }
      });
    });
  });
}

function _condenseErrorMessages(results) {
  return results.filter(function (ele) {
    return ele !== null;
  });
}

function _checkEntityRoleCondition(role, entityRelation) {
  return (!role.CONDITIONAL_ATTR ||
    (role.CONDITIONAL_ATTR && role.CONDITIONAL_VALUE.split(',').includes(entityRelation[role.CONDITIONAL_ATTR])));
}

/**
 * Soft delete an entity instance through instance GUID.
 * It doesn't physically delete the instance from DB,
 * but just sets the field DEL in the table ENTITY_INSTANCES to true.
 *
 * @param instanceGUID instance GUID
 * @param callback (errs, updateSQLs)
 * errs: null if successful, or error messages;
 * updateSQLs: the generated updating SQL scripts.
 * @param noCommit If true, the transaction will not be submitted to DB.
 */
function softDeleteInstanceByGUID(instanceGUID, callback, noCommit) {
  let updateSQL = "update ENTITY_INSTANCES set DEL = 1 where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  if (noCommit) return callback(null, [ updateSQL ]);
  entityDB.executeSQL(updateSQL, function (err) {
    if(err) callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    else callback(null);
  })
}

/**
 * Soft delete an entity instance through a business ID.
 *
 * @param idAttr Attributes in a relation that can uniquely identify an entity instance,
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'};
 * @param callback (errs)
 * errs: null if successful, or error messages.
 */
function softDeleteInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err); // err should be already a message array
    softDeleteInstanceByGUID(instanceGUID,callback);
  })
}

/**
 * Restore a soft deleted instance by setting DEL flag back to false through instance GUID.
 *
 * @param instanceGUID instance GUID
 * @param callback(errs)
 * errs: null if successful, or error messages.
 */
function restoreInstanceByGUID(instanceGUID, callback) {
  let updateSQL = "update ENTITY_INSTANCES set DEL = 0 where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(updateSQL, function (err) {
    if(err) callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    else callback(null);
  })
}

/**
 * Restore a soft deleted instance by setting DEL flag back to false through a business ID.
 *
 * @param idAttr Attributes in a relation that can uniquely identify an entity instance,
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'};
 * @param callback (errs)
 * errs: null if successful, or error messages.
 */
function restoreInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (errs, instanceGUID) {
    if(errs) return callback(errs);
    restoreInstanceByGUID(instanceGUID,callback);
  })
}

/**
 * Physically delete an entity instance from DB through instance GUID
 *
 * @param instanceGUID instance GUID
 * @param callback (errs, updateSQLs)
 * errs: null if successful, or error messages;
 * updateSQLs: the generated updating SQL scripts.
 * @param noCommit If true, the transaction will not be submitted to DB.
 */
function hardDeleteByGUID(instanceGUID, callback, noCommit) {
  _getEntityInstanceHead(instanceGUID, function (err, instanceHead) {
    if(err)return callback(err); //Already message instance

    if(instanceHead['DEL'] === 0)
      return callback([
        message.report('ENTITY', 'INSTANCE_NOT_MARKED_DELETE', 'E', instanceHead.INSTANCE_GUID, instanceHead.ENTITY_ID)]);

    entityDB.getEntityMeta(instanceHead.ENTITY_ID, function (err, entityMeta) {
      if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instanceHead.ENTITY_ID)]);

      const deleteSQLs = [];
      deleteSQLs.push("delete from " + entityDB.pool.escapeId(entityMeta.ENTITY_ID)
        + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));

      entityMeta.ROLES.forEach(function (role) {
        if (role.RELATIONS) {
          role.RELATIONS.forEach(function (relation){
            deleteSQLs.push("delete from " + entityDB.pool.escapeId(relation.RELATION_ID)
              + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));
          });
        }
        if (role.RELATIONSHIPS) {
          role.RELATIONSHIPS.forEach(function (relationship) {
            deleteSQLs.push("delete from " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID)
              + " where " + entityDB.pool.escapeId(role.ROLE_ID + "_INSTANCE_GUID") + " = " + entityDB.pool.escape(instanceGUID));
          })
        }
      });

      deleteSQLs.push("delete from ENTITY_INSTANCES where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID));

      if (noCommit) return callback(null, deleteSQLs);

      entityDB.doUpdatesParallel(deleteSQLs, function (err) {
        if (err) {
          callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
        } else {
          callback(null);
        }
      });
    });
  })
}

/**
 * Physically delete an entity instance from DB through a business ID
 *
 * @param idAttr Attributes in a relation that can uniquely identify an entity instance,
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'};
 * @param callback (errs)
 * errs: null if successful, or error messages.
 */
function hardDeleteByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err); // err should already be a message array
    hardDeleteByGUID(instanceGUID,callback);
  })
}

/**
 * Get an entity instance through its business ID
 *
 * @param idAttr Attributes in a relation that can uniquely identify an entity instance,
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'};
 * @param callback (errs, instance)
 * errs: null if successful, or error messages;
 * instance: an entity instance JSON, same as the example of getInstanceByGUID.
 */
function getInstanceByID(idAttr, callback) {
  _getGUIDFromBusinessID(idAttr, function (errs, instanceGUID) {
    if(errs) callback(errs);
    else getInstanceByGUID(instanceGUID, callback);
  })
}
/**
 * Get an entity instance through instanceGUID
 *
 * @param instanceGUID instance GUID
 * @param callback (errs,instance)
 * errs: null if successful, or error messages
 * instance: entity instance in JSON, or null
 *
 * @example
 * The following JSON is the returned entity instance:
 * {  ENTITY_ID: 'person', INSTANCE_GUID: '9718C0E8783C1F86EC212C8436A958C5',
      person: {HEIGHT: 170, GENDER: 'male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E'},
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
         {RELATIONSHIP_ID: 'rs_user_role', SELF_ROLE_ID: 'system_user',
            values:[{RELATIONSHIP_INSTANCE_GUID: '5F50DE92743683E1ED7F964E5B9F6167',
                     VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00
                     PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' } ]}]
           }]
    }
 */
function getInstanceByGUID(instanceGUID, callback) {

  _getEntityInstanceHead(instanceGUID, function (errs, instanceHead) {
    if(errs)return callback(errs); // Already message array
    let instance = {INSTANCE_GUID: instanceGUID};
    instance.ENTITY_ID = instanceHead.ENTITY_ID;
    entityDB.getEntityMeta(instance.ENTITY_ID, function (err, entityMeta) {
      if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);

      async.parallel([
        function (callback) {
          __getRelationValue(instance, entityMeta, callback);
        },
        function (callback) {
          __getRelationshipValue(instance, entityMeta, callback);
        }
      ],function (errs) {
        if(errs) return callback(errs); //Already message instances

        _deleteDisabledRoleStuff(instance, entityMeta);
        callback(null, instance)
      })
    });
  });

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
        if(err)return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
        if(results.length > 0){
          results.forEach(function (line) {
            delete line.INSTANCE_GUID;
          });
          instance[relation.RELATION_ID] = results;
        }
        callback(null);
      })
    },function (err) {
      if(err) callback(err); // Already message array
      else callback(null);
    })
  }

  function __getRelationshipValue(instance, entityMeta, callback) {
    _getRelationshipPieces(instance, [], entityMeta, callback)
  }
}

function _deleteDisabledRoleStuff(instance, entityMeta) {
  // Delete relations and relationships of disabled roles
  let entityRelation = instance[instance.ENTITY_ID]; // Assert not null

  entityMeta.ROLES.forEach( role => {
    if (role.CONDITIONAL_ATTR) {
      let conditionalValues = role.CONDITIONAL_VALUE.split(`,`);
      if (!conditionalValues.includes(entityRelation[0][role.CONDITIONAL_ATTR])) {
        role.RELATIONS.forEach( relation => delete instance[relation.RELATION_ID]);
        if (instance.relationships) {
          let idx;
          do {
            idx = instance.relationships.findIndex( relationship => relationship.SELF_ROLE_ID === role.ROLE_ID);
            if (idx > -1) instance.relationships.splice(idx, 1);
          } while (idx > -1);

        }
      }
    }
  });
}
/**
 * Get a piece of information from an entity instance through business ID.
 *
 * @param idAttr Attributes in a relation that can uniquely identify an entity instance,
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'};
 * @param piece What relations and relationships you want to get
 * @param callback(errs, instance)
 * errs: null if successful, or error messages;
 * instance: only contains the requested pieces of information
 *
 * @example
 * Refer getInstancePieceByGUID.
 */
function getInstancePieceByID(idAttr, piece, callback) {
  _getGUIDFromBusinessID(idAttr, function (errs, instanceGUID) {
    if(errs) callback(errs);
    else getInstancePieceByGUID(instanceGUID, piece, callback);
  })
}

/**
 * Get a piece of information from an entity instance through instance GUID.
 *
 * @param instanceGUID Instance GUID
 * @param piece What relations and relationships you want to get
 * @param callback(errs, instance)
 * errs: null if successful, or error messages;
 * instance: only contains the requested pieces of information
 *
 * @example
 * If I only want the information of relations: r_user and r_email, and relationship: rs_user_role
 * { RELATIONS: ['r_user', 'r_email'],
 *   RELATIONSHIPS: ['rs_user_role'] }
 *
 * @example
 * The returned result only contains:
 * {
 *   INSTANCE_GUID: 'xxxxxxxxxx',
 *   ENTITY_ID: 'person',
 *   r_user: [{...}],
 *   r_email: [{...}],
 *   relationships: [{RELATIONSHIP_ID: 'rs_user_role', values: [...]}]
 * }
 */
function getInstancePieceByGUID(instanceGUID, piece, callback) {
  _getEntityInstanceHead(instanceGUID, function (errs, instanceHead) {
    if(errs)return callback(errs); //Already message instance

    let instance = {INSTANCE_GUID: instanceGUID};
    instance.ENTITY_ID = instanceHead.ENTITY_ID;
    entityDB.getEntityMeta(instance.ENTITY_ID, function (err, entityMeta) {
      if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);

      async.parallel([
        function (callback) {
          __getRelationValue(instance, entityMeta, instanceHead, callback);
        },
        function (callback) {
          __getRelationshipValue(instance, entityMeta, callback);
        }
      ],function (errs) {
        if(errs) return callback(errs); //Already message array

        _deleteDisabledRoleStuff(instance, entityMeta);
        if (piece.RELATIONS && !piece.RELATIONS.includes(instance.ENTITY_ID)) delete instance[instance.ENTITY_ID];
        callback(null, instance);
      })
    });
  });

  function __getRelationValue(instance, entityMeta, instanceHead, callback) {
    let relationIDs = piece.RELATIONS? [ ...piece.RELATIONS] : [];
    relationIDs.push(entityMeta.ENTITY_ID); // Get entity main relation to filter out disabled role relations and relationships
    relationIDs = relationIDs.filter( function( relationID, index, inputArray ) {
      return inputArray.indexOf(relationID) === index;
    }); // Remove duplicates
    let errorMessages = [];
    let relations = [];
    relationIDs.forEach(function (relationID) {
      let relation = _checkEntityHasRelation(relationID, entityMeta, instanceHead);
      if (relation) relations.push(relation);
      else errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', relationID, entityMeta.ENTITY_ID));
    });

    if (errorMessages.length > 0) return callback(errorMessages);

    async.map(relations, function (relation, callback) {
      let selectSQL = "select * from " + entityDB.pool.escapeId(relation.RELATION_ID)
        + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
      entityDB.executeSQL(selectSQL, function (err, results) {
        if(err)return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
        if(results.length > 0){
          results.forEach(function (line) {
            delete line.INSTANCE_GUID;
          });
          instance[relation.RELATION_ID] = results;
        }
        callback(null);
      })
    },function (errs) {
      if(errs) callback(errs);
      else callback(null);
    })
  }

  function __getRelationshipValue(instance, entityMeta, callback) {
    let relationships = piece.RELATIONSHIPS;
    if (!relationships || relationships.length === 0) return callback(null);

    _getRelationshipPieces(instance, relationships, entityMeta, callback);
  }
}

/**
 * Relationship pieces can be an array of string or objects.
 * For example:
 * "RELATIONSHIP": ["rs_user_role", "rs_marriage"]
 * or
 * "RELATIONSHIP": [{"RELATIONSHIP_ID": "rs_user_role",
                     "PARTNER_ENTITY_PIECES": {"RELATIONS": ["r_user"], "RELATIONSHIPS": ["rs_user_role"]}
                    }]
   or
   "RELATIONSHIP": [{"RELATIONSHIP_ID": "rs_user_role",
                     "PARTNER_ENTITY_PIECES": [
                       { "ENTITY_ID": "permission"
                         "piece": {"RELATIONS": ["r_user"], "RELATIONSHIPS": ["rs_user_role"]} }
                     ]
                    }]
 * @param instance
 * @param relationships
 * @param entityMeta
 * @param callback(errs)
 * @private
 */
function _getRelationshipPieces(instance, relationships, entityMeta, callback) {
  let instanceGUID = instance['INSTANCE_GUID'];
  instance.relationships = [];

  if (relationships.length === 0) { // Empty means all
    entityMeta.ROLES.forEach(function (role) {
      role.RELATIONSHIPS.forEach(function (relationship) {
        if (!relationships.includes(relationship.RELATIONSHIP_ID)) relationships.push(relationship.RELATIONSHIP_ID);
      })
    });
  }

  async.map(relationships, function (relationship, callback) {
    let relationshipID = typeof relationship === 'string' ? relationship : relationship.RELATIONSHIP_ID;
    let involvedRoles = [];
    // An entity type can have both roles involved in a relationship.
    // For example, marriage involves roles "husband" and "wife", which are both assigned to a person entity.
    // Thus we need iterate all the roles involved to get the partner entities.
    entityMeta.ROLES.forEach(function (roleMeta) {
      if(!roleMeta.RELATIONSHIPS) return;
      roleMeta.RELATIONSHIPS.forEach(function (relationshipMeta) {
        if (relationshipMeta.RELATIONSHIP_ID === relationshipID)
          involvedRoles.push({roleMeta: roleMeta, relationshipMeta: relationshipMeta});
      })
    });
    async.map(involvedRoles, function (involvedRole, callback) {
      __getInstancesOfARelationship(relationship, involvedRole.roleMeta, involvedRole.relationshipMeta, callback);
    }, callback);

  }, callback);

  function __getInstancesOfARelationship(relationship, roleMeta, relationshipMeta, callback) {
    let relationshipID = typeof relationship === 'string' ? relationship : relationship.RELATIONSHIP_ID;
    let selectSQL = "select * from " + entityDB.pool.escapeId(relationshipID) +
      " where " + entityDB.pool.escapeId(roleMeta.ROLE_ID + "_INSTANCE_GUID") + " = " + entityDB.pool.escape(instanceGUID);

    entityDB.executeSQL(selectSQL, function (err, results) {
      if(err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);

      let relationshipType = {
          RELATIONSHIP_ID: relationshipID,
          SELF_ROLE_ID: roleMeta.ROLE_ID,
          values: []
        };

      results.forEach(function (row) {
        let relationshipTypeInstance = {
          RELATIONSHIP_INSTANCE_GUID: row['INSTANCE_GUID'],
          PARTNER_INSTANCES: []
        };

        _.each(row, function (attrValue, attrKey) { // Relationship attributes
          if (attrKey === 'INSTANCE_GUID' || attrKey.substr(-14, 14) === '_INSTANCE_GUID'
            || attrKey.substr(-10, 10) === '_ENTITY_ID') return;
          relationshipTypeInstance[attrKey] = attrValue;
        });

        relationshipMeta.INVOLVES.forEach(function (involve) { // Partner Instances
          if (involve.ROLE_ID === roleMeta.ROLE_ID) return;
          let partnerInstance = {
            ENTITY_ID: row[involve.ROLE_ID + '_ENTITY_ID'],
            ROLE_ID: involve.ROLE_ID,
            INSTANCE_GUID: row[involve.ROLE_ID + '_INSTANCE_GUID']
          };
          relationshipTypeInstance.PARTNER_INSTANCES.push(partnerInstance);
        });

        relationshipType.values.push(relationshipTypeInstance);
      });

      if (relationshipType.values.length > 0) // Only the relationship has at least one instance should be output
        instance.relationships.push(relationshipType);

      if (relationship['PARTNER_ENTITY_PIECES']) {
        if (relationshipMeta.INVOLVES.length > 2 && !Array.isArray(relationship['PARTNER_ENTITY_PIECES'])) {
          return callback([message.report('ENTITY', 'RELATIONSHIP_PARTNER_ENTITY_AMBIGUOUS', 'E', relationshipID)])
        }
        let partnerInstances = [];
        relationshipType.values.forEach(function (relationshipTypeInstance) {
          relationshipTypeInstance.PARTNER_INSTANCES.forEach(function (partnerInstance) {
            partnerInstances.push(partnerInstance);
          })
        });

        async.map(partnerInstances, function (partnerInstance, callback) {
          let piece;
          if (!Array.isArray(relationship['PARTNER_ENTITY_PIECES'])) {
            piece = relationship['PARTNER_ENTITY_PIECES'];
          } else {
            const specificPartner = relationship['PARTNER_ENTITY_PIECES'].find(function (element) {
              return element.ENTITY_ID === partnerInstance.ENTITY_ID;
            });
            if (specificPartner) { piece = specificPartner['piece'] }
          }
          if (piece) {
            getInstancePieceByGUID(partnerInstance.INSTANCE_GUID, piece, function (errs, instance) {
              if (errs) return callback(errs);
              _.each(instance, function (attrValue, attrKey) {
                if (attrKey === 'INSTANCE_GUID' || attrKey === 'ENTITY_ID') return;
                partnerInstance[attrKey] = attrValue;
              });
              callback(null);
            });
          } else {
            callback(null);
          }
        }, callback);
      } else {
        callback(null);
      }
    });
  }
}

/**
 * Change an existing instance according to the changing descriptions in the instance.
 *
 * @param instance A JSON describes which attributes in which relations or relationships that need to be changed.
 * @param callback (errs, updateSQLs)
 * errs: null if successful, or error messages;
 * updateSQLs: the generated updating SQL scripts.
 * @param noCommit If true, the transaction will not be submitted to DB.
 *
 * @example
 * The following example describes the changes made to an entity instance:
 * { ENTITY_ID: 'person', INSTANCE_GUID: '43DAE23498B6FC121D67717E79B8F3C0',
 *   person: {action: 'change', a: '1', b:'2'}
 *   relation1: [{action: 'add', a: '1', b: '2'}, {action: 'delete', a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ... ,
 *   relationships:[
 *     {RELATIONSHIP_ID: 'user_role', PARTNER_ROLE_ID: 'system_role', PARTNER_ENTITY_ID: 'system_role',
 *      values:[{INSTANCE_GUID: '8BFB602731CBCD2090D7F9347957C4C5',
 *               VALID_FROM:'2018-06-27 00:00:00', VALID_TO:'2030-12-31 00:00:00'}]
 *     }]
 * }
 */
function changeInstance(instance, callback, noCommit) {
  const errorMessages = [];
  if(!instance['ENTITY_ID']){
    errorMessages.push(message.report('ENTITY', 'ENTITY_ID_MISSING', 'E'));
    return callback(errorMessages);
  }
  if(!instance['INSTANCE_GUID']){
    errorMessages.push(message.report('ENTITY', 'INSTANCE_GUID_MISSING', 'E'));
    return callback(errorMessages);
  }

  entityDB.getEntityMeta(instance['ENTITY_ID'], function (err, entityMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);

    _getEntityInstanceHead(instance['INSTANCE_GUID'], function (errs, instanceHead) {
      if(errs)return callback(errs); //Already message array
      if(instanceHead['DEL'] === 1){
        errorMessages.push(
          message.report('ENTITY', 'INSTANCE_MARKED_DELETE', 'E', instanceHead.INSTANCE_GUID, instanceHead.ENTITY_ID));
        return callback(errorMessages);
      }

      const updateSQLs = [];
      const foreignRelations = [];
      const add01Relations = [];
      const delete11Relations = [];
      const delete1nRelations = [];
      const relationshipInstances = [];
      const valueCheckDomains = [];
      // Merge the entity relation values from the new input and the existing
      let entityRelation = instance[instance.ENTITY_ID] || {};
      entityRelation = Array.isArray(entityRelation)? entityRelation[0] : entityRelation;
      for (let key in instanceHead) {
        if (!['ENTITY_ID', 'INSTANCE_GUID', 'DEL', 'CHANGE_NO'].includes(key) && entityRelation[key] === undefined)
          entityRelation[key] = instanceHead[key];
      }

      //Parse the given instance JSON and convert it SQLs
      async.forEachOfSeries(instance, function (value, key, callback) {
        if (key === 'ENTITY_ID' || key === 'INSTANCE_GUID') {
          callback(null);
        } else if (key === 'relationships') {
          _generateRelationshipsSQL(value, entityMeta, instance['INSTANCE_GUID'], relationshipInstances, valueCheckDomains, entityRelation,
            function (results) {
              _hasErrors(results) ? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
              callback(null);
            });
        } else {
          _generateChangeRelationSQL(value, key, entityMeta, foreignRelations, entityRelation,
            add01Relations, delete11Relations, delete1nRelations, valueCheckDomains, instance, function (results) {
              _hasErrors(results)? _mergeResults(errorMessages, results) : _mergeResults(updateSQLs, results);
              callback(null);
            });
        }
      }, function ()
      {
        if(errorMessages.length > 0) return callback(errorMessages);
        //Update entity instance
        async.series([
          function (callback) {//Foreign key check
            async.map(foreignRelations, function (relation, callback) {
              _checkForeignKey(relation.relationRow, relation.association, callback);
            }, function (errs, results) {
              if(errs) return callback(errs); // Already message array
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) callback(errMsgs);//The results should already be error messages
              else callback(null);
            });
          },
          function (callback) {// Domain value check
            async.map(valueCheckDomains, function (valueCheckDomain, callback) {
              _checkDomainValue(valueCheckDomain, callback);
            }, function (err, results) {
              if(err) return callback(err); // err is an array
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) return callback(errMsgs);//The results should already be error messages
              else return callback(null);
            });
          },
          function (callback) {//Check adding [0..1] relations
            async.map(add01Relations, function(relation, callback){
              _checkAdd01Relation(relation, instance['INSTANCE_GUID'], callback)
            }, function (errs, results) {
              if(errs) return callback(errs); // Already message array
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) callback(errMsgs); //The results should already be error messages
              else callback(null);
            })
          },
          function (callback) {//Check deleting [1..1] relations
            async.map(delete11Relations, function(relation, callback){
              _checkDelete11Relation(relation, instance['INSTANCE_GUID'], callback)
            }, function (errs, results) {
              if(errs) return callback(errs); // Already message array
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) callback(errMsgs); //The results should already be error messages
              else callback(null);
            })
          },
          function (callback) {//Check deleting [1..n] relations
            async.map(delete1nRelations, function(relation, callback){
              _checkDelete1nRelation(relation, instance['INSTANCE_GUID'], callback)
            }, function (errs, results) {
              if(errs) return callback(errs); // Already message array
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) callback(errMsgs); //The results should already be error messages
              else callback(null);
            })
          },
          function (callback) {//Relationship involved instances check
            async.map(relationshipInstances, function (relationshipInstance, callback) {
              _checkEntityExist(relationshipInstance, callback)
            }, function (errs, results) {
              if(errs) return callback(errs);
              const errMsgs = _condenseErrorMessages(results);
              if(errMsgs.length > 0) callback(errMsgs); //The results should already be error messages
              else callback(null);
            });
          },
          function (callback) {//Relationship update/add check
            async.map(relationshipInstances, function (relationshipInstance, callback){
              _checkRelationshipValueValidity(instance['INSTANCE_GUID'], relationshipInstance, callback)
            }, function (errs) {
              if(errs) callback(errs); // Already message array
              else callback(null);
            })
          },
          function (callback) {//Run all insert SQLs parallel
            if (noCommit) {
              callback(null)
            } else {
              entityDB.doUpdatesParallel(updateSQLs, function (err) {
                if (err) {
                  callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
                } else {
                  callback(null);
                }
              });
            }
          }
        ],function (errs) {
          if(errs) callback(errs); // Already message array
          else callback(null, updateSQLs);
        }); // End of async.series
      }); // End of parsing entity instance
    }) // Get instance head
  }); // Get entity meta
}

/**
 * Overwrite an Instance in DB.
 * Note: relationships cannot be overwritten.
 *
 * @param instance The entity instance to replace the existing one in DB.
 * @param callback (errs, updateSQLs)
 * errs: null if successful, or error messages;
 * updateSQLs: the generated updating SQL scripts.
 * @param noCommit If true, the transaction will not be submitted to DB.
 */
function overwriteInstance(instance, callback, noCommit) {
  const errorMessages = [];
  if (!instance['ENTITY_ID']) {
    errorMessages.push(message.report('ENTITY', 'ENTITY_ID_MISSING', 'E'));
    return callback(errorMessages);
  }
  const instanceGUID = instance['INSTANCE_GUID'];
  if (!instanceGUID) {
    errorMessages.push(message.report('ENTITY', 'INSTANCE_GUID_MISSING', 'E'));
    return callback(errorMessages);
  }
  if(!instance[instance['ENTITY_ID']]) {
    errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E'));
    return callback(errorMessages);
  }

  entityDB.getEntityMeta(instance['ENTITY_ID'], function (err, entityMeta) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (!entityMeta) return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);

    entityMeta.ROLES.forEach(function (role) {
      if(_checkEntityRoleCondition(role, instance[entityMeta.ENTITY_ID])) {
        role.RELATIONS.forEach(function (relation) {
          if ((relation.CARDINALITY === '[1..1]' || relation.CARDINALITY === '[1..n]') && !instance[relation.RELATION_ID])
            errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', relation.RELATION_ID, entityMeta.ENTITY_ID))
        })
      }
    });
    if (errorMessages.length > 0) return callback(errorMessages);

    getInstanceByGUID(instanceGUID, function (errs, originalInstance) {
      if (errs) return callback(errs);

      //Parse the target instance to see which relations are added, and which are updated
      async.forEachOfSeries(instance, function (value, key, callback) {
        if ( key === 'ENTITY_ID' || key === 'INSTANCE_GUID') return callback(null);
        if ( key === 'relationships' ) return callback([message.report('ENTITY', 'OVERWRITE_RELATIONSHIPS_NOT_ALLOWED', 'E')]);

        if (!Array.isArray(value)) instance[key] = [value];
        if (originalInstance[key]) {
          __compareAndSetAction(key, instance[key], originalInstance[key], entityMeta, callback);
        } else {
          if (_checkEntityHasRelation(key, entityMeta, instance[entityMeta.ENTITY_ID])) {
            instance[key].forEach( singleRelation => singleRelation['action'] = 'add' );
            callback(null)
          } else {
            callback([message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID)]);
          }
        }
      }, function (errs) {
        if (errs) return callback(errs);
        //Parse the original instance to see which relations are deleted.
        async.forEachOfSeries(originalInstance, function (value, key, callback) {
          if ( key === 'ENTITY_ID' || key === 'INSTANCE_GUID' || key === 'relationships' ) return callback(null);
          if (instance[key]) return callback(null);

          instance[key] = [];
          entityDB.getRelationMeta(key, function (err, relationMeta) {
            if (err) return callback([err]);
            if (!relationMeta) return callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', key)]);
            value.forEach(singleValue => {
              let deleteEntry = { action: 'delete'};
              _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1}).forEach(function (primaryKey) {
                deleteEntry[primaryKey.ATTR_NAME] = singleValue[primaryKey.ATTR_NAME];
              });
              instance[key].push(deleteEntry);
            });
            callback(null);
          });
        }, function (errs) {
          if (errs) return callback(errs);
          // Finally, change the instance
          changeInstance(instance, callback, noCommit);
        }); // Second async.forEachOfSeries
      }); // First async.forEachOfSeries
    }); // getInstanceByGUID
  }); // getEntityMeta

  function __compareAndSetAction(relationID, target, original, entityMeta, callback) {
    // in case entity relation, then the primary key is instance_guid.
    if (relationID === entityMeta.ENTITY_ID) {
      target[0]['action'] = 'update';
      return callback(null);
    }

    entityDB.getRelationMeta(relationID, function (err, relationMeta) {
      if (err) return callback([err]);
      if (!relationMeta) return callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', key)]);

      const primaryKeys = _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1});
      target.forEach( singleValue => {
        let primaryKeyValues = {};
        primaryKeys.forEach(function(attribute){
          if(!singleValue[attribute.ATTR_NAME])
            errorMessages.push(message.report('ENTITY','PRIMARY_KEY_MISSING','E', attribute.ATTR_NAME));
          else
            primaryKeyValues[attribute.ATTR_NAME] = singleValue[attribute.ATTR_NAME];
        });

        let originalEntry = _.findWhere(original, primaryKeyValues);
        if(originalEntry) {
          singleValue['action'] = 'update';
        } else {
          singleValue['action'] = 'add';
        }
      });
      if (errorMessages.length > 0) return callback(errorMessages);

      original.forEach( originalValue => {
        let primaryKeyValues = {};
        primaryKeys.forEach(function (attribute) {
          primaryKeyValues[attribute.ATTR_NAME] = originalValue[attribute.ATTR_NAME];
        });
        if(!_.findWhere(target, primaryKeyValues)) {
          primaryKeyValues['action'] = 'delete';
          target.push(primaryKeyValues);
        }
      });
      callback(null);
    }); // getRelationMeta
  }
}

function _hasErrors(results) {
  return results.find(function (element) {
    return element['msgCat'];
  })
}

function _mergeResults(to, from) {
  from.forEach(function (element) {
    to.push(element);
  })
}

/**
 * Get the instance head information from table ENTITY_INSTANCES and the entity relation.
 * Always used for existence check.
 * @param instanceGUID
 * @param callback
 * @private
 */
function _getEntityInstanceHead(instanceGUID, callback) {
  let selectSQL = "select * from ENTITY_INSTANCES where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if(err)return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if(results.length === 0)
      return callback([message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', instanceGUID)]);

    let entityInstance = results[0];
    selectSQL = "select * from " + entityDB.pool.escapeId(entityInstance.ENTITY_ID) +
                " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
    entityDB.executeSQL(selectSQL, function (err, results2) {
      if(err)return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      if(results2.length === 0)
        return callback([message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', instanceGUID)]);

      for (let key in results2[0]) {
        entityInstance[key] = results2[0][key];
      }

      callback(null, entityInstance);
    });

  })
}

/**
 * @param relationships
 * [ {RELATIONSHIP_ID: 'user_role',
      SELF_ROLE_ID: 'system_user',
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
 * @param valueCheckDomains
 * @param entityRelation
 * @param callback
 * @returns {*}
 * @private
 */
function _generateRelationshipsSQL(relationships, entityMeta, instanceGUID, relationshipInstances,
                                   valueCheckDomains, entityRelation, callback) {
  const errorMessages = [];
  const SQLs = [];
  async.map(relationships, function (relationship, callback) {
    if (!relationship || !relationship['RELATIONSHIP_ID']) { return callback(null); }
    const roleMeta = _checkEntityInvolvesRelationship(relationship['RELATIONSHIP_ID'], entityMeta, entityRelation);
    if(!roleMeta)
      return callback([message.report('ENTITY', 'RELATIONSHIP_NOT_VALID', 'E', relationship['RELATIONSHIP_ID'], entityMeta.ENTITY_ID)]);

    entityDB.getRelationMeta(relationship.RELATIONSHIP_ID, function (err, relationMeta) {
      if (err || !relationMeta)
        return callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', relationship.RELATIONSHIP_ID)]);
      const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
      const relationshipMeta = roleMeta.RELATIONSHIPS.find(function (element) {
        return element.RELATIONSHIP_ID === relationship['RELATIONSHIP_ID'];
      });

      relationship['values'].forEach( value => {
        switch (value.action) {
          case 'update':
            if(!value.RELATIONSHIP_INSTANCE_GUID)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
            break;
          case 'delete':
            if(!value.RELATIONSHIP_INSTANCE_GUID)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
            SQLs.push("delete from " + entityDB.pool.escapeId(relationship['RELATIONSHIP_ID']) +
              " where INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
            break;
          case 'expire':
            if(!value.RELATIONSHIP_INSTANCE_GUID)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
            if(relationshipMeta.VALID_PERIOD === 0)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_IS_NOT_TIME_DEPENDENT', 'E'));
            SQLs.push("update " + entityDB.pool.escapeId(relationship['RELATIONSHIP_ID']) +
              " set VALID_TO = " + entityDB.pool.escape(currentTime) +
              " where INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
            break;
          case 'extend':
            if(!value.RELATIONSHIP_INSTANCE_GUID)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_INSTANCE_GUID_MISSING', 'E'));
            if(relationshipMeta.VALID_PERIOD === 0)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_IS_NOT_TIME_DEPENDENT', 'E'));
            if(!value['VALID_TO'])
              value['VALID_TO'] = timeUtil.getFutureDateTime(relationshipMeta.VALID_PERIOD, "yyyy-MM-dd HH:mm:ss");
            if(value['VALID_TO'] <= currentTime)
              return errorMessages.push(message.report('ENTITY', 'RELATIONSHIP_EXTEND_BEFORE_CURRENT', 'E'));
            SQLs.push("update " + entityDB.pool.escapeId(relationship['RELATIONSHIP_ID']) +
              " set VALID_TO = " + entityDB.pool.escape(value['VALID_TO']) +
              " where INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID));
            break;
          case 'add':
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
            if (relationshipMeta.VALID_PERIOD > 0){
              if(!value['VALID_FROM'] || value['VALID_FROM'] === 'now' ||
                Math.abs(timeUtil.StringToDate(value['VALID_FROM']).DateDiff('s', currentTime)) <= 60) //Tolerance 60 seconds
                value['VALID_FROM'] = currentTime;
              if(value['VALID_FROM'] < currentTime)
                return errorMessages.push(message.report('ENTITY','NEW_RELATIONSHIP_ADD_TO_BEFORE', 'E'));
              if(!value['VALID_TO'])
                value['VALID_TO'] = timeUtil.getFutureDateTime(relationshipMeta.VALID_PERIOD, "yyyy-MM-dd HH:mm:ss", value['VALID_FROM']);
              if(value['VALID_TO'] < value['VALID_FROM'])
                return errorMessages.push(
                  message.report('ENTITY','VALID_TO_BEFORE_VALID_FROM', 'E', value['VALID_TO'], value['VALID_FROM']));
            }
            break;
          default:
            return errorMessages.push(
              message.report('ENTITY', 'RELATIONSHIP_ACTION_INVALID', 'E', relationship['RELATIONSHIP_ID']));
        }
        if(value.action === 'update'){ // Update relationship attributes
          let updateSQL;
          _.each(value, function (attrValue, attrKey) {
            if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' || attrKey === 'PARTNER_INSTANCES') return;

            const attributeMeta = relationMeta.ATTRIBUTES.find( attribute => attribute.ATTR_NAME === attrKey );
            if(attributeMeta){
              const convertedValue =
                _processDomainField(attrKey, attrValue, attributeMeta, valueCheckDomains, errorMessages, relationMeta.RELATION_ID);
              if (updateSQL) {
                updateSQL = updateSQL + " , " + entityDB.pool.escapeId(attrKey) + " = " + entityDB.pool.escape(convertedValue);
              }else{
                updateSQL = "update " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID) + " set "
                  + entityDB.pool.escapeId(attrKey) + " = " + entityDB.pool.escape(convertedValue);
              }
            } else {
              errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', attrKey, relationMeta.RELATION_ID));
            }
          });
          if (updateSQL) {
            updateSQL = updateSQL + " where INSTANCE_GUID = " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID);
            SQLs.push(updateSQL);
          }
        }
        else if (value.action === 'add'){
          let insertFields = " ( `INSTANCE_GUID`" ;
          let insertValues = " ( " + entityDB.pool.escape(value.RELATIONSHIP_INSTANCE_GUID);

          // Relationship entity instances
          insertFields += ", " + entityDB.pool.escapeId(roleMeta.ROLE_ID + "_INSTANCE_GUID");
          insertValues += ", " + entityDB.pool.escape(instanceGUID);
          insertFields += ", " + entityDB.pool.escapeId(roleMeta.ROLE_ID + "_ENTITY_ID");
          insertValues += ", " + entityDB.pool.escape(entityMeta.ENTITY_ID);
          value['PARTNER_INSTANCES'].forEach(function (partnerInstance) {
            insertFields += ", " + entityDB.pool.escapeId(partnerInstance.ROLE_ID + "_INSTANCE_GUID");
            insertValues += ", " + entityDB.pool.escape(partnerInstance.INSTANCE_GUID);
            insertFields += ", " + entityDB.pool.escapeId(partnerInstance.ROLE_ID + "_ENTITY_ID");
            insertValues += ", " + entityDB.pool.escape(partnerInstance.ENTITY_ID);
          });

          _.each(value, function (attrValue, attrKey) { // Relationship attributes
            if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' ||
              attrKey === 'PARTNER_INSTANCES') return;

            const attributeMeta = relationMeta.ATTRIBUTES.find( attribute => attribute.ATTR_NAME === attrKey );
            if(attributeMeta){
              const convertedValue =
                _processDomainField(attrKey, attrValue, attributeMeta, valueCheckDomains, errorMessages, relationMeta.RELATION_ID);
              insertFields = insertFields + ", " + entityDB.pool.escapeId(attrKey);
              insertValues = insertValues + ", " + entityDB.pool.escape(convertedValue);
            } else {
              errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', attrKey, relationMeta.RELATION_ID));
            }
          });

          insertFields = insertFields + " )";
          insertValues = insertValues + " )";
          SQLs.push("insert into " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID) + insertFields + " values " + insertValues);
        }

        // Overlap checks should be done when they are updated in DB
        if(relationshipInstances) {
          let relationshipInstance =
            { RELATIONSHIP_ID: relationship['RELATIONSHIP_ID'],
              RELATIONSHIP_INSTANCE_GUID: value['RELATIONSHIP_INSTANCE_GUID'],
              IS_TIME_DEPENDENT: relationshipMeta.VALID_PERIOD > 0, // For time-dependency relationship (VALID_PERIOD is set and larger than 0)
              SINGLETON: relationshipMeta.SINGLETON,
              VALID_FROM: value['VALID_FROM'],
              VALID_TO: value['VALID_TO'],
              action: value.action
            };

          if(value['PARTNER_INSTANCES']){ //Add operation
            value['PARTNER_INSTANCES'].forEach(function (partnerInstance) {
              let relationshipInstanceClone = _.clone(relationshipInstance);
              relationshipInstanceClone.SELF_ROLE_ID = roleMeta.ROLE_ID;
              relationshipInstanceClone.PARTNER_ENTITY_ID = partnerInstance.ENTITY_ID;
              relationshipInstanceClone.PARTNER_ROLE_ID = partnerInstance.ROLE_ID;
              relationshipInstanceClone.PARTNER_INSTANCE_GUID = partnerInstance.INSTANCE_GUID;
              relationshipInstanceClone.noExistingCheck = partnerInstance.NO_EXISTING_CHECK;
              let involveMeta = relationshipMeta.INVOLVES.find(
                function (involve) {return involve.ROLE_ID === partnerInstance.ROLE_ID;});
              if (involveMeta) relationshipInstanceClone.PARTNER_ROLE_CARDINALITY = involveMeta.CARDINALITY;
              involveMeta = relationshipMeta.INVOLVES.find(
                function (involve) {return involve.ROLE_ID === roleMeta.ROLE_ID;});
              if (involveMeta) relationshipInstanceClone.SELF_ROLE_CARDINALITY = involveMeta.CARDINALITY;
              relationshipInstances.push(relationshipInstanceClone);
            });
          }else{
            relationshipInstances.push(relationshipInstance); //Other operations
          }
        }
      }); // Loop values end
      if (errorMessages.length > 0) return callback(errorMessages);

      // Check Cardinality:
      // [1..1] means the entity instance can only be involved in one such kind of relationship instance.
      // [1..n] means the entity instance can be involved in multiple such kind of relationship instances.
      const groupBySelfCardinality = _.groupBy(relationshipInstances, 'SELF_ROLE_CARDINALITY');
      _.each(groupBySelfCardinality, function (value, key) {
        if(key === '[1..1]') __checkOverlap(value);
      });
      if (errorMessages.length > 0) return callback(errorMessages);

      const groupByPartnerCardinality = _.groupBy(relationshipInstances, 'PARTNER_ROLE_CARDINALITY');
      _.each(groupByPartnerCardinality, function (value, key) {
        if ( key === '[1..1]' || (key === '[1..n]' && relationshipMeta.SINGLETON))  {
          // '[1..1]' means the partner instance can only exist once in this kind of relationship
          // Singleton relationship means a pair can only exist once in this kind of relationship
          // Since in this context, the self instance is the same, so the 2 cases share the same checking logic
          const groupByPartnerInstanceGUID = _.groupBy(value, 'PARTNER_INSTANCE_GUID');
          _.each(groupByPartnerInstanceGUID, function (groupedValue) {
            __checkOverlap(groupedValue);});
        }
      });
      if (errorMessages.length > 0) callback(errorMessages);
      else callback(null);
    });
  }, function (errs) {
    if (errs) callback(errs);
    else callback(SQLs);
  });

  function __checkOverlap(values) {
    if (!values[0].IS_TIME_DEPENDENT && values.length > 1) {
      return errorMessages.push(
        message.report('ENTITY','RELATIONSHIP_INSTANCE_OVERLAP','E', values[0].RELATIONSHIP_ID));
    }
    values.forEach(function (value, index) {
      for (let i = index+1; i<values.length; i++) {
        if (value.VALID_FROM < values[i].VALID_TO && value.VALID_TO > values[i].VALID_FROM)
          return errorMessages.push(
            message.report('ENTITY','RELATIONSHIP_INSTANCE_OVERLAP','E', value.RELATIONSHIP_ID));
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
 * @param valueCheckDomains
 * @param instance
 * @param instanceGUID
 * @param callback
 * @returns {*}
 * @private
 */
function _generateCreateRelationSQL(value, key, entityMeta, foreignRelations, valueCheckDomains, instance, instanceGUID, callback){
  const errorMessages = [];
  let results;
  const entityRelation = Array.isArray(instance[instance.ENTITY_ID])? instance[instance.ENTITY_ID][0] : instance[instance.ENTITY_ID];
  const roleRelationMeta = _checkEntityHasRelation(key, entityMeta, entityRelation);
  if(!roleRelationMeta){
    errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
    return callback(errorMessages);
  }

  entityDB.getRelationMeta(key, function (err, relationMeta) {
    if (err) return callback([err]);
    if (!relationMeta) return callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', key)]);
    if (Array.isArray(value)){
      if((roleRelationMeta.CARDINALITY === '[0..1]' || roleRelationMeta.CARDINALITY === '[1..1]') && value.length > 1) {
        errorMessages.push(message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', roleRelationMeta.RELATION_ID));
        return callback(errorMessages);
      }

      results = [];
      value.forEach(function (element) {
        _mergeResults(results, __processSingleRelation(element, valueCheckDomains, relationMeta));
      });
    }else{ //Single line
      results = __processSingleRelation(value, valueCheckDomains, relationMeta);
    }
    if(errorMessages.length > 0) callback(errorMessages);
    else callback(results);
  });

  function __processSingleRelation(value, valueCheckDomains, relationMeta) {
    if (!value || Object.keys(value).length === 0) return []; // Ignore null or empty relation value

    if(value['action'] === 'update' || value['action'] === 'delete'){
      errorMessages.push(message.report('ENTITY', 'UPDATE_DELETE_NOT_ALLOWED', 'E'));
      return [];
    }

    relationMeta.ASSOCIATIONS.forEach( association => {
      if (!association.FOREIGN_KEY_CHECK) return;
      const rightRelationValue = instance[association.RIGHT_RELATION_ID];
      if (rightRelationValue) {
        if (Array.isArray(rightRelationValue)) {
          if (rightRelationValue.findIndex( rightRelation => {
            return association.FIELDS_MAPPING.findIndex(
              fieldMap => value[fieldMap.LEFT_FIELD] !== rightRelation[fieldMap.RIGHT_FIELD]) === -1;
          }) > -1) { return; }
        } else {
          if (association.FIELDS_MAPPING.findIndex(
            fieldMap => value[fieldMap.LEFT_FIELD] !== rightRelationValue[fieldMap.RIGHT_FIELD]) === -1) {
            return;
          }
        }
      }
      foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: value, association: association});
    });

    return _generateInsertSingleRelationSQL(relationMeta, value, valueCheckDomains, instanceGUID);
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
 * @param entityRelation: entityRelation values
 * @param add01Relations: record relations that have cardinality [0..1] and [1..1], and are required for adding
 * @param delete11Relations: record relations that have cardinality [1..1],
 * @param delete1nRelations: record relations that have cardinality [1..n], and are required for deletion
 * @param valueCheckDomains: record fields whose domain need value checks
 * @param instance
 * @param callback(errs)
 * @returns {*}
 * @private
 */
function _generateChangeRelationSQL(value, key, entityMeta, foreignRelations, entityRelation,
                                    add01Relations, delete11Relations, delete1nRelations, valueCheckDomains, instance, callback){
  const errorMessages = [];
  let results;

  const instanceGUID = instance['INSTANCE_GUID'];
  const roleRelationMeta = _checkEntityHasRelation(key, entityMeta, entityRelation);
  if(!roleRelationMeta) {
    errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
    return callback(errorMessages);
  }

  entityDB.getRelationMeta(key, function (err, relationMeta) {
    if (err) return callback([err]);
    if (!relationMeta) return callback([message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', key)]);

    if (Array.isArray(value)){
      results = [];
      value.forEach( element => _mergeResults(results, __processSingleRelation(element, valueCheckDomains, relationMeta)));
    } else { //Single line
      results = __processSingleRelation(value, valueCheckDomains, relationMeta);
    }
    if(errorMessages.length > 0) callback(errorMessages);
    else callback(results);
  });


  function __processSingleRelation(value, valueCheckDomains, relationMeta) {
    if (!value || Object.keys(value).length === 0) return []; // Ignore null or empty relation value
    let results;
    switch (value['action']){
      case 'add':
        __validateForAdd(relationMeta, value);
        results = _generateInsertSingleRelationSQL(relationMeta, value, valueCheckDomains, instanceGUID);
        break;
      case 'update':
        results = _generateUpdateSingleRelationSQL(relationMeta, value, entityMeta, instance, instanceGUID, foreignRelations, valueCheckDomains);
        break;
      case 'delete':
        __validateForDeletion(relationMeta, value);
        results = _generateDeleteSingleRelationSQL(relationMeta, value);
        break;
      default:
        __validateForAdd(relationMeta, value);
        results = _generateInsertSingleRelationSQL(relationMeta, value, valueCheckDomains, instanceGUID);
    }
    return results;
  }

  function __validateForAdd(relationMeta, value) {
    // For cardinality [1..1], there must be an entry in DB. But it can be first deleted then added.
    // For cardinality [0..1], it would be an existing entry in DB.
    // We need to record the relation ID into add01Relations to check with DB before saving.
    if(roleRelationMeta.CARDINALITY === '[0..1]' || roleRelationMeta.CARDINALITY === '[1..1]'){
      if(add01Relations.includes(roleRelationMeta.RELATION_ID))
        errorMessages.push(message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', roleRelationMeta.RELATION_ID));
      else {
        const currentRelationValues = instance[relationMeta.RELATION_ID];
        if ( Array.isArray(currentRelationValues)
             && currentRelationValues.length === 2
             && currentRelationValues.findIndex( value => value.action === 'delete' ) > -1) {
          // If the corresponding relation has a deletion operation, then we don't record the adding.
          // The adding and deletion combination will be checked in __validateForDeletion
        } else {
          add01Relations.push(roleRelationMeta.RELATION_ID);
        }
      }
    }
    // For cardinality [1..n], we need to make sure at least 1 entry is recorded in DB.
    // Each add causes the deletion count minus 1.
    // At the end, check the DB for the existing counts with the total deletion counts.
    // If existing counts is less than or equal to the total deletion counts, then reports the error.
    if(roleRelationMeta.CARDINALITY === '[1..n]'){
      let deleteRelation = delete1nRelations.find(function (element) {
        return element.RELATION_ID === roleRelationMeta.RELATION_ID;
      });
      if(deleteRelation)
        deleteRelation.COUNT = deleteRelation.COUNT - 1;
      else
        delete1nRelations.push({RELATION_ID:roleRelationMeta.RELATION_ID, COUNT: -1});
    }
    // Check the foreign key dependency.
    // The new added value must pass the foreign key dependency check.
    relationMeta.ASSOCIATIONS.forEach(association => {
      if (!association.FOREIGN_KEY_CHECK) return;
      // First run an instance level check.
      // If the instance level check is passed, the DB level check will be bypassed.
      const rightRelationValue = instance[association.RIGHT_RELATION_ID];
      if (rightRelationValue) {
        if (Array.isArray(rightRelationValue)) {
          if (rightRelationValue.findIndex( rightRelation => {
            return association.FIELDS_MAPPING.findIndex(
              fieldMap => value[fieldMap.LEFT_FIELD] !== rightRelation[fieldMap.RIGHT_FIELD]) === -1;
          }) > -1) { return; }
        } else {
          if (association.FIELDS_MAPPING.findIndex(
            fieldMap => value[fieldMap.LEFT_FIELD] !== rightRelationValue[fieldMap.RIGHT_FIELD]) === -1) {
            return;
          }
        }
      }
      // Otherwise, record down to run a DB level check afterwards.
      foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: value, association: association});
    });
  }
  function __validateForDeletion(relationMeta, value) {
    // For cardinality [0..1] and [1..1], we must make sure no more than 1 entry is stored in DB
    // If there is a combined add action along with the deletion action,
    // then we need record the deletion action to check with DB whether the to-be-deleted entry is exactly the one in DB.
    if(roleRelationMeta.CARDINALITY === '[1..1]' || roleRelationMeta.CARDINALITY === '[0..1]') {
      const currentRelationValues = instance[relationMeta.RELATION_ID];
      if (Array.isArray(currentRelationValues) &&
        currentRelationValues.findIndex( value => !value.action || value.action === 'add' ) > -1 ) {
        let deleteRelation = delete11Relations.find(function (element) {
          return element.relationID === roleRelationMeta.RELATION_ID;
        });
        if(deleteRelation)
          errorMessages.push(message.report(
            'ENTITY', 'MULTIPLE_DELETION_ON_11CARDINALITY', 'E', roleRelationMeta.RELATION_ID));
        else
          delete11Relations.push({relationID: relationMeta.RELATION_ID, primaryKeyValue: value});
      } else { // Deletion without any adding, report error directly
        if (roleRelationMeta.CARDINALITY === '[1..1]')
          errorMessages.push(message.report(
          'ENTITY', 'MANDATORY_RELATION_MISSING', 'E', roleRelationMeta.RELATION_ID, entityMeta.ENTITY_ID));
      }
    }
    // For cardinality [1..n], count each deletion on the relation ID.
    // Later, it will check the total deletion counts with the counts in DB.
    // If the DB counts is less or equal then the total deletion, then reports error.
    if(roleRelationMeta.CARDINALITY === '[1..n]'){
      let deleteRelation = delete1nRelations.find(function (element) {
        return element.RELATION_ID === roleRelationMeta.RELATION_ID;
      });
      if(deleteRelation)
        deleteRelation.COUNT = deleteRelation.COUNT + 1;
      else
        delete1nRelations.push({RELATION_ID:roleRelationMeta.RELATION_ID, COUNT: 1});
    }
    //TODO: check foreign key dependency. If other relations have association on this one, then deletion is disallowed.
  }
}

/**
 * Generate insert SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @param valueCheckDomains
 * @param instanceGUID
 * @returns {Array}
 * @private
 */
function _generateInsertSingleRelationSQL(relationMeta, relationRow, valueCheckDomains, instanceGUID) {
  let errorMessages = [];
  let insertSQLs = [];
  let insertColumns = "( `INSTANCE_GUID`";
  let insertValues = "( " + entityDB.pool.escape(instanceGUID);
  _.each(relationRow, function (value, key) {
    if( key === 'action') {return;}
    let attributeMeta = relationMeta.ATTRIBUTES.find( attribute => attribute.ATTR_NAME === key);

    if(attributeMeta && !attributeMeta.AUTO_INCREMENT){
      const convertedValue =
        _processDomainField(key, value, attributeMeta, valueCheckDomains, errorMessages, relationMeta.RELATION_ID);
      insertColumns += ", " + entityDB.pool.escapeId(key);
      insertValues += ", " + entityDB.pool.escape(convertedValue);
    } else if (!attributeMeta){
      errorMessages.push(message.report('ENTITY','RELATION_ATTRIBUTE_NOT_EXIST', 'E', key, relationMeta.RELATION_ID));
    }
  });
  if (errorMessages.length > 0) return errorMessages;

  insertColumns += " ) ";
  insertValues +=  " ) ";
  insertSQLs.push("insert into " + entityDB.pool.escapeId(relationMeta.RELATION_ID) + insertColumns + " values " + insertValues);
  return insertSQLs;
}

function _processDomainField(key, value, attributeMeta, valueCheckDomains, errorMessages, relationId) {
  if (attributeMeta.DOMAIN_TYPE >= 2) { // Value Relation 2, Value Array 3, Value Interval 4
    if (attributeMeta.DOMAIN_TYPE === 2 &&
      ( attributeMeta.PRIMARY_KEY || attributeMeta.DOMAIN_RELATION_ID === relationId) ) {
      return value;
    }
    valueCheckDomains.push({
      RELATION_ID: attributeMeta.RELATION_ID,
      DOMAIN_ID: attributeMeta.DOMAIN_ID,
      DOMAIN_TYPE: attributeMeta.DOMAIN_TYPE,
      DOMAIN_ENTITY_ID: attributeMeta.DOMAIN_ENTITY_ID,
      DOMAIN_RELATION_ID: attributeMeta.DOMAIN_RELATION_ID,
      KEY: key,
      VALUE: value
    });
  } else { // General 0, Regular Expr: 1
    if (attributeMeta.UNSIGNED) {
      if (!/^\d+([^.,])?$/.test(value)) {
        errorMessages.push(message.report('ENTITY','NOT_UNSIGNED_INTEGER', 'E',
          value, key, relationId));
      }
    } else if (attributeMeta.CAPITAL_ONLY) {
      return value.toUpperCase();
    } else if (attributeMeta.REG_EXPR) {
      const regExpObj = new RegExp(attributeMeta.REG_EXPR);
      if (!regExpObj.test(value)) {
        errorMessages.push(message.report('ENTITY','NOT_MATCH_REGEXP', 'E',
          value, key, relationId, attributeMeta.REG_EXPR));
      }
    }
  }
  return value;
}
/**
 * Generate update SQLs for a relation
 * @param relationMeta
 * @param relationRow
 * @param entityMeta
 * @param instance
 * @param instanceGUID
 * @param foreignRelations
 * @param valueCheckDomains
 * @returns {Array}
 * @private
 */
function _generateUpdateSingleRelationSQL(relationMeta, relationRow, entityMeta, instance,
                                          instanceGUID, foreignRelations, valueCheckDomains) {
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

    let attributeMeta = relationMeta.ATTRIBUTES.find( attribute => attribute.ATTR_NAME === key );

    if(attributeMeta){
      const convertedValue =
        _processDomainField(key, value, attributeMeta, valueCheckDomains, errorMessages, relationMeta.RELATION_ID);
      if(attributeMeta['PRIMARY_KEY'] === 1){
        whereClause?whereClause = whereClause + " and " + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(convertedValue):
          whereClause = " where " + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(convertedValue);
      } else {
        updateColumns?updateColumns = updateColumns + "," + entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(convertedValue):
          updateColumns = entityDB.pool.escapeId(key) + "=" + entityDB.pool.escape(convertedValue);
        relationMeta.ASSOCIATIONS.forEach( association => {
          if (!association.FOREIGN_KEY_CHECK) {return;}
          const fieldMap = association.FIELDS_MAPPING.find( fieldMap => key === fieldMap.LEFT_FIELD );
          if (!fieldMap) {return;}
          const rightRelationValue = instance[association.RIGHT_RELATION_ID];
          if (rightRelationValue) {
            if (Array.isArray(rightRelationValue)) {
              if ( rightRelationValue.findIndex(rightRelation => rightRelation[fieldMap.RIGHT_FIELD] === value) > -1 ) {
                return;
              }
            } else {
              if ( rightRelationValue[fieldMap.RIGHT_FIELD] === value ){
                return;
              }
            }
          }
          foreignRelations.push({relationID: relationMeta.RELATION_ID, relationRow: relationRow, association: association});
        });
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

function _checkEntityInvolvesRelationship(relationshipID, entityMeta, entityRelation) {
  return entityMeta.ROLES.find(function (role) {
    if (!role.RELATIONSHIPS) return false;

    if(!_checkEntityRoleCondition(role, entityRelation)) return false;

    let relationship = role.RELATIONSHIPS.find(function (element) {
      return element.RELATIONSHIP_ID === relationshipID;
    });
    if(relationship) return true;
  });
}

function _checkEntityHasRelation(relationID, entityMeta, entityRelation) {
  if (relationID === entityMeta.ENTITY_ID) {
    return {RELATION_ID: relationID, CARDINALITY: '[1..1]'};
  }
  const role = entityMeta.ROLES.find( role => {
    if(_checkEntityRoleCondition(role, entityRelation)){
      return role.RELATIONS.find( relation => relation.RELATION_ID === relationID );
    } else {
      return null;
    }
  });
  return role ? role.RELATIONS.find( relation => relation.RELATION_ID === relationID ) : false;
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
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (rows.length === 0)
      callback(null, message.report('ENTITY','FOREIGN_KEY_CHECK_ERROR','E',foreignKeyValue,association.RIGHT_RELATION_ID));
    else callback(null, null);
  })
}

/**
 * Check whether the value is in the data domain
 * @param valueCheckDomain
 * {
      RELATION_ID: attributeMeta.RELATION_ID,
      DOMAIN_ID: attributeMeta.DOMAIN_ID,
      DOMAIN_TYPE: attributeMeta.DOMAIN_TYPE,
      DOMAIN_ENTITY_ID: attributeMeta.DOMAIN_ENTITY_ID,
      DOMAIN_RELATION_ID: attributeMeta.DOMAIN_RELATION_ID,
      KEY: key,
      VALUE: value
 * }
 * @param callback
 * @private
 */
function _checkDomainValue(valueCheckDomain, callback) {
  let selectSQL = "select * from ";
  switch (valueCheckDomain.DOMAIN_TYPE) {
    case 2: // Entity Relation
      entityDB.getRelationMeta(valueCheckDomain.DOMAIN_RELATION_ID, function (err, relationMeta) {
        if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
        const domainRelationAttribute =
          relationMeta.ATTRIBUTES.find( attribute => attribute.DOMAIN_ID === valueCheckDomain.DOMAIN_ID );
        selectSQL += entityDB.pool.escapeId(valueCheckDomain.DOMAIN_RELATION_ID) + " as A join " +
          entityDB.pool.escapeId(valueCheckDomain.DOMAIN_ENTITY_ID) + " as B on A.INSTANCE_GUID = B.INSTANCE_GUID" +
          " where A." + entityDB.pool.escapeId(domainRelationAttribute.ATTR_NAME) +
          " = " + entityDB.pool.escape(valueCheckDomain.VALUE);
        __runCheckQuery(callback);
      });
          break;
    case 3: // Value Array
      selectSQL += " `DATA_DOMAIN_VALUE` where DOMAIN_ID = " + entityDB.pool.escape(valueCheckDomain.DOMAIN_ID) +
        " and LOW_VALUE = " + entityDB.pool.escape(valueCheckDomain.VALUE);
      __runCheckQuery(callback);
          break;
    case 4: // Value Interval
      selectSQL += " `DATA_DOMAIN_VALUE` where DOMAIN_ID = " + entityDB.pool.escape(valueCheckDomain.DOMAIN_ID) +
        " and LOW_VALUE <= " + entityDB.pool.escape(valueCheckDomain.VALUE) +
        " and HIGH_VALUE >= " + entityDB.pool.escape(valueCheckDomain.VALUE);
      __runCheckQuery(callback);
          break;
    default:
  }

  function __runCheckQuery(callback) {
    selectSQL += " limit 1";
    entityDB.executeSQL(selectSQL, function (err, rows) {
      if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      if (rows.length === 0)
        callback(null, message.report('ENTITY','INVALID_VALUE_IN_DOMAIN','E',
          valueCheckDomain.VALUE, valueCheckDomain.KEY, valueCheckDomain.RELATION_ID, valueCheckDomain.DOMAIN_ID));
      else callback(null, null);
    })
  }
}

function _checkEntityExist(relationshipInstance, callback) {
  if (relationshipInstance.action !== 'add' || relationshipInstance.noExistingCheck) return callback(null, null);
  let selectSQL = "select * from ENTITY_INSTANCES where INSTANCE_GUID = "
    + entityDB.pool.escape(relationshipInstance.PARTNER_INSTANCE_GUID)
    + " and ENTITY_ID = " + entityDB.pool.escape(relationshipInstance.PARTNER_ENTITY_ID);
  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (rows.length === 0)
      callback(null, message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', relationshipInstance.PARTNER_INSTANCE_GUID));
    else callback(null, null);
  })
}

function _checkRelationshipValueValidity(selfGUID, relationship, callback) {
  let selectSQL = "select * from " + entityDB.pool.escapeId(relationship.RELATIONSHIP_ID);
  if (relationship.action === 'add'){
    if (relationship.PARTNER_ROLE_CARDINALITY === '[1..1]') {
      // The partner entity can only exist in one such type of relationship in a given period
      // Then we should check if the partner entity has the relationship exists in the DB
      selectSQL += " where " + entityDB.pool.escapeId(relationship.PARTNER_ROLE_ID + "_INSTANCE_GUID") +
        " = " + entityDB.pool.escape(relationship.PARTNER_INSTANCE_GUID);
    } else if (relationship.PARTNER_ROLE_CARDINALITY === '[1..n]'
               && relationship.SELF_ROLE_CARDINALITY === '[1..1]') {
      // The partner entity can exist in multiple such type of relationships,
      // however, the entity itself can only exist in one such relationship.
      // Then we should check if the partner entity already has such relationship exist in the DB,
      selectSQL += " where " + entityDB.pool.escapeId(relationship.SELF_ROLE_ID + "_INSTANCE_GUID") +
        " = " + entityDB.pool.escape(selfGUID);
    } else if (relationship.PARTNER_ROLE_CARDINALITY === '[1..n]'
               && relationship.SELF_ROLE_CARDINALITY === '[1..n]') {
      // Both the entity itself and its partner entities can exist in multiple such type of relationships.
      if (relationship.SINGLETON) { // In case singleton, only one relationship instance is allowed for a pair.
        selectSQL += " where " + entityDB.pool.escapeId(relationship.SELF_ROLE_ID + "_INSTANCE_GUID") +
          " = " + entityDB.pool.escape(selfGUID) + " and " +
          entityDB.pool.escapeId(relationship.PARTNER_ROLE_ID + "_INSTANCE_GUID") + " = " +
          entityDB.pool.escape(relationship.PARTNER_INSTANCE_GUID);
      } else { // Then there is no need to check overlaps.
        selectSQL += " where 1 != 1 ";
      }
    }
  } else {
    selectSQL += " where INSTANCE_GUID = " + entityDB.pool.escape(relationship.RELATIONSHIP_INSTANCE_GUID);
  }

  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);

    if (relationship.action === 'add') {
      const line = relationship.IS_TIME_DEPENDENT ?
        results.find(function (result) { return (relationship.VALID_FROM < result.VALID_TO && relationship.VALID_TO > result.VALID_FROM);}) :
        results[0];

      if (line) {
        return callback([message.report('ENTITY', 'RELATIONSHIP_INSTANCE_OVERLAP', 'E', relationship.RELATIONSHIP_ID)]);
      }
    } else {
      const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
      if (results.length === 0)
        return callback([message.report('ENTITY', 'RELATIONSHIP_INSTANCE_NOT_EXIST', 'E', relationship.RELATIONSHIP_INSTANCE_GUID)]);
      let originalValue = results[0];
      if (relationship.IS_TIME_DEPENDENT && originalValue.VALID_TO <= currentTime)
        return callback([message.report('ENTITY', 'CHANGE_TO_EXPIRED_RELATIONSHIP', 'E', relationship.RELATIONSHIP_INSTANCE_GUID)]);
      if((relationship.action === 'expire' || relationship.action === 'extend') && originalValue.VALID_FROM > currentTime)
        return callback([message.report('ENTITY', 'FUTURE_RELATIONSHIP', 'E', originalValue.RELATIONSHIP_INSTANCE_GUID)]);
      if(relationship.IS_TIME_DEPENDENT && relationship.action === 'delete' && originalValue.VALID_FROM <= currentTime)
        return callback([message.report('ENTITY', 'RELATIONSHIP_DELETION_NOT_ALLOWED', 'E', relationship.RELATIONSHIP_ID)]);
    }
    callback(null);
  });
}

function _checkAdd01Relation(relationID, instanceGUID, callback) {
  let selectSQL = "select count(*) as total from " + entityDB.pool.escapeId(relationID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (results[0].total > 0)
      callback(null,
        message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', relationID));
    else
      callback(null, null);
  })
}
function _checkDelete11Relation(deleteRelation, instanceGUID, callback) {
  let selectSQL = "select count(*) as total from "  + entityDB.pool.escapeId(deleteRelation.relationID) +
    " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  for (const key in deleteRelation.primaryKeyValue) {
    if (key === 'action') { continue }
    selectSQL += " and " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(deleteRelation.primaryKeyValue[key]);
  }
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (results[0].total !== 1)
      callback(null,
        message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', deleteRelation.relationID));
    else
      callback(null, null);
  })
}
function _checkDelete1nRelation(deleteRelation, instanceGUID, callback) {
  let selectSQL = "select count(*) as total from " + entityDB.pool.escapeId(deleteRelation.RELATION_ID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (results[0].total <= deleteRelation.COUNT)
      callback(null,
        message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', deleteRelation.RELATION_ID));
    else
      callback(null, null);
  })
}
/**
 * Get the instance GUID from the given attributes
 * The given attributes may correspond to many instances, but it only picks one.
 * So be sure to give the attributes that can uniquely identify an instance.
 * @param idAttr
 * example: {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(errs, instanceGUID)
 * @private
 */
function _getGUIDFromBusinessID(idAttr, callback) {
  if(!idAttr.RELATION_ID)return callback([message.report('ENTITY', 'RELATION_ID_MISSING', 'E')]);

  // Compose select SQL
  let selectSQL;
  selectSQL = "select INSTANCE_GUID from " + entityDB.pool.escapeId(idAttr.RELATION_ID);
  let whereClause;
  _.each(idAttr, function(value, key){
    if(key === 'RELATION_ID')return;
    whereClause?whereClause = whereClause + " and " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(value):
      whereClause = " where " + entityDB.pool.escapeId(key) + " = " + entityDB.pool.escape(value);
  });
  if(whereClause)selectSQL += whereClause;
  else return callback([message.report('ENTITY', 'IDENTIFY_ATTRIBUTE_MISSING', 'E')]);

  selectSQL += " limit 1";
  entityDB.executeSQL(selectSQL, function(err, results){
    if(err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if(results.length === 0) return callback([message.report('ENTITY', 'INSTANCE_NOT_IDENTIFIED', 'E')]);

    _getEntityInstanceHead(results[0].INSTANCE_GUID, function (errs, instanceHead) {
      if(errs) return callback(errs);
      else callback(null, instanceHead.INSTANCE_GUID);
    })
  })
}

/**
 * Orchestrate multiple operations in one transaction.
 * This is useful in some circumstances that multiple instances need to be processed in one transaction.
 * For example, you want to create 2 people and marry them.
 * You want this transaction to be finished in one call, and if failed, all the operations should be rolled back.
 *
 * @param operations The provides operations are
 * createInstance, changeInstance, softDeleteInstanceByGUID, hardDeleteByGUID, getInstancePieceByGUID
 * @param callback (errs, results)
 * errs: null if successful, or error messages;
 * results: an updated operation array with each operation a result node
 * which may contain instance or updateSQLs.
 *
 * @example
 * Here gives an example of operation array which is assigned to the parameter operations:
 * [
 *  {
 *    action: 'createInstance',
 *    replacements: [],
 *    noCommit: true,
 *    instance: {} // An instance object
 *    result: {instance, updateSQLs} // Return Object
 *  },
 *  {
 *    action: 'createInstance',
 *    replacements: [
 *    {movePath: [0, 'result', 'instance', 'INSTANCE_GUID'],
 *     toPath: ['relationships', 0, 'values', 0, 'PARTNER_INSTANCES', 0, 'INSTANCE_GUID']}
 *    ],
 *    noCommit: true,
 *    instance: {} // An instance object
 *    result: {instance, updateSQLs} // Return Object
 *  },
 *  {
 *    action: 'changeInstance',
 *    replacements: [],
 *    instance: {},
 *    result: {updateSQLs}
 *  }
 * ...
 * ]
 */
function orchestrate(operations, callback) {
  async.mapSeries(operations, function (operation, callback) {
    switch (operation.action) {
      case 'createInstance':
        _replaceValue( operation.replacements, operation.instance, operations);
        createInstance(operation.instance, function (errs, instance, insertSQLs) {
          if (errs) {
            callback(errs);
          } else {
            operation.result = {instance: instance, updateSQLs: insertSQLs };
            callback(null);
          }
        }, operation.noCommit);
        break;
      case 'changeInstance':
        _replaceValue( operation.replacements, operation.instance, operations);
        changeInstance(operation.instance, function (errs, updateSQLs) {
          if (errs) {
            callback(errs);
          } else {
            operation.result = {updateSQLs: updateSQLs };
            callback(null);
          }
        }, operation.noCommit);
        break;
      case 'softDeleteInstanceByGUID':
        softDeleteInstanceByGUID(operation.instance.INSTANCE_GUID, function (errs, updateSQLs) {
          if (errs) {
            callback(errs);
          } else {
            operation.result = {updateSQLs: updateSQLs };
            callback(null);
          }
        }, operation.noCommit);
        break;
      case 'hardDeleteByGUID':
        hardDeleteByGUID(operation.instance.INSTANCE_GUID, function (errs, deleteSQLs) {
          if (errs) {
            callback(errs);
          } else {
            operation.result = {updateSQLs: deleteSQLs };
            callback(null);
          }
        }, operation.noCommit);
        break;
      case 'getInstancePieceByGUID':
        _replaceValue( operation.replacements, operation.instance, operations);
        getInstancePieceByGUID(operation.instance.INSTANCE_GUID, operation.instance,function (errs, instance) {
          if (errs) {
            callback(errs);
          } else {
            operation.result = {instance: instance };
            callback(null);
          }
        });
        break;
      default:
        callback(null);
    }
  }, function (errs) {
    if (errs) return callback(errs);
    let updateSQLs = [];
    operations.forEach( operation => {
      if ( ( operation.action === 'createInstance' ||
             operation.action === 'changeInstance' ||
             operation.action === 'softDeleteInstanceByGUID' ||
             operation.action === 'hardDeleteByGUID')  && operation.noCommit ) {
        updateSQLs = updateSQLs.concat(operation.result.updateSQLs);
      }
    });
    entityDB.doUpdatesParallel(updateSQLs, function (err) {
      if (err) {
        callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      } else {
        callback(null, operations);
      }
    });
  });
}

function _replaceValue(replacements, currentInstance, operations) {
  if (!replacements || replacements.length === 0) return;

  replacements.forEach( replacement => {
    let source = operations;
    let target = currentInstance;
     replacement.movePath.forEach( node => {
       source = source[node];
     });
     replacement.toPath.forEach( (node, idx) => {
       if (idx === replacement.toPath.length - 1) {
         target[node] = source;
       } else {
         target = target[node];
       }
     });
  });
}

