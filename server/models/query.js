/*
Created by VinceZK on 2018.09.02
 */

const entityDB = require('./connections/sql_mdb.js');
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
 {
      relation: 'r_user',

      projection: [
        'USER_ID',
        'USER_NAME',
        'GIVEN_NAME',
        {fieldName: 'COMPANY_ID', alias: 'Company', relation: 'r_employee'}
      ],

      filter: [
        {
          fieldName: 'USER_ID',
          operator: 'BT',
          low: 'DH002',
          high: 'DH006'
        },
        {
          fieldName: 'LANGUAGE',
          operator: 'EQ',
          relation: 'r_personalization',
          low: 'ZH'
        }
      ]

      sort: [
        'USER_ID',
        {fieldName: 'USER_NAME', relation: 'r_user', order: 'DESC|ASC'}
      ]
    };
 */
function run(queryObject, callback) {
  const errorMessages = [];
  const joinRelations = [];
  let projectionString = '';
  let filterString = '';
  let joinString = '';
  let sortString = '';
  let selectSQL = '';

  if(!queryObject['relation']) {
    errorMessages.push(message.report('QUERY', 'MISS_RELATION', 'E'));
    return callback(errorMessages);
  }

  const factRelationMeta = entityDB.getRelationMeta(queryObject.relation);
  if (!factRelationMeta) {
    errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.relation));
    return callback(errorMessages);
  }

  __parseProjection();
  if(errorMessages.length > 0) return callback(errorMessages);
  __parseFilter();
  if(errorMessages.length > 0) return callback(errorMessages);
  __parseSort();
  if(errorMessages.length > 0) return callback(errorMessages);
  __parseJoin();
  if(errorMessages.length > 0) return callback(errorMessages);

  if (projectionString) selectSQL = 'select ' + projectionString + ' from ' + entityDB.pool.escapeId(queryObject.relation);
  if (joinString) selectSQL += joinString;
  if (filterString) selectSQL += ' where ' + filterString;
  if (sortString) selectSQL += ' order by ' + sortString;

  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('QUERY', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });

  function __parseProjection() {
    if(!queryObject.projection ) {
      projectionString = ' * ';
      return;
    }

    if(!Array.isArray(queryObject.projection)) {
      errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
      return;
    } else {
      if(queryObject.projection.length === 0) {
        projectionString = ' * ';
        return;
      }
    }

    queryObject.projection.forEach(function (projectedField, i) {
      let relationMeta;
      let relation;
      let fieldName;

      if (i !== 0) projectionString += ", ";

      if(typeof projectedField === 'string') {
        relation = queryObject.relation;
        relationMeta = factRelationMeta;
        fieldName = projectedField;
      } else { // {fieldName: 'Field3', Alias: 'Field3_XXXX', relation: 'r_relation1'}
        if (!projectedField.fieldName) {
          errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
          return;
        }
        fieldName = projectedField.fieldName;
        if(!projectedField.relation || projectedField.relation === queryObject.relation) {
          relation = queryObject.relation;
          relationMeta = factRelationMeta;
        } else {
          relation = projectedField.relation;
          relationMeta = entityDB.getRelationMeta(relation);
          __putJoinRelation(relation);
        }
      }

      if(!relationMeta) {
        errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', relation));
        return;
      }
      const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
        return attribute.ATTR_NAME === fieldName;
      });
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', fieldName, relation));
      } else {
        projectionString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(fieldName);
      }
      if (projectedField.alias) projectionString += ' as ' + entityDB.pool.escapeId(projectedField.alias);
    });

    projectionString += ' , ' + entityDB.pool.escapeId(queryObject.relation) + '.' + entityDB.pool.escapeId('INSTANCE_GUID');
  }

  function __parseFilter() {
    if(!queryObject.filter) queryObject.filter = [];
    if(!Array.isArray(queryObject.filter)) {
      errorMessages.push(message.report('QUERY', 'INVALID_FILTER', 'E'));
      return;
    }
    queryObject.filter.forEach(function (selectOption, i) {
      if (!selectOption.fieldName) {
        errorMessages.push(message.report('QUERY', 'FILTER_MISS_FIELD_NAME', 'E'));
        return;
      }

      if (!selectOption.low) { return; } // If low value is not given, bypass.

      let relation;
      if(!selectOption.relation || selectOption.relation === queryObject.relation) {
        relation = queryObject.relation;
      } else {
        relation = selectOption.relation;
        __putJoinRelation(relation);
      }

      const relationMeta = entityDB.getRelationMeta(relation);
      if (!relationMeta) {
        errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.relation));
        return;
      }
      const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
        return attribute.ATTR_NAME === selectOption.fieldName
      });
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', selectOption.fieldName, relation));
        return;
      }
      if (i !== 0) filterString += " AND ";
      switch (selectOption.operator) {
        case 'EQ':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " = " + entityDB.pool.escape(selectOption.low);
          break;
        case 'NE':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " != " + entityDB.pool.escape(selectOption.low);
          break;
        case 'GT':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " > " + entityDB.pool.escape(selectOption.low);
          break;
        case 'GE':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " >= " + entityDB.pool.escape(selectOption.low);
          break;
        case 'LT':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " < " + entityDB.pool.escape(selectOption.low);
          break;
        case 'LE':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " <= " + entityDB.pool.escape(selectOption.low);
          break;
        case 'BT':
          filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.fieldName)
            + " between " + entityDB.pool.escape(selectOption.low) + ' and ' + entityDB.pool.escape(selectOption.high);
          break;
        default:
          errorMessages.push(message.report('QUERY', 'INVALID_OPERATOR', 'E', selectOption.operator))
      }
    });
  }

  function __putJoinRelation(relation) {
    if (relation === queryObject.relation) return;
    const index = joinRelations.findIndex(function (joinRelation) {
      return joinRelation === relation;
    });
    if (index === -1) joinRelations.push(relation);
  }
  
  function __parseJoin() {
    joinRelations.forEach(function (joinRelation) {
      const association = factRelationMeta.ASSOCIATIONS.find(function (assoc) {
        return assoc.RIGHT_RELATION_ID === joinRelation;
      });
      joinString += ' left join ' + entityDB.pool.escapeId(joinRelation) + ' on ';
      association.FIELDS_MAPPING.forEach(function (fieldsMapping, i) {
        if (i !== 0) joinString += ' and ';
        joinString += entityDB.pool.escapeId(queryObject.relation) + '.' + entityDB.pool.escapeId(fieldsMapping.LEFT_FIELD) +
          ' = ' + entityDB.pool.escapeId(joinRelation) + '.' + entityDB.pool.escapeId(fieldsMapping.RIGHT_FIELD);
      })
    })
  }

  function __parseSort() {
    if (!queryObject.sort) return;

    if(!Array.isArray(queryObject.sort)) {
      errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
      return;
    } else {
      if(queryObject.sort.length === 0) {
        return;
      }
    }

    queryObject.sort.forEach(function (sortField, i) {
      if (i !== 0) sortString += ", ";

      let relationMeta;
      let relation;
      let fieldName;

      if(typeof sortField === 'string') {
        relation = queryObject.relation;
        relationMeta = factRelationMeta;
        fieldName = sortField;
      } else { // {fieldName: 'Field3', relation: 'r_relation1', order: 'DESC'}
        if (!sortField.fieldName) {
          errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
          return;
        }
        fieldName = sortField.fieldName;
        if(!sortField.relation || sortField.relation === queryObject.relation) {
          relation = queryObject.relation;
          relationMeta = factRelationMeta;
        } else {
          relation = sortField.relation;
          relationMeta = entityDB.getRelationMeta(relation);
          __putJoinRelation(relation);
        }
      }

      if(!relationMeta) {
        errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', relation));
        return;
      }
      const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
        return attribute.ATTR_NAME === fieldName;
      });
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', fieldName, relation));
      } else {
        sortString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(fieldName);
      }

      sortField.order && sortField.order.toUpperCase() === 'DESC'?
        sortString += ' DESC' : sortString += ' ASC';
    });
  }
}


