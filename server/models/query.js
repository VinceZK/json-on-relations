/*
Created by VinceZK on 2018.09.02
 */
const entityDB = require('./connections/sql_mdb.js');
const async = require('async');
const Message = require('ui-message').Message;
const MsgArrayStore = require('ui-message').MsgArrayStore;
const msgArray = require('./message_query.js');

const msgStore = new MsgArrayStore(msgArray);
const message = new Message(msgStore, 'EN');

module.exports = {
  run: run
};

/**
 * A query can be represented as a JSON
 * @param queryObject:
  * {
      ENTITY_ID: 'person',
      RELATION_ID: 'r_user',

      PROJECTION: [
        'USER_ID',
        'USER_NAME',
        'GIVEN_NAME',
        {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'}
      ],

      FILTER: [
        {
          FIELD_NAME: 'USER_ID',
          OPERATOR: 'BT',
          LOW: 'DH002',
          HIGH: 'DH006'
        },
        {
          FIELD_NAME: 'LANGUAGE',
          OPERATOR: 'EQ',
          RELATION_ID: 'r_personalization',
          LOW: 'ZH'
        }
      ]

      SORT: [
        'USER_ID',
        {FIELD_NAME: 'USER_NAME', RELATION_ID: 'r_user', ORDER: 'DESC|ASC'}
      ]
    };
 * @param callback(errs, rows)
 */
