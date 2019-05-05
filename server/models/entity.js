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
  hardDeleteByID: hardDeleteByID
};

function getEntityMeta(entityID) {
  let entityMeta = entityDB.getEntityMeta(entityID);
  return entityMeta? entityMeta : [message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', entityID)];
}

function getRelationMeta(relationID) {
  let relationMeta = entityDB.getRelationMeta(relationID);
  return relationMeta? relationMeta : [message.report('ENTITY', 'RELATION_META_NOT_EXIST', 'E', relationID)];
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
  let insertSQL;
  let insertSQLs = [];
  let errorMessages = [];
  let foreignRelations = [];
  let relationshipInstances = [];
  let results;

  console.log(instance);
  if(!instance['ENTITY_ID']){
    return callback([message.report('ENTITY', 'ENTITY_ID_MISSING', 'E')]);
  }

  let entityMeta = entityDB.getEntityMeta(instance['ENTITY_ID']);
  if(!entityMeta)
    return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID'])]);


  entityMeta.ROLES.forEach(function(role){
    role.RELATIONS.forEach(function(relation){
      if((relation.CARDINALITY === '[1..1]' || relation.CARDINALITY === '[1..n]') && !instance[relation.RELATION_ID])
        errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', relation.RELATION_ID, entityMeta.ENTITY_ID))
    })
  });
  if(errorMessages.length > 0) return callback(errorMessages);

  if (!instance[entityMeta.ENTITY_ID]) instance[entityMeta.ENTITY_ID] = {};

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
      entityDB.doUpdatesParallel(insertSQLs, function (err) {
        if (err) {
          callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
        } else {
          callback(null);
        }
      });
    }
  ],function (err) {
    if(err) callback(err); //The err should already be error messages
    else {
      instance['INSTANCE_GUID'] = instanceGUID;
      callback(null,instance);
    }
  });
}

function _condenseErrorMessages(results) {
  return results.filter(function (ele) {
    return ele !== null;
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
    if(err) return callback(err); // err should be already a message array
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
    if(err) callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
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
    if(err) callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
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
    if(err) return callback(err); // err should already be a message array
    hardDeleteByGUID(instanceGUID,callback);
  })
}
/**
 * Delete the object from the DB by INSTANCE_GUID
 * @param instanceGUID
 * @param callback(err)
 */
function hardDeleteByGUID(instanceGUID, callback) {
  _getEntityInstanceHead(instanceGUID, function (err, instanceHead) {
    if(err)return callback(err); //Already message instance

    if(instanceHead['DEL'] === 0)
      return callback([
        message.report('ENTITY', 'INSTANCE_NOT_MARKED_DELETE', 'E', instanceHead.INSTANCE_GUID, instanceHead.ENTITY_ID)]);

    let entityMeta = entityDB.getEntityMeta(instanceHead.ENTITY_ID);
    if(!entityMeta)
      return callback([message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instanceHead.ENTITY_ID)]);

    let deleteSQLs = [];
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

    entityDB.doUpdatesParallel(deleteSQLs, function (err) {
      if (err) {
        callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
      } else {
        callback(null);
      }
    });
  })
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
    if(err)return callback(err); // Already message array
    let instance = {INSTANCE_GUID: instanceGUID};
    instance.ENTITY_ID = instanceHead.ENTITY_ID;
    let entityMeta = entityDB.getEntityMeta(instance.ENTITY_ID);
    if(!entityMeta)
      return callback([message.report('ENTITY', 'ENTITY_NOT_EXIST', 'E', instanceGUID)]);

    async.parallel([
      function (callback) {
        __getRelationValue(instance, entityMeta, callback);
      },
      function (callback) {
        __getRelationshipValue(instance, entityMeta, callback);
      }
    ],function (err) {
      if(err) callback(err); //Already message instance
      else callback(null, instance)
    })

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

/**
 * Get a piece of information from an instance from its business ID
 * @param idAttr
 * for example: {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param piece
 *  {RELATIONS: ['r_user', 'r_email'],
 *  RELATIONSHIPS: ['user_role'] }
 * @param callback(err, instance)
 * For the return instance example, please refer method getInstanceByGUID
 */
