/**
 * Created by VinceZK on 10/10/14.
 */
const entityDB = require('../server/models/connections/mysql_mdb.js');
const _ = require('underscore');

describe('mysql connections tests', function () {

  before('#loadEntitye(person)', function (done) {
    entityDB.loadEntity('person', done);
  });

  /**
   * { ENTITY_ID: 'person',
   *   ENTITY_DESC: 'People Entity',
   *   ATTRIBUTES:[
   *     RowDataPacket {
   *       ATTR_GUID: '13976E0B39AEBAFBDC35764518DB72D9', RELATION_ID: 'person', ATTR_NAME: 'HEIGHT', ATTR_DESC: null,
   *       DATA_ELEMENT: null, DATA_TYPE: 2, DATA_LENGTH: null, SEARCHABLE: 0, NOT_NULL: 0, UNIQUE: 0, FINALIZE: 0,
   *       AUTO_INCREMENT: 0, IS_MULTI_VALUE: 0 }
   *   ]
   *   ROLES:
   *   [
   *     { ROLE_ID: 'system_user',
   *       ROLE_DESC: 'System user for login',
   *       RELATIONS: [{RELATION_ID: 'r_address', CARDINALITY: '[0..n]'},
   *                   {RELATION_ID: 'r_email', CARDINALITY: '[1..n]'},
   *                   {RELATION_ID: 'r_user', CARDINALITY: '[1..1]'}],
   *       RELATIONSHIPS: [{ RELATIONSHIP_ID: 'user_role',  RELATIONSHIP_DESC: 'A system user has multiple use roles',
   *                         VALID_PERIOD: 3162240000, ATTRIBUTES: [], UNIQUE_ATTRIBUTE_INDICES: [], ATTRIBUTE_INDICES: [],
   *                         INVOLVES: [RowDataPacket { ROLE_ID: 'system_user', CARDINALITY: '[1..1]' },
   *                                    RowDataPacket { ROLE_ID: 'system_role', CARDINALITY: '[1..n]' } ]}]
   *     }
   *   ]
   * }
   *
   *[{
   *   RELATION_ID: 'r_user',
   *   RELATION_DESC: 'System Logon User',
   *   VERSION_NO: 1,
   *   ATTRIBUTES: [
   *     RowDataPacket {
   *       ATTR_GUID: '13976E0B39AEBAFBDC35764518DB72D9', RELATION_ID: 'person', ATTR_NAME: 'HEIGHT', ATTR_DESC: null,
   *       DATA_ELEMENT: null, DATA_TYPE: 2, DATA_LENGTH: null, SEARCHABLE: 0, NOT_NULL: 0, UNIQUE: 0, FINALIZE: 0,
   *       AUTO_INCREMENT: 0, IS_MULTI_VALUE: 0 }
   *   ]
   *   ASSOCIATIONS: [
   *     { RIGHT_RELATION_ID: assoc.RIGHT_RELATION_ID,
           CARDINALITY: assoc.CARDINALITY,
           FOREIGN_KEY_CHECK: assoc.FOREIGN_KEY_CHECK,
           FIELDS_MAPPING: [{LEFT_FIELD: assoc.LEFT_FIELD, RIGHT_FIELD: assoc.RIGHT_FIELD}]
         }
       ]
   * }]
   */
  describe('#loadEntitye(person)', function () {
    it('should have the person entity', function () {
      // console.log(entityDB.getEntityMeta('person').ROLES[1].RELATIONSHIPS[0]);
      entityDB.entities.length.should.eql(1);
      entityDB.getEntityMeta('person').ENTITY_ID.should.eql('person');
      entityDB.getEntityMeta('person').ATTRIBUTES.should.containDeep([{ATTR_NAME: 'HEIGHT'}]);
      entityDB.getEntityMeta('person').ROLES.should.containDeep([{ROLE_ID: 'employee'}, {ROLE_ID: 'system_user'}]);
      entityDB.getEntityMeta('person').ROLES.should.containDeep(
        [{ROLE_ID: 'system_user',
          ROLE_DESC: 'System user for login',
          RELATIONS: [{ RELATION_ID: 'r_address', CARDINALITY: '[0..n]' },
            { RELATION_ID: 'r_email', CARDINALITY: '[1..n]' },
            { RELATION_ID: 'r_user', CARDINALITY: '[1..1]' }]}]);
      entityDB.getEntityMeta('person').ROLES.should.containDeep( [{RELATIONSHIPS:
        [{ RELATIONSHIP_ID: 'rs_user_role',  RELATIONSHIP_DESC: 'A system user has multiple system roles',
          VALID_PERIOD: 3162240000, ATTRIBUTES:[{ATTR_NAME: 'SYNCED'}],ATTRIBUTE_INDICES:[{ATTR_NAME: 'SYNCED',}],
          INVOLVES: [ { ROLE_ID: 'system_user', CARDINALITY: '[1..n]' },
                      { ROLE_ID: 'system_role', CARDINALITY: '[1..n]' } ]}]}]);
    });

    it('should have the relations', function(){
      entityDB.relations.should.containDeep([{RELATION_ID: 'r_employee'},{RELATION_ID: 'r_user'}]);
      entityDB.getRelationMeta('r_user')
        .ASSOCIATIONS.should.containDeep([{ RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 0,
        FIELDS_MAPPING: [ { LEFT_FIELD: 'USER_ID', RIGHT_FIELD: 'USER_ID' } ] }]);
      entityDB.getRelationMeta('r_employee')
        .ASSOCIATIONS.should.containDeep([{ RIGHT_RELATION_ID: 'r_company', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 1,
        FIELDS_MAPPING: [ { LEFT_FIELD: 'COMPANY_ID', RIGHT_FIELD: 'COMPANY_ID' } ] }]);
    })
  });

  describe('#executeSQL()', function () {
    it('should return tenant "darkhouse.com"', function (done) {
      let selectSQL = "SELECT * FROM TENANTS WHERE TENANT_DOMAIN = 'darkhouse.com'";
      entityDB.executeSQL(selectSQL, function (err, rows) {
        if (err) throw err;
        rows[0].TENANT_DOMAIN.should.equal('darkhouse.com');
        done();
      })
    })
  });

  describe('#doUpdatesParallel()', function () {
    let recGuid = '305635FFA99B4CA2800ED393F746227F';
    it("should insert an entry in both ENTITY_INSTANCES and UIX_GUID", function (done) {
      let insertSQLs = [];
      let insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
        + " 'blog', "
        + entityDB.pool.escape(recGuid)
        + ", null ,"
        + "'1')";
      insertSQLs.push(_.clone(insertSQL));
      insertSQL = "INSERT INTO NIX_6C357AF2BE7B3FC9D4EB39424D2F541B (`VALUE`,`INSTANCE_GUID`) VALUES ('0', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(_.clone(insertSQL));

      entityDB.doUpdatesParallel(insertSQLs, function (err, results) {
        should(err).eql(null);
        results.length.should.equal(2);
        done();
      });
    });

    it("should return duplicate error", function (done) {
      let insertSQLs = [];
      let insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
        + " 'blog', "
        + entityDB.pool.escape(recGuid)
        + ", null ,"
        + "'1')";
      insertSQLs.push(_.clone(insertSQL));
      insertSQL = "INSERT INTO NIX_6C357AF2BE7B3FC9D4EB39424D2F541B (`VALUE`,`INSTANCE_GUID`) VALUES ('0', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(_.clone(insertSQL));

      entityDB.doUpdatesParallel(insertSQLs, function (err, results) {
        should(err).not.eql(null);
        err.code.should.equal('ER_DUP_ENTRY');
        done();
      });
    });

    it("should update DEL flag to 1", function (done) {
      let updateSQLs = [];
      let updateSQL = "UPDATE ENTITY_INSTANCES SET DEL ='1' " +
        "WHERE ENTITY_ID ='blog' AND INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      updateSQLs.push(_.clone(updateSQL));

      entityDB.doUpdatesParallel(updateSQLs, function (err, results) {
        should(err).eql(null);
        results.length.should.equal(1);
        done();
      });
    });

    it("should have the ENTITY_INSTANCES.DEL = 1", function (done) {
      let selectSQL = "SELECT * FROM ENTITY_INSTANCES WHERE"
        + " ENTITY_ID = 'blog' AND INSTANCE_GUID = " + entityDB.pool.escape(recGuid);

      entityDB.executeSQL(selectSQL, function (err, rows) {
        if (err) throw err;
        rows[0].DEL.should.equal(1);
        done();
      })
    });

    it("should delete the entry in both the 2 tables", function (done) {
      let delSQLs = [];
      let delSQL = "DELETE FROM ENTITY_INSTANCES " +
        "WHERE ENTITY_ID ='blog' and INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      delSQLs.push(_.clone(delSQL));
      delSQL = "DELETE FROM NIX_6C357AF2BE7B3FC9D4EB39424D2F541B " +
        "WHERE INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      delSQLs.push(_.clone(delSQL));

      entityDB.doUpdatesParallel(delSQLs, function (err, results) {
        should(err).eql(null);
        results.length.should.equal(2);
        done();
      });
    })
  });

  describe('#doUpdatesSerious()', function () {
    let recGuid = '93D75A540EF04ACF91D7A89BE05A79DF';
    it("should insert an entry first in ENTITY_INSTANCES, then in UIX_GUID", function (done) {
      let insertSQLs = [];
      let insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
        + " 'blog', "
        + entityDB.pool.escape(recGuid)
        + ", null ,"
        + "'1')";
      insertSQLs.push(_.clone(insertSQL));
      insertSQL = "INSERT INTO NIX_6C357AF2BE7B3FC9D4EB39424D2F541B (`VALUE`, `INSTANCE_GUID`) VALUES ('0', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(_.clone(insertSQL));

      entityDB.doUpdatesSeries(insertSQLs, function (err, results) {
        should(err).eql(null);
        results.length.should.equal(2);
        done();
      });
    });

    it("should delete the entry in both the 2 tables", function (done) {
      let delSQLs = [];
      let delSQL = "DELETE FROM ENTITY_INSTANCES " +
        "WHERE ENTITY_ID ='blog' and INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      delSQLs.push(_.clone(delSQL));
      delSQL = "DELETE FROM NIX_6C357AF2BE7B3FC9D4EB39424D2F541B " +
        "WHERE INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      delSQLs.push(_.clone(delSQL));

      entityDB.doUpdatesParallel(delSQLs, function (err, results) {
        should(err).eql(null);
        results.length.should.equal(2);
        done();
      });
    });
  });

  describe('#loadEntities()', function () {
    it('should change the description of person entity', function (done) {
      let updateSQL = "update ENTITY set ENTITY_DESC = 'People Entity 1' where ENTITY_ID = 'person'";
      entityDB.doUpdatesParallel([updateSQL], function (err, results) {
        should(err).eql(null);
        results.length.should.equal(1);
        done();
      })
    });

    it('should load 2 entities', function (done) {
      entityDB.loadEntities(['person', 'system_role'],done);
    });

    it('should have 2 entities and 5 relations', function () {
      entityDB.entities.should.containDeep([{ENTITY_ID: 'person'},{ENTITY_ID: 'system_role'}]);
      entityDB.relations.should.containDeep([{RELATION_ID: 'r_employee'},{RELATION_ID: 'r_user'},
        {RELATION_ID: 'r_address'}, {RELATION_ID: 'r_email'}, {RELATION_ID: 'r_role'}])
    });

    it('should has person entity with new description', function () {
      entityDB.entities.find(function (entity) {
        return entity.ENTITY_ID === 'person';
      }).ENTITY_DESC.should.eql('People Entity 1');
    });

    it('should change the description back of person entity', function (done) {
      let updateSQL = "update ENTITY set ENTITY_DESC = 'People Entity' where ENTITY_ID = 'person'";
      entityDB.doUpdatesParallel([updateSQL], function (err, results) {
        should(err).eql(null);
        done();
      })
    });
  });

  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  })
});
