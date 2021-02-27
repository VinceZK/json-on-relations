/**
 * Created by VinceZK on 06/29/18.
 */
const entityDB = require('../server/models/connections/sql_mdb.js');
const query = require('../server/models/query.js');

describe('query tests', function () {
  let queryObject =
    {
      ENTITY_ID: 'person',
      RELATION_ID: 'r_user',

      PROJECTION: [
        'USER_ID',
        'USER_NAME',
        'GIVEN_NAME',
        {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'},
        {FIELD_NAME: 'HEIGHT', RELATION_ID: 'person'}
      ],

      FILTER: [
        {
          FIELD_NAME: 'USER_ID',
          OPERATOR: 'BT',
          LOW: 'DH001',
          HIGH: 'DH006'
        },
        {
          FIELD_NAME: 'LANGUAGE',
          OPERATOR: 'EQ',
          RELATION_ID: 'r_personalization',
          LOW: 'ZH'
        }
      ],

      sort: []
    };

  it('should return query result', function(done){
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.should.containDeep([
        { USER_ID: 'DH001', USER_NAME: 'VINCEZK', GIVEN_NAME: 'Vincent', HEIGHT: 1.7,
          Company: 'DARKHOUSE', INSTANCE_GUID: '2FBE7490E10F11E8A90957FA46F2CECA' },
        { USER_ID: 'DH002', USER_NAME: 'Eleven', GIVEN_NAME: 'Eleven', HEIGHT: 1.64,
          Company: 'DARKHOUSE', INSTANCE_GUID: '430C8BB0E1C611E8877F9D5C9668A7A3' } ]);
      done();
    });
  });

  it('should report missing relation', function(done){
    delete queryObject.RELATION_ID;
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'MISS_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report relationship relation is not supported', function (done) {
    queryObject.RELATION_ID = 'rs_marriage';
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'RELATIONSHIP_RELATION_NOT_SUPPORTED',
        msgType: 'E'
      }]);
      done();
    })
  });

  it('should report invalid relation', function(done){
    queryObject.RELATION_ID = 'r_invalid_relation';
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid relation in projected field', function(done){
    queryObject.RELATION_ID = 'r_user';
    queryObject.PROJECTION[3].RELATION_ID = 'r_invalid_relation';
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid field in projection', function(done){
    queryObject.PROJECTION[0] = 'INVALID_FIELD';
    queryObject.PROJECTION[3].RELATION_ID = 'r_employee';
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_FIELD',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid filter', function(done){
    queryObject.PROJECTION[0] = 'USER_ID';
    queryObject.FILTER = 'xxxxxx';
    query.run(queryObject, function (errs) {
      should(errs).containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_FILTER',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid field in the filter', function(done){
    queryObject.FILTER = [
      {
        FIELD_NAME: 'INVALID_FIELD',
        OPERATOR: 'BT',
        LOW: 'DH002',
        HIGH: 'DH006'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_FIELD',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid relation in the filter', function(done){
    queryObject.FILTER = [
      {
        FIELD_NAME: 'LANGUAGE',
        OPERATOR: 'EQ',
        RELATION_ID: 'r_personalization1',
        LOW: 'ZH'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid operator in the filter', function(done){
    queryObject.FILTER = [
      {
        FIELD_NAME: 'LANGUAGE',
        OPERATOR: 'AA',
        RELATION_ID: 'r_personalization',
        LOW: 'ZH'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_OPERATOR',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should filter on attributes of entity relation', function(done){
    queryObject.FILTER = [
      {
        FIELD_NAME: 'HEIGHT',
        OPERATOR: 'GT',
        RELATION_ID: 'person',
        LOW: 1.65
      }
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.should.not.containDeep([
        { USER_ID: 'DH002', USER_NAME: 'Eleven', GIVEN_NAME: 'Eleven', HEIGHT: 1.64,
          Company: 'DARKHOUSE', INSTANCE_GUID: '430C8BB0E1C611E8877F9D5C9668A7A3' }]);
      done();
    });
  });

  it('should report INVALID_SORT', function(done){
    queryObject.FILTER = [];
    queryObject.SORT = [
      {
        RELATION_ID: 'r_personalization'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_SORT',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report INVALID_RELATION', function(done){
    queryObject.FILTER = [];
    queryObject.SORT = [
      {
        FIELD_NAME: 'LANGUAGE',
        RELATION_ID: 'r_personalization1'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report INVALID_FIELD', function(done){
    queryObject.FILTER = [];
    queryObject.SORT = [
      {
        FIELD_NAME: 'LANGUAGE1',
        RELATION_ID: 'r_personalization'
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_FIELD',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should return query result with sorting on attribute of another relation', function(done){
    queryObject.FILTER = [];
    queryObject.SORT = [
      {
        FIELD_NAME: 'LANGUAGE',
        RELATION_ID: 'r_personalization',
        ORDER: 'DESC'
      }
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      console.log(rows);
      done();
    });
  });

  it('should return query result with sorting on attribute of master relation', function(done){
    queryObject.FILTER = [];
    queryObject.SORT = [
      {
        FIELD_NAME: 'HEIGHT',
        RELATION_ID: 'person',
        ORDER: 'ASC'
      }
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      console.log(rows);
      done();
    });
  });

  it('should return query result with address', function(done){
    queryObject.PROJECTION = [
      'USER_ID',
      'USER_NAME',
      'GIVEN_NAME',
      {FIELD_NAME: 'ADDRESS_VALUE', ALIAS: 'Address', RELATION_ID: 'r_address'},
      {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'},
      {FIELD_NAME: 'HEIGHT', RELATION_ID: 'person'}
    ];
    queryObject.FILTER = [
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH001'
      }
    ];
    queryObject.SORT = [
      {
        FIELD_NAME: 'HEIGHT',
        RELATION_ID: 'person',
        ORDER: 'ASC'
      }
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.length.should.eql(2);
      console.log(rows);
      done();
    });
  });

  it('should return query result with distinct result', function(done){
    queryObject.DISTINCT = true;
    queryObject.PROJECTION = [
      'USER_ID',
      'USER_NAME',
      'GIVEN_NAME',
      {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'},
      {FIELD_NAME: 'HEIGHT', RELATION_ID: 'person'}
    ];
    queryObject.FILTER = [
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH001'
      },
      {
        FIELD_NAME: 'COUNTRY',
        RELATION_ID: 'r_address',
        OPERATOR: 'EQ',
        LOW: 'China'
      }
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.length.should.eql(1);
      console.log(rows);
      done();
    });
  });

  it('should return query result with multi-values in the same filter field', function(done){
    queryObject.PROJECTION = [
      'USER_ID',
      'USER_NAME',
      'GIVEN_NAME',
      {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'},
      {FIELD_NAME: 'HEIGHT', RELATION_ID: 'person'}
    ];
    queryObject.FILTER = [
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH001'
      },
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH002'
      },
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.length.should.eql(2);
      console.log(rows);
      done();
    });
  });

  it('should return query result with the same filter field, different relation id', function(done){
    queryObject.PROJECTION = [
      'USER_ID',
      'USER_NAME',
      'GIVEN_NAME',
      {FIELD_NAME: 'COMPANY_ID', ALIAS: 'Company', RELATION_ID: 'r_employee'},
      {FIELD_NAME: 'HEIGHT', RELATION_ID: 'person'}
    ];
    queryObject.FILTER = [
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH001'
      },
      {
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH002'
      },
      {
        RELATION_ID: 'r_personalization',
        FIELD_NAME: 'USER_ID',
        OPERATOR: 'EQ',
        LOW: 'DH001'
      },
    ];
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      rows.length.should.eql(1);
      console.log(rows);
      done();
    });
  });


  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  })
});