function getInstancePieceByID(idAttr, piece, callback) {
  _getGUIDFromBusinessID(idAttr, function (err, instanceGUID) {
    if(err) return callback(err);
    getInstancePieceByGUID(instanceGUID, piece, callback);
  })
}

/**
 * Get a piece of information from an instance.
 * For example, only get the named attributes or relations
 * @param instanceGUID
 * @param piece
 * {RELATIONS: ['r_user', 'r_email'],
 *  RELATIONSHIPS: ['user_role'] }
 * @param callback(err, instance)
 */
function getInstancePieceByGUID(instanceGUID, piece, callback) {
  _getEntityInstanceHead(instanceGUID, function (err, instanceHead) {
    if(err)return callback(err); //Already message instance

    let instance = {INSTANCE_GUID: instanceGUID};
    instance.ENTITY_ID = instanceHead.ENTITY_ID;
    let entityMeta = entityDB.getEntityMeta(instance.ENTITY_ID);
    if(!entityMeta)
      return callback([message.report('ENTITY', 'ENTITY_NOT_EXIST', 'E', instanceGUID)]);

    async.parallel([
      function (callback) {
        __getRelationValue(instance, entityMeta, callback);
      },
      function (callback) {
        __getRelationshipValue(instance, entityMeta, callback);
      }
    ],function (err) {
      if(err) callback(err); //Already message instance
      else callback(null, instance)
    })

  });

  function __getRelationValue(instance, entityMeta, callback) {
    let relationIDs = piece.RELATIONS || [];
    let errorMessages = [];
    let relations = [];
    relationIDs.forEach(function (relationID) {
      let relation = _checkEntityHasRelation(relationID, entityMeta);
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
    },function (err) {
      if(err) callback(err);
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
 * @param callback
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
    // A entity can have both roles involved in a relationship.
    // For example, marriage involves roles husband and wife, which are both assigned to a person entity.
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
      if(err) return callback(message.report('ENTITY', 'GENERAL_ERROR', 'E', err));

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
          return callback(message.report('ENTITY', 'RELATIONSHIP_PARTNER_ENTITY_AMBIGUOUS', 'E', relationshipID))
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
            piece = relationship['PARTNER_ENTITY_PIECES'].find(function (element) {
              return element.ENTITY_ID === partnerInstance.ENTITY_ID;
            })['piece'];
          }
          getInstancePieceByGUID(partnerInstance.INSTANCE_GUID, piece, function (err, instance) {
            if (err) callback(err);
            _.each(instance, function (attrValue, attrKey) {
              if (attrKey === 'INSTANCE_GUID' || attrKey === 'ENTITY_ID') return;
              partnerInstance[attrKey] = attrValue;
            });
            callback(null);
          });
        }, callback);
      } else {
        callback(null);
      }
    });
  }
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
          if(err) return callback(err); // Already message array
          const errMsgs = _condenseErrorMessages(results);
          if(errMsgs.length > 0) return callback(errMsgs);//The results should already be error messages
          else return callback(null);
        });
      },
      function (callback) {//Check adding [0..1] relations
        async.map(add01Relations, function(relation, callback){
          _checkAdd01Relation(relation, instance['INSTANCE_GUID'], callback)
        }, function (err, results) {
          if(err) return callback(err); // Already message array
          const errMsgs = _condenseErrorMessages(results);
          if(errMsgs.length > 0) return callback(errMsgs); //The results should already be error messages
          else return callback(null);
        })
      },
      function (callback) {//Check deleting [1..n] relations
        async.map(delete1nRelations, function(relation, callback){
          _checkDelete1nRelation(relation, instance['INSTANCE_GUID'], callback)
        }, function (err, results) {
          if(err) return callback(err); // Already message array
          const errMsgs = _condenseErrorMessages(results);
          if(errMsgs.length > 0) return callback(errMsgs); //The results should already be error messages
          else return callback(null);
        })
      },
      function (callback) {//Relationship involved instances check
        async.map(relationshipInstances, function (relationshipInstance, callback) {
          _checkEntityExist(relationshipInstance, callback)
        }, function (err, results) {
          if(err) return callback(err);
          const errMsgs = _condenseErrorMessages(results);
          if(errMsgs.length > 0) return callback(errMsgs); //The results should already be error messages
          else return callback(null);
        });
      },
      function (callback) {//Relationship update/add check
        async.map(relationshipInstances, function (relationshipInstance, callback){
          _checkRelationshipValueValidity(instance['INSTANCE_GUID'], relationshipInstance, callback)
        }, function (err) {
          if(err) return callback(err); // Already message array
          else return callback(null);
        })
      },
      function (callback) {//Run all insert SQLs parallel
        entityDB.doUpdatesParallel(updateSQLs, function (err) {
          if (err) {
            callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
          } else {
            callback(null);
          }
        });
      }
    ],function (err) {
      if(err) callback(err); // Already message array
      else callback(null);
    });
  })
}

