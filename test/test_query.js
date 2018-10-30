/**
 * Created by VinceZK on 06/29/18.
 */
const entityDB = require('../server/models/connections/mysql_mdb.js');
const query = require('../server/models/query.js');

describe('query tests', function () {
  before(function (done) {
    entityDB.loadEntity('person', done);
  });

  let queryObject =
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
    };

  it('should return query result', function(done){
    query.run(queryObject, function (errs, rows) {
      should(errs).eql(null);
      console.log(rows);
      done();
    });
  });

  it('should report missing relation', function(done){
    delete queryObject.relation;
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'MISS_RELATION',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid relation', function(done){
    queryObject.relation = 'r_invalid_relation';
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
    queryObject.relation = 'r_user';
    queryObject.projection[3].relation = 'r_invalid_relation';
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
    queryObject.projection[0] = 'INVALID_FIELD';
    queryObject.projection[3].relation = 'r_employee';
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
    queryObject.projection[0] = 'USER_ID';
    queryObject.filter = 'xxxxxx';
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'INVALID_FILTER',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid field in the filter', function(done){
    queryObject.filter = [
      {
        fieldName: 'INVALID_FIELD',
        operator: 'BT',
        low: 'DH002',
        high: 'DH006'
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

  it('should report missing low value', function(done){
    queryObject.filter = [
      {
        fieldName: 'USER_ID',
      }
    ];
    query.run(queryObject, function (errs) {
      errs.should.containDeep([{
        msgCat: 'QUERY',
        msgName: 'FILTER_MISS_LOW_VALUE',
        msgType: 'E'
      }]);
      done();
    });
  });

  it('should report invalid relation in the filter', function(done){
    queryObject.filter = [
      {
        fieldName: 'LANGUAGE',
        operator: 'EQ',
        relation: 'r_personalization1',
        low: 'ZH'
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
    queryObject.filter = [
      {
        fieldName: 'LANGUAGE',
        operator: 'AA',
        relation: 'r_personalization',
        low: 'ZH'
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

  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  })
});