function run(queryObject, callback) {
  const errorMessages = [];
  const joinRelations = [];
  let projectionString = '';
  let filterString = '';
  let joinString = '';
  let sortString = '';
  let selectSQL = '';

  if(!queryObject['ENTITY_ID']) {
    errorMessages.push(message.report('QUERY', 'MISS_ENTITY', 'E'));
    return callback(errorMessages);
  }

  if(!queryObject['RELATION_ID']) {
    errorMessages.push(message.report('QUERY', 'MISS_RELATION', 'E'));
    return callback(errorMessages);
  }

  if (queryObject.RELATION_ID.substr(0,2) === 'rs') {
    errorMessages.push(message.report('QUERY', 'RELATIONSHIP_RELATION_NOT_SUPPORTED', 'E'));
    return callback(errorMessages);
  }

  entityDB.getRelationMeta(queryObject.RELATION_ID, function (errs, factRelationMeta) {
    if (!factRelationMeta) {
      errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
      return callback(errorMessages);
    }

    async.series([
      function (callback) {
        __parseProjection(factRelationMeta, callback);
      },
      function (callback) {
        __parseFilter(callback);
      },
      function (callback) {
        __parseSort(factRelationMeta, callback);
      },
      function (callback) {
        __parseJoin(factRelationMeta, callback);
      }
    ], function (errs) {
      if (errs) return callback(errs);

      selectSQL = 'select ' + projectionString + ' from ' + entityDB.pool.escapeId(queryObject.RELATION_ID);
      selectSQL += joinString;
      if (filterString) selectSQL += ' where ' + filterString +
        ' and `ENTITY_INSTANCES`.`ENTITY_ID` = ' + entityDB.pool.escape(queryObject.ENTITY_ID);
      if (sortString) selectSQL += ' order by ' + sortString;
      entityDB.executeSQL(selectSQL, function (err, rows) {
        if (err) callback([message.report('QUERY', 'GENERAL_ERROR', 'E', err)]);
        else callback(null, rows);
      });
    });
  });

  function __parseProjection(factRelationMeta, callback) {
    if(!queryObject.PROJECTION ) {
      projectionString = ' * ';
      return callback(null);
    }

    if(!Array.isArray(queryObject.PROJECTION)) {
      errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
      return callback(errorMessages);
    } else {
      if(queryObject.PROJECTION.length === 0) {
        projectionString = ' * ';
        return callback(null);
      }
    }

    async.forEachOfSeries(queryObject.PROJECTION, function (projectedField, i, callback) {
      if (i !== 0) projectionString += ", ";

      if(typeof projectedField === 'string') {
        ___composeProjectionString(queryObject.RELATION_ID, projectedField, factRelationMeta);
        callback(null)
      } else { // {fieldName: 'Field3', Alias: 'Field3_XXXX', relation: 'r_relation1'}
        if (!projectedField.FIELD_NAME) {
          errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
          callback(null);
        }
        if(!projectedField.RELATION_ID || projectedField.RELATION_ID === queryObject.RELATION_ID) {
          ___composeProjectionString(queryObject.RELATION_ID, projectedField.FIELD_NAME, factRelationMeta, projectedField.ALIAS);
          callback(null)
        } else {
          entityDB.getRelationMeta(projectedField.RELATION_ID, function (errs, relationMeta) {
            if (errs) return callback(errs);
            if (!relationMeta) {
              errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
              return callback(null);
            }
            ___composeProjectionString(projectedField.RELATION_ID, projectedField.FIELD_NAME, relationMeta, projectedField.ALIAS);
            __putJoinRelation(projectedField.RELATION_ID);
            callback(null);
          });
        }
      }
    }, function (errs) {
      if (errs) return callback(errs);
      if (errorMessages.length > 0 ) return callback(errorMessages);
      projectionString += ' , ' + entityDB.pool.escapeId(queryObject.RELATION_ID) + '.' + entityDB.pool.escapeId('INSTANCE_GUID');
      callback(null);
    });

    function ___composeProjectionString(relationID, fieldName, relationMeta, alias) {
      const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
        return attribute.ATTR_NAME === fieldName;
      });
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', fieldName, relationID));
      } else {
        projectionString += entityDB.pool.escapeId(relationID) + '.' + entityDB.pool.escapeId(fieldName);
      }
      if (alias) projectionString += ' as ' + entityDB.pool.escapeId(alias);
    }
  }

  function __parseFilter(callback) {
    if(!queryObject.FILTER) queryObject.FILTER = [];
    if(!Array.isArray(queryObject.FILTER)) {
      errorMessages.push(message.report('QUERY', 'INVALID_FILTER', 'E'));
      return callback(errorMessages);
    }
    async.forEachOfSeries(queryObject.FILTER, function (selectOption, i, callback) {
      if (!selectOption.FIELD_NAME) {
        errorMessages.push(message.report('QUERY', 'FILTER_MISS_FIELD_NAME', 'E'));
        return callback(null);
      }

      if (!selectOption.LOW) { return callback(null); } // If low value is not given, bypass.

      let relation;
      if(!selectOption.RELATION_ID || selectOption.RELATION_ID === queryObject.RELATION_ID) {
        relation = queryObject.RELATION_ID;
      } else {
        relation = selectOption.RELATION_ID;
        __putJoinRelation(relation);
      }

      entityDB.getRelationMeta(relation, function (errs, relationMeta) {
        if (errs) return callback(errs);
        if (!relationMeta) {
          errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
          return callback(null);
        }
        const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
          return attribute.ATTR_NAME === selectOption.FIELD_NAME
        });
        if (index === -1) {
          errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', selectOption.FIELD_NAME, relation));
          return callback(null);
        }
        if (i !== 0) filterString += " AND ";
        switch (selectOption.OPERATOR) {
          case 'EQ':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " = " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'NE':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " != " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'GT':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " > " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'GE':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " >= " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'LT':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " < " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'LE':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " <= " + entityDB.pool.escape(selectOption.LOW);
            break;
          case 'BT':
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " between " + entityDB.pool.escape(selectOption.LOW) + ' and ' + entityDB.pool.escape(selectOption.HIGH);
            break;
          case 'CN':
            if (selectOption.LOW) {
              let wildcardValue = selectOption.LOW;
              if (wildcardValue.includes('*')) {
                wildcardValue = wildcardValue.replace(/\*/gi, '%');
              } else if (!wildcardValue.includes('%')) {
                wildcardValue = `%` + wildcardValue + `%`;
              }
              filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
                + " like "  + entityDB.pool.escape(wildcardValue);
            }
            break;
          default:
            errorMessages.push(message.report('QUERY', 'INVALID_OPERATOR', 'E', selectOption.OPERATOR))
        }
        callback(null);
      });
    }, function (errs) {
      if (errs) return callback(errs);
      if (errorMessages.length > 0 ) return callback(errorMessages);
      callback(null);
    });
  }

  function __parseSort(factRelationMeta, callback) {
    if (!queryObject.SORT) return callback(null);

    if(!Array.isArray(queryObject.SORT)) {
      errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
      return callback(errorMessages);
    } else {
      if(queryObject.SORT.length === 0) {
        return callback(null);
      }
    }

    async.forEachOfSeries(queryObject.SORT, function (sortField, i, callback) {
      if (i !== 0) sortString += ", ";

      if(typeof sortField === 'string') {
        ___composeSortString(queryObject.RELATION_ID, sortField, factRelationMeta);
        callback(null);
      } else { // {fieldName: 'Field3', relation: 'r_relation1', order: 'DESC'}
        if (!sortField.FIELD_NAME) {
          errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
          return callback(null);
        }
        if(!sortField.RELATION_ID || sortField.RELATION_ID === queryObject.RELATION_ID) {
          ___composeSortString(queryObject.RELATION_ID, sortField.FIELD_NAME, factRelationMeta, sortField.ORDER);
          callback(null);
        } else {
          entityDB.getRelationMeta(sortField.RELATION_ID, function (errs, relationMeta) {
            if (errs) return callback(errs);
            if (!relationMeta) {
              errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
              return callback(null);
            }
            ___composeSortString(sortField.RELATION_ID, sortField.FIELD_NAME, relationMeta, sortField.ORDER);
            __putJoinRelation(sortField.RELATION_ID);
            callback(null);
          });
        }
      }
    }, function (errs) {
      if (errs) return callback(errs);
      if (errorMessages.length > 0 ) return callback(errorMessages);
      callback(null);
    });

    function ___composeSortString(relationID, fieldName, relationMeta, order) {
      const index = relationMeta.ATTRIBUTES.findIndex( attribute => attribute.ATTR_NAME === fieldName );
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', fieldName, relationID));
      } else {
        sortString += entityDB.pool.escapeId(relationID) + '.' + entityDB.pool.escapeId(fieldName);
      }
      order && order.toUpperCase() === 'DESC'? sortString += ' DESC' : sortString += ' ASC';
    }
  }

  function __putJoinRelation(relation) {
    if (relation === queryObject.RELATION_ID) return;
    const index = joinRelations.findIndex(function (joinRelation) {
      return joinRelation === relation;
    });
    if (index === -1) joinRelations.push(relation);
  }

  function __parseJoin(factRelationMeta, callback) {
    joinString = ' join `ENTITY_INSTANCES` on ' +  entityDB.pool.escapeId(queryObject.RELATION_ID) +
      '.`INSTANCE_GUID` = `ENTITY_INSTANCES`.`INSTANCE_GUID`';
    joinRelations.forEach( joinRelation => {
      let association;
      if (joinRelation === queryObject.ENTITY_ID) {
        association =  {
          ASSOCIATION_NAME: 'Entity master table',
          RIGHT_RELATION_ID: queryObject.ENTITY_ID,
          CARDINALITY: '[1..1]',
          FOREIGN_KEY_CHECK: false,
          FIELDS_MAPPING: [{
            LEFT_FIELD: 'INSTANCE_GUID',
            RIGHT_FIELD: 'INSTANCE_GUID'
          }]
        }
      } else {
        association = factRelationMeta.ASSOCIATIONS.find(function (assoc) {
          return assoc.RIGHT_RELATION_ID === joinRelation;
        });
      }
      if (!association) return;
      joinString += ' left join ' + entityDB.pool.escapeId(joinRelation) + ' on ';
      association.FIELDS_MAPPING.forEach(function (fieldsMapping, i) {
        if (i !== 0) joinString += ' and ';
        joinString += entityDB.pool.escapeId(queryObject.RELATION_ID) + '.' + entityDB.pool.escapeId(fieldsMapping.LEFT_FIELD) +
          ' = ' + entityDB.pool.escapeId(joinRelation) + '.' + entityDB.pool.escapeId(fieldsMapping.RIGHT_FIELD);
      })
    });
    callback(null);
  }

}


