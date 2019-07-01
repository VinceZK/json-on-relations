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

  const factRelationMeta = entityDB.getRelationMeta(queryObject.RELATION_ID);
  if (!factRelationMeta) {
    errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
    return callback(errorMessages);
  }

  __parseProjection();
  if(errorMessages.length > 0) return callback(errorMessages);
  __parseFilter();
  if(errorMessages.length > 0) return callback(errorMessages);
  __parseSort();
  if(errorMessages.length > 0) return callback(errorMessages);
  joinString = ' join `ENTITY_INSTANCES` on ' +  entityDB.pool.escapeId(queryObject.RELATION_ID) +
    '.`INSTANCE_GUID` = `ENTITY_INSTANCES`.`INSTANCE_GUID`';
  __parseJoin();
  if(errorMessages.length > 0) return callback(errorMessages);

  if (projectionString) selectSQL = 'select ' + projectionString + ' from ' + entityDB.pool.escapeId(queryObject.RELATION_ID);
  selectSQL += joinString;
  if (filterString) selectSQL += ' where ' + filterString +
    ' and `ENTITY_INSTANCES`.`ENTITY_ID` = ' + entityDB.pool.escape(queryObject.ENTITY_ID);
  if (sortString) selectSQL += ' order by ' + sortString;

  entityDB.executeSQL(selectSQL, function (err, rows) {
    if (err) return callback(message.report('QUERY', 'GENERAL_ERROR', 'E', err));
    else callback(null, rows);
  });

  function __parseProjection() {
    if(!queryObject.PROJECTION ) {
      projectionString = ' * ';
      return;
    }

    if(!Array.isArray(queryObject.PROJECTION)) {
      errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
      return;
    } else {
      if(queryObject.PROJECTION.length === 0) {
        projectionString = ' * ';
        return;
      }
    }

    queryObject.PROJECTION.forEach(function (projectedField, i) {
      let relationMeta;
      let relation;
      let fieldName;

      if (i !== 0) projectionString += ", ";

      if(typeof projectedField === 'string') {
        relation = queryObject.RELATION_ID;
        relationMeta = factRelationMeta;
        fieldName = projectedField;
      } else { // {fieldName: 'Field3', Alias: 'Field3_XXXX', relation: 'r_relation1'}
        if (!projectedField.FIELD_NAME) {
          errorMessages.push(message.report('QUERY', 'INVALID_PROJECTION', 'E'));
          return;
        }
        fieldName = projectedField.FIELD_NAME;
        if(!projectedField.RELATION_ID || projectedField.RELATION_ID === queryObject.RELATION_ID) {
          relation = queryObject.RELATION_ID;
          relationMeta = factRelationMeta;
        } else {
          relation = projectedField.RELATION_ID;
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
      if (projectedField.ALIAS) projectionString += ' as ' + entityDB.pool.escapeId(projectedField.ALIAS);
    });

    projectionString += ' , ' + entityDB.pool.escapeId(queryObject.RELATION_ID) + '.' + entityDB.pool.escapeId('INSTANCE_GUID');
  }

  function __parseFilter() {
    if(!queryObject.FILTER) queryObject.FILTER = [];
    if(!Array.isArray(queryObject.FILTER)) {
      errorMessages.push(message.report('QUERY', 'INVALID_FILTER', 'E'));
      return;
    }
    queryObject.FILTER.forEach(function (selectOption, i) {
      if (!selectOption.FIELD_NAME) {
        errorMessages.push(message.report('QUERY', 'FILTER_MISS_FIELD_NAME', 'E'));
        return;
      }

      if (!selectOption.LOW) { return; } // If low value is not given, bypass.

      let relation;
      if(!selectOption.RELATION_ID || selectOption.RELATION_ID === queryObject.RELATION_ID) {
        relation = queryObject.RELATION_ID;
      } else {
        relation = selectOption.RELATION_ID;
        __putJoinRelation(relation);
      }

      const relationMeta = entityDB.getRelationMeta(relation);
      if (!relationMeta) {
        errorMessages.push(message.report('QUERY', 'INVALID_RELATION', 'E', queryObject.RELATION_ID));
        return;
      }
      const index = relationMeta.ATTRIBUTES.findIndex(function (attribute) {
        return attribute.ATTR_NAME === selectOption.FIELD_NAME
      });
      if (index === -1) {
        errorMessages.push(message.report('QUERY', 'INVALID_FIELD', 'E', selectOption.FIELD_NAME, relation));
        return;
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
            filterString += entityDB.pool.escapeId(relation) + '.' + entityDB.pool.escapeId(selectOption.FIELD_NAME)
              + " like "  + entityDB.pool.escape(selectOption.LOW);
          }
          break;
        default:
          errorMessages.push(message.report('QUERY', 'INVALID_OPERATOR', 'E', selectOption.OPERATOR))
      }
    });
  }

  function __putJoinRelation(relation) {
    if (relation === queryObject.RELATION_ID) return;
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
      if (!association) return;
      joinString += ' left join ' + entityDB.pool.escapeId(joinRelation) + ' on ';
      association.FIELDS_MAPPING.forEach(function (fieldsMapping, i) {
        if (i !== 0) joinString += ' and ';
        joinString += entityDB.pool.escapeId(queryObject.RELATION_ID) + '.' + entityDB.pool.escapeId(fieldsMapping.LEFT_FIELD) +
          ' = ' + entityDB.pool.escapeId(joinRelation) + '.' + entityDB.pool.escapeId(fieldsMapping.RIGHT_FIELD);
      })
    })
  }

  function __parseSort() {
    if (!queryObject.SORT) return;

    if(!Array.isArray(queryObject.SORT)) {
      errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
      return;
    } else {
      if(queryObject.SORT.length === 0) {
        return;
      }
    }

    queryObject.SORT.forEach(function (sortField, i) {
      if (i !== 0) sortString += ", ";

      let relationMeta;
      let relation;
      let fieldName;

      if(typeof sortField === 'string') {
        relation = queryObject.RELATION_ID;
        relationMeta = factRelationMeta;
        fieldName = sortField;
      } else { // {fieldName: 'Field3', relation: 'r_relation1', order: 'DESC'}
        if (!sortField.FIELD_NAME) {
          errorMessages.push(message.report('QUERY', 'INVALID_SORT', 'E'));
          return;
        }
        fieldName = sortField.FIELD_NAME;
        if(!sortField.RELATION_ID || sortField.RELATION_ID === queryObject.RELATION_ID) {
          relation = queryObject.RELATION_ID;
          relationMeta = factRelationMeta;
        } else {
          relation = sortField.RELATION_ID;
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

      sortField.ORDER && sortField.ORDER.toUpperCase() === 'DESC'?
        sortString += ' DESC' : sortString += ' ASC';
    });
  }
}