/**
 * Overwrite an Instance by mass updates.
 * Relationships cannot be overwritten.
 * @param instance
 * { ENTITY_ID: 'people', INSTANCE_GUID: '43DAE23498B6FC121D67717E79B8F3C0',
 *   relation1: [{a: '1', b: '2'}, {a: '3', b: '4'}],
 *   relation2: {c: '3', b: '4'}, ...
 * }
 * @param callback(err)
 */
function overwriteInstance(instance, callback) {
  let errorMessages = [];
  if (!instance['ENTITY_ID']) {
    errorMessages.push(message.report('ENTITY', 'ENTITY_ID_MISSING', 'E'));
    return callback(errorMessages);
  }

  let entityMeta = entityDB.getEntityMeta(instance['ENTITY_ID']);
  if (!entityMeta) {
    errorMessages.push(message.report('ENTITY', 'ENTITY_META_NOT_EXIST', 'E', instance['ENTITY_ID']));
    return callback(errorMessages);
  }

  let instanceGUID = instance['INSTANCE_GUID'];
  if (!instanceGUID) {
    errorMessages.push(message.report('ENTITY', 'INSTANCE_GUID_MISSING', 'E'));
    return callback(errorMessages);
  }

  if(!instance[entityMeta.ENTITY_ID]) {
    errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E'));
    return callback(errorMessages);
  }

  entityMeta.ROLES.forEach(function (role) {
    role.RELATIONS.forEach(function (relation) {
      if ((relation.CARDINALITY === '[1..1]' || relation.CARDINALITY === '[1..n]') && !instance[relation.RELATION_ID])
        errorMessages.push(message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', relation.RELATION_ID, entityMeta.ENTITY_ID))
    })
  });
  if (errorMessages.length > 0) return callback(errorMessages);
   
  getInstanceByGUID(instanceGUID, function (err, originalInstance) {
    if (err) return callback(err);

    //Parse the target instance to see which relations are added, and which are updated
    _.each(instance, function (value, key) {
      switch (key){
        case 'ENTITY_ID':
          break;
        case 'INSTANCE_GUID':
          break;
        case 'relationships':
          errorMessages.push(message.report('ENTITY', 'OVERWRITE_RELATIONSHIPS_NOT_ALLOWED', 'E'));
          break;
        default:
          if (!_.isArray(value)) instance[key] = [value];
          if (originalInstance[key]) {
            __compareAndSetAction(key, instance[key], originalInstance[key]);
          } else {
            if (_checkEntityHasRelation(key)) {
              instance[key].forEach(function (singleRelation) {
                singleRelation['action'] = 'add';
              })
            } else {
              errorMessages.push(message.report('ENTITY', 'RELATION_NOT_VALID', 'E', key, entityMeta.ENTITY_ID));
            }
          }
      }
    });
    if(errorMessages.length > 0) return callback(errorMessages);

    //Parse the original instance to see which relations are deleted.
    _.each(originalInstance, function (value, key) {
      switch (key){
        case 'ENTITY_ID':
          break;
        case 'INSTANCE_GUID':
          break;
        case 'relationships':
          break;
        default:
          if (!instance[key]) {
            instance[key] = [];
            value.forEach(function (singleValue) {
              let relationMeta = _isRelation(key);
              let deleteEntry = { action: 'delete'};
              _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1}).forEach(function (primaryKey) {
                deleteEntry[primaryKey.ATTR_NAME] = singleValue[primaryKey.ATTR_NAME];
              });
              instance[key].push(deleteEntry);
            })
          }
      }
    });
    if(errorMessages.length > 0) return callback(errorMessages);

    // Finally, change the instance
    changeInstance(instance, callback);
  });

  function __compareAndSetAction(relationID, target, original) {
    // in case entity relation, then the primary key is instance_guid.
    if (relationID === entityMeta.ENTITY_ID) {
      target[0]['action'] = 'update';
      return;
    }
    let relationMeta = _isRelation(relationID);
    let primaryKeys = _.where(relationMeta.ATTRIBUTES, {PRIMARY_KEY:1});
    target.forEach(function (singleValue) {
      if (errorMessages.length > 0) return;
      let primaryKeyValues = {};
      primaryKeys.forEach(function(attribute){
        if(!singleValue[attribute.ATTR_NAME])
          errorMessages.push(message.report('ENTITY','PRIMARY_KEY_MISSING','E', attribute.ATTR_NAME));
        else
          primaryKeyValues[attribute.ATTR_NAME] = singleValue[attribute.ATTR_NAME];
      });
      if (errorMessages.length > 0) return;

      if(_.findWhere(original, primaryKeyValues)) singleValue['action'] = 'update';
      else singleValue['action'] = 'add';
    });

    original.forEach(function (originalValue) {
      let primaryKeyValues = {};
      primaryKeys.forEach(function (attribute) {
        primaryKeyValues[attribute.ATTR_NAME] = originalValue[attribute.ATTR_NAME];
      });
      if(!_.findWhere(target, primaryKeyValues)) {
        primaryKeyValues['action'] = 'delete';
        target.push(primaryKeyValues);
      }
    })
  }
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
    if(err)return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if(results.length === 0)
      return callback([message.report('ENTITY','ENTITY_INSTANCE_NOT_EXIST','E', instanceGUID)]);
    callback(null, results[0]);
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
 * @returns {*}
 * @private
 */
function _generateRelationshipsSQL(relationships, entityMeta, instanceGUID, relationshipInstances) {
  let errorMessages = [];
  let SQLs = [];

  relationships.forEach(function (relationship) {
    const roleMeta = _checkEntityInvolvesRelationship(relationship['RELATIONSHIP_ID'], entityMeta);
    if(!roleMeta)
      return errorMessages.push(
        message.report('ENTITY', 'RELATIONSHIP_NOT_VALID', 'E', entityMeta.ENTITY_ID, relationship['RELATIONSHIP_ID']));
    const relationshipMeta = roleMeta.RELATIONSHIPS.find(function (element) {
      return element.RELATIONSHIP_ID === relationship['RELATIONSHIP_ID'];
    });

    const currentTime = timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss");
    relationship['values'].forEach(function (value) {
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

      let relationMeta = entityDB.getRelationMeta(relationship.RELATIONSHIP_ID);
      if(value.action === 'update'){ // Update relationship attributes
        let updateSQL;
        _.each(value, function (attrValue, attrKey) {
          if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' || attrKey === 'PARTNER_INSTANCES') return;

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
          if(attrKey === 'action' || attrKey === 'RELATIONSHIP_INSTANCE_GUID' || attrKey === 'PARTNER_INSTANCES') return;

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

      // Overlap checks should be done when they are updated in DB
      if(relationshipInstances) {
        let relationshipInstance =
          { RELATIONSHIP_ID: relationship['RELATIONSHIP_ID'],
            RELATIONSHIP_INSTANCE_GUID: value['RELATIONSHIP_INSTANCE_GUID'],
            IS_TIME_DEPENDENT: relationshipMeta.VALID_PERIOD > 0, // For time-dependency relationship (VALID_PERIOD is set and larger than 0)
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

    const groupByCardinality = _.groupBy(relationshipInstances, 'PARTNER_ROLE_CARDINALITY');
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
    if((roleRelationMeta.CARDINALITY === '[0..1]' || roleRelationMeta.CARDINALITY === '[1..1]') && value.length > 1) {
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
    if (!value || Object.keys(value).length === 0) return []; // Ignore null or empty relation value

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
    if (!value || Object.keys(value).length === 0) return []; // Ignore null or empty relation value
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
  let insertColumns = "( `INSTANCE_GUID`";
  let insertValues = "( " + entityDB.pool.escape(instanceGUID);
  _.each(relationRow, function (value, key) {
    if( key === 'action') {return;}
    let attributeMeta = relationMeta.ATTRIBUTES.find(function (ele) {
      return ele.ATTR_NAME === key;
    });

    if(attributeMeta && !attributeMeta.AUTO_INCREMENT){
      insertColumns += ", " + entityDB.pool.escapeId(key);
      insertValues += ", " + entityDB.pool.escape(value);
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

function _checkEntityInvolvesRelationship(relationshipID, entityMeta) {
  return entityMeta.ROLES.find(function (role) {
    if (!role.RELATIONSHIPS) return false;

    let relationship = role.RELATIONSHIPS.find(function (element) {
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
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (rows.length === 0)
      callback(null, message.report('ENTITY','FOREIGN_KEY_CHECK_ERROR','E',foreignKeyValue,association.RIGHT_RELATION_ID));
    else callback(null, null);
  })
}

function _checkEntityExist(relationshipInstance, callback) {
  if (relationshipInstance.action !== 'add') return callback(null, null);
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
      // Then we should check if the pair already exists in the DB.
      selectSQL += " where " + entityDB.pool.escapeId(relationship.SELF_ROLE_ID + "_INSTANCE_GUID") +
        " = " + entityDB.pool.escape(selfGUID) + " and " +
        entityDB.pool.escapeId(relationship.PARTNER_ROLE_ID + "_INSTANCE_GUID") + " = " +
        entityDB.pool.escape(relationship.PARTNER_INSTANCE_GUID);
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
  let selectSQL = "select * from " + entityDB.pool.escapeId(relationID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (results.length > 0) callback(null, message.report('ENTITY', 'RELATION_NOT_ALLOW_MULTIPLE_VALUE', 'E', relationID));
    else callback(null, null);
  })
}

function _checkDelete1nRelation(deleteRelation, instanceGUID, callback) {
  let selectSQL = "select * from " + entityDB.pool.escapeId(deleteRelation.RELATION_ID)
    + " where INSTANCE_GUID = " + entityDB.pool.escape(instanceGUID);
  entityDB.executeSQL(selectSQL, function (err, results) {
    if (err) return callback([message.report('ENTITY', 'GENERAL_ERROR', 'E', err)]);
    if (results.length <= deleteRelation.COUNT)
      callback(null, message.report('ENTITY', 'MANDATORY_RELATION_MISSING', 'E', deleteRelation.RELATION_ID));
    else callback(null, null);
  })
}
/**
 * Get the instance GUID from the given attributes
 * The given attributes may correspond to many instances, but it only picks one.
 * So be sure to give the attributes that can uniquely identify an instance.
 * @param idAttr
 * example: {RELATION_ID: 'r_user', USER_ID: 'DH001'}
 * @param callback(err, instanceGUID)
 * @private
 */
function _getGUIDFromBusinessID(idAttr, callback) {
  if(!idAttr.RELATION_ID)return callback([message.report('ENTITY', 'RELATION_ID_MISSING', 'E')]);

  let relationMeta = entityDB.getRelationMeta(idAttr.RELATION_ID);
  if(!relationMeta)return callback([message.report('ENTITY', 'RELATION_NOT_EXIST', 'E', idAttr.RELATION_ID)]);

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

    _getEntityInstanceHead(results[0].INSTANCE_GUID, function (err, instanceHead) {
      if(err) return callback(err);
      else callback(null, instanceHead.INSTANCE_GUID);
    })
  })
}
