/**
 * Created by VinceZK on 10/10/14.
 */
const entityDB = require('../server/models/connections/sql_mdb.js');
const _ = require('underscore');

describe('mysql connections tests', function () {

  before('#loadEntitye(person)', function (done) {
    entityDB.setConnPool('mysql', { //Default connection pool
      connectionLimit : 10,
      host: 'localhost',
      user: 'nodejs',
      password: 'nodejs',
      database: 'MDB',
      createDatabaseTable: true,
      multipleStatements: true,
      dateStrings: true,
      port: 3306
    });
    done();
  });

  /**
   * { ENTITY_ID: 'person',
   *   ENTITY_DESC: 'People Entity',
   *   ROLES:
   *   [
   *     { ROLE_ID: 'system_user',
   *       ROLE_DESC: 'System user for login',
   *       CONDITIONAL_ATTR: 'SYSTEM_ACCESS',
   *       CONDITIONAL_VALUE: 'portal',
   *       RELATIONS: [{RELATION_ID: 'r_personalization', CARDINALITY: '[0..1]'},
   *                   {RELATION_ID: 'r_user', CARDINALITY: '[1..1]'}],
   *       RELATIONSHIPS: [{ RELATIONSHIP_ID: 'rs_user_role',
   *                         RELATIONSHIP_DESC: 'A system user has multiple use roles',
   *                         VALID_PERIOD: 0,
   *                         INVOLVES: [RowDataPacket { ROLE_ID: 'system_user', CARDINALITY: '[1..1]' },
   *                                    RowDataPacket { ROLE_ID: 'system_role', CARDINALITY: '[1..n]' } ]}]
   *     }
   *   ]
   * }
   *
   *[{RELATION_ID: 'person',
   *  RELATION_DESC: 'People Entity Default Relation',
   *  VERSION_NO: 1,
   *  ATTRIBUTES: []
   * },
   * {
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
   *       CARDINALITY: assoc.CARDINALITY,
   *       FOREIGN_KEY_CHECK: assoc.FOREIGN_KEY_CHECK,
   *       FIELDS_MAPPING: [{LEFT_FIELD: assoc.LEFT_FIELD, RIGHT_FIELD: assoc.RIGHT_FIELD}]
   *     }
   *   ]
   * }]
   */
  describe('#loadEntity(person)', function () {
    it('should have the person entity', function (done) {
      entityDB.entities.length.should.eql(0);
      entityDB.getEntityMeta('person', function (err, personEntity) {
        should(err).eql(null);
        personEntity.ENTITY_ID.should.eql('person');
        personEntity.ROLES.should.containDeep([
          {
            ROLE_ID: 'system_user',
            ROLE_DESC: 'System user for login',
            CONDITIONAL_ATTR: 'SYSTEM_ACCESS',
            CONDITIONAL_VALUE: 'PORTAL',
            RELATIONS: [
              { RELATION_ID: 'r_personalization', CARDINALITY: '[0..1]' },
              { RELATION_ID: 'r_user', CARDINALITY: '[1..1]' }
            ],
            RELATIONSHIPS: [
              {
                RELATIONSHIP_ID: 'rs_user_role',
                VALID_PERIOD: 0,
                SINGLETON: null,
                INVOLVES: [
                  { ROLE_ID: 'system_role', CARDINALITY: '[1..n]' },
                  { ROLE_ID: 'system_user', CARDINALITY: '[1..n]' }
                ]
              }
            ]
          },
          { ROLE_ID: 'employee',
            ROLE_DESC: 'Company Employee',
            CONDITIONAL_ATTR: 'TYPE',
            CONDITIONAL_VALUE: 'employee',
            RELATIONS: [
              { RELATION_ID: 'r_address', CARDINALITY: '[0..n]' },
              { RELATION_ID: 'r_email', CARDINALITY: '[1..n]' },
              { RELATION_ID: 'r_employee', CARDINALITY: '[1..1]' }]},
          ]);
        done();
      });
    });

    it('should have the relations', function(done){
      entityDB.relations.should.containDeep([{RELATION_ID: 'person'},{RELATION_ID: 'rs_user_role'},
                                             {RELATION_ID: 'r_employee'},{RELATION_ID: 'r_user'}]);
      entityDB.getRelationMeta('person', function (err, personRelation) {
        should(err).eql(null);
        personRelation.ATTRIBUTES.should.containDeep([{ATTR_NAME: 'HEIGHT'},{ATTR_NAME: 'HOBBY'}]);
        done();
      });
    });

    it('should have the relation rs_user_role', function (done) {
      entityDB.getRelationMeta('rs_user_role', function (err, relation) {
        should(err).eql(null);
        relation.ATTRIBUTES.should.containDeep([{ATTR_NAME: 'SYNCED'}]);
        done();
      })
    });

    it('should have the relation r_user', function (done) {
      entityDB.getRelationMeta('r_user', function (err, relation) {
        should(err).eql(null);
        relation.ASSOCIATIONS.should.containDeep(
          [{ RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[0..1]', FOREIGN_KEY_CHECK: 0,
            FIELDS_MAPPING: [ { LEFT_FIELD: 'USER_ID', RIGHT_FIELD: 'USER_ID' } ] }]);
        done();
      })
    });

    it('should have the relation r_employee', function (done) {
      entityDB.getRelationMeta('r_employee', function (err, relation) {
        should(err).eql(null);
        relation.ASSOCIATIONS.should.containDeep(
          [{ RIGHT_RELATION_ID: 'r_company', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 1,
            FIELDS_MAPPING: [ { LEFT_FIELD: 'COMPANY_ID', RIGHT_FIELD: 'COMPANY_ID' } ] }]);
        done();
      })
    });
  });

  describe('#createDBTable', function () {
    let relation = {RELATION_ID: 'r_test001'};
    relation.ATTRIBUTES = [
      { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 100, DECIMAL: 0, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 1,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 1,  },
      { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD4', DATA_TYPE: 4, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 23, DECIMAL: 2, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD5', DATA_TYPE: 5, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: 'C741889F45D74E16821EF50A5DC94BE5', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD6', DATA_TYPE: 6, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: '87B2AFE983C34C628A4D271280C2642C', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD7', DATA_TYPE: 7, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0,  },
      { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test001',
        ATTR_NAME: 'FIELD8', DATA_TYPE: 8, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0,  }
    ];

    it('should create a DB table "r_test001"', function (done) {
      entityDB.createDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          entityDB.executeSQL("drop table `r_test001`", done);
        });
      });
    });

    it('should not create a DB table "test001"', function (done) {
      relation.RELATION_ID = 'test001';
      entityDB.createDBTable(relation, function (err) {
        should(err).eql("Entity or Relationship table doesn't have primary key other than INSTANCE_GUID");
        done();
      });
    });

    it('should create a DB table "test001"', function (done) {
      relation.RELATION_ID = 'test001';
      relation.ATTRIBUTES[1].PRIMARY_KEY = 0;
      relation.ATTRIBUTES[1].AUTO_INCREMENT = 0;
      entityDB.createDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          entityDB.executeSQL("drop table `test001`", done);
        });
      });
    });

    it('should create a DB table "rs_test001"', function (done) {
      relation.RELATION_ID = 'rs_test001';
      relation.ATTRIBUTES[1].PRIMARY_KEY = 0;
      relation.ATTRIBUTES[1].AUTO_INCREMENT = 0;
      entityDB.createDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          entityDB.executeSQL("drop table `rs_test001`", done);
        });
      });
    });

    it('should create a DB table "r_test001" with data elements', function (done) {
      relation.RELATION_ID = 'r_test001';
      relation.ATTRIBUTES[1].PRIMARY_KEY = 1;
      relation.ATTRIBUTES[1].AUTO_INCREMENT = 1;
      const relation2 = {
        RELATION_ID : 'r_test001',
        ATTRIBUTES : [
          { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD1', PRIMARY_KEY: 0, DATA_ELEMENT: 'DESCRIPTION_SHORT'},
          { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD2', PRIMARY_KEY: 1, DATA_ELEMENT: 'INTEGER', AUTO_INCREMENT: 1},
          { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD3', PRIMARY_KEY: 0, DATA_ELEMENT: 'BOOLEAN'},
          { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD4', PRIMARY_KEY: 0, DATA_ELEMENT: 'AMOUNT'},
          { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD5', PRIMARY_KEY: 0, DATA_ELEMENT: 'DESCRIPTION_UNLIMIT'},
          { ATTR_GUID: 'C741889F45D74E16821EF50A5DC94BE5', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD6', PRIMARY_KEY: 0, DATA_ELEMENT: 'BINARY'},
          { ATTR_GUID: '87B2AFE983C34C628A4D271280C2642C', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD7', PRIMARY_KEY: 0, DATA_ELEMENT: 'DATE' },
          { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test002',
            ATTR_NAME: 'FIELD8', PRIMARY_KEY: 0, DATA_ELEMENT: 'TIMESTAMP'}]
      };
      entityDB.createDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          entityDB.executeSQL("drop table `r_test001`", done);
        });
      });
    });

    it('should create a DB table "r_test001" with data elements and data domains', function (done) {
      relation.RELATION_ID = 'r_test001';
      relation.ATTRIBUTES[1].PRIMARY_KEY = 1;
      relation.ATTRIBUTES[1].AUTO_INCREMENT = 1;
      relation.ATTRIBUTES[0].DATA_LENGTH = 64;
      const relation2 = {
        RELATION_ID : 'r_test001',
        ATTRIBUTES : [
          { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD1', PRIMARY_KEY: 0, DATA_ELEMENT: 'ROLE_NAME'},
          { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD2', PRIMARY_KEY: 1, DATA_ELEMENT: 'VERSION_NO', AUTO_INCREMENT: 1},
          { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD3', PRIMARY_KEY: 0, DATA_ELEMENT: 'BOOLEAN'},
          { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD4', PRIMARY_KEY: 0, DATA_ELEMENT: 'AMOUNT_LC'},
          { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD5', PRIMARY_KEY: 0, DATA_ELEMENT: 'TEXT'},
          { ATTR_GUID: 'C741889F45D74E16821EF50A5DC94BE5', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD6', PRIMARY_KEY: 0, DATA_ELEMENT: 'BINARY'},
          { ATTR_GUID: '87B2AFE983C34C628A4D271280C2642C', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD7', PRIMARY_KEY: 0, DATA_ELEMENT: 'EFFECTIVE_DATE' },
          { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD8', PRIMARY_KEY: 0, DATA_ELEMENT: 'CREATE_TIME'}]
      };
      entityDB.createDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          result.should.containDeep(
            {
              tableExists: true,
              attributesOnlyInRelation: [],
              attributesOnlyInTable: [],
              changedAttributes: [
                {ATTR_NAME: 'FIELD2', DIFFERENCE: 'Integer unsigned or not is different with DB table'}
              ]
            });
          entityDB.executeSQL("drop table `r_test001`", done);
        });
      });
    });

    it('should return the expected check result', function (done) {
      relation.ATTRIBUTES[1].PRIMARY_KEY = 0;
      relation.ATTRIBUTES[1].AUTO_INCREMENT = 0;
      relation.ATTRIBUTES[0].DATA_LENGTH = 100;
      const relation2 = {
        RELATION_ID : 'r_test001',
        ATTRIBUTES : [
          { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD1', PRIMARY_KEY: 0, DATA_ELEMENT: 'ROLE_NAME'},
          { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD2', PRIMARY_KEY: 1, DATA_ELEMENT: 'VERSION_NO', AUTO_INCREMENT: 1},
          { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD3', PRIMARY_KEY: 0, DATA_ELEMENT: 'BOOLEAN'},
          { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD4', DATA_TYPE: 4, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 22, DECIMAL: 3, AUTO_INCREMENT: 0,  },
          { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD5', PRIMARY_KEY: 0, DATA_ELEMENT: 'TEXT'},
          { ATTR_GUID: '93D75A540EF04ACF91D7A89BE05A79DF', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELDX', PRIMARY_KEY: 0, DATA_ELEMENT: 'DATE'},
          { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test001',
            ATTR_NAME: 'FIELD8', DATA_TYPE: 8, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 }]
      };
      entityDB.createDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          result.should.containDeep(
            {
              tableExists: true,
              attributesOnlyInRelation: [ 'FIELD6', 'FIELD7' ],
              attributesOnlyInTable: [ 'FIELDX' ],
              changedAttributes: [
                { ATTR_NAME: 'FIELD1',
                  DIFFERENCE: 'Character length 100 is different with the DB data length 64' },
                { ATTR_NAME: 'FIELD2',
                  DIFFERENCE: 'Integer unsigned or not is different with DB table' },
                { ATTR_NAME: 'FIELD2',
                  DIFFERENCE: 'Primary key is still checked in DB' },
                { ATTR_NAME: 'FIELD4',
                  DIFFERENCE: 'Decimal (23,2) is different with the DB decimal (22,3)' }
              ]
            });
          entityDB.executeSQL("drop table `r_test001`", done);
        });
      });
    })
  });

  describe('#syncDBTable()', function () {
    let relation = {RELATION_ID: 'r_test002'};
    relation.ATTRIBUTES = [
      { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD1', DATA_TYPE: 2, PRIMARY_KEY: 1,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD2', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD4', DATA_TYPE: 4, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 23, DECIMAL: 2, AUTO_INCREMENT: 0 },
      { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD5', DATA_TYPE: 5, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: 'C741889F45D74E16821EF50A5DC94BE5', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD6', DATA_TYPE: 6, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: '87B2AFE983C34C628A4D271280C2642C', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD7', DATA_TYPE: 7, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
      { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test002',
        ATTR_NAME: 'FIELD8', DATA_TYPE: 8, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
        DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 }
    ];

    it('should create a DB table "r_test002"', function (done) {
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        done();
      });
    });

    it('should change the length of FIELD2', function (done) {
      relation.ATTRIBUTES[1].DATA_LENGTH = 40;
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should change the length and decimal place of FIELD4', function (done) {
      relation.ATTRIBUTES[3].DATA_LENGTH = 17;
      relation.ATTRIBUTES[3].DECIMAL = 3;
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should change the data type of FIELD5 from string to char100', function (done) {
      relation.ATTRIBUTES[4].DATA_TYPE = 1;
      relation.ATTRIBUTES[4].DATA_LENGTH = 100;
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should add FIELD2 as the primary key', function (done) {
      relation.ATTRIBUTES[1].PRIMARY_KEY = true;
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      })
    });

    it('should remove FIELD2 as the primary key and set FIELD1 auto increment', function (done) {
      relation.ATTRIBUTES[1].PRIMARY_KEY = false;
      relation.ATTRIBUTES[0].AUTO_INCREMENT = true;
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      })
    });

    it('should remove FIELD8, FIELD4, FIELD2 from the table', function (done) {
      relation.ATTRIBUTES.splice(7, 1); // datetime
      relation.ATTRIBUTES.splice(3, 1); // decimal
      relation.ATTRIBUTES.splice(1, 1); // char
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      })
    });

    it('should add FIELD8, FIELD4, FIELD2 to the table', function (done) {
      relation.ATTRIBUTES.push(
        { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test002',
          ATTR_NAME: 'FIELD8', DATA_TYPE: 8, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 });
      relation.ATTRIBUTES.push(
        { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test002',
          ATTR_NAME: 'FIELD4', DATA_TYPE: 4, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 17, DECIMAL: 3, AUTO_INCREMENT: 0 });
      relation.ATTRIBUTES.push(
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test002',
          ATTR_NAME: 'FIELD2', DATA_TYPE: 1, PRIMARY_KEY: 1,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0 });
      entityDB.syncDBTable(relation, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      })
    });

    const relation2 = {
      RELATION_ID: 'r_test002',
      ATTRIBUTES :[
        { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD1',
          DATA_TYPE: 2, PRIMARY_KEY: 1, DATA_ELEMENT: null, DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: true },
        { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD3',
          DATA_TYPE: 3, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
        { ATTR_GUID: 'AA7A0438F38D46B9B4D5ABBE5586F0AE', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD5',
          DATA_TYPE: 1, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 100, DECIMAL: 0, AUTO_INCREMENT: 0 },
        { ATTR_GUID: 'C741889F45D74E16821EF50A5DC94BE5', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD6',
          DATA_TYPE: 6, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
        { ATTR_GUID: '87B2AFE983C34C628A4D271280C2642C', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD7',
          DATA_TYPE: 7, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
        { ATTR_GUID: '4E298523E4744E95A8BB4333086AE0B9', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD8',
          DATA_TYPE: 8, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0 },
        { ATTR_GUID: 'C476D9E702FA4C8EB3E666D3F38658FC', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD4',
          DATA_TYPE: 4, PRIMARY_KEY: 0, DATA_ELEMENT: null, DATA_LENGTH: 23, DECIMAL: 2, AUTO_INCREMENT: 0 },
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD2',
          DATA_TYPE: 1, PRIMARY_KEY: 1, DATA_ELEMENT: null, DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0 } ] };

    it('should change the length of FIELD2 using DTEL ROLE_NAME', function (done) {
      relation2.ATTRIBUTES[7].DATA_ELEMENT = 'ROLE_NAME';
      entityDB.syncDBTable(relation2, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should change FIELD5 from CHAR100 to TEXT using DTEL TEXT', function (done) {
      relation2.ATTRIBUTES[2].DATA_ELEMENT = 'TEXT';
      entityDB.syncDBTable(relation2, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should change the length and decimal of FIELD4 using DTEL AMOUNT_LC', function (done) {
      relation2.ATTRIBUTES[6].DATA_ELEMENT = 'AMOUNT_LC';
      entityDB.syncDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          result.should.containDeep(
            { tableExists: true,
              attributesOnlyInRelation: [],
              attributesOnlyInTable: [],
              changedAttributes: [
                { ATTR_NAME: 'FIELD5',
                  DIFFERENCE: 'Data type \'varchar\' is different with the DB data type \'text\'' },
                { ATTR_NAME: 'FIELD4',
                  DIFFERENCE: 'Decimal (17,3) is different with the DB decimal (23,2)' },
                { ATTR_NAME: 'FIELD2',
                  DIFFERENCE:
                    'Character length 32 is different with the DB data length 64' } ] });
          done();
        });
      })
    });

    it('should remove FILED2', function (done) {
      relation2.ATTRIBUTES.splice(7, 1); // FIELD2
      entityDB.syncDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          result.should.containDeep({attributesOnlyInRelation: [ 'FIELD2' ]});
          done();
        });
      })
    });

    it('should add back FILED2', function (done) {
      relation2.ATTRIBUTES.push(
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_test002', ATTR_NAME: 'FIELD2',
          PRIMARY_KEY: 1, DATA_ELEMENT: 'ROLE_NAME' });
      entityDB.syncDBTable(relation2, function (err) {
        should(err).eql(null);
        entityDB.checkDBConsistency(relation, function (err, result) {
          should(err).eql(null);
          result.should.containDeep({
            attributesOnlyInRelation: [],
            changedAttributes:
              [ { ATTR_NAME: 'FIELD2',
                  DIFFERENCE: 'Character length 32 is different with the DB data length 64' } ]
          });
          done();
        });
      })
    });
    it('should drop the DB table "test002"', function (done) {
      entityDB.executeSQL("drop table `r_test002`", done);
    })
  });

  describe('#executeSQL()', function () {
    it('should return entity "person"', function (done) {
      let selectSQL = "SELECT * FROM ENTITY WHERE ENTITY_ID = 'person'";
      entityDB.executeSQL(selectSQL, function (err, rows) {
        if (err) throw err;
        rows[0].ENTITY_ID.should.equal('person');
        done();
      })
    })
  });

  describe('#doUpdatesParallel()', function () {
    let recGuid = '305635FFA99B4CA2800ED393F746227F';
    it("should insert an entry in both ENTITY_INSTANCES and Main Table", function (done) {
      let insertSQLs = [];
      let insertSQL = "INSERT INTO ENTITY_INSTANCES VALUES ("
        + " 'blog', "
        + entityDB.pool.escape(recGuid)
        + ", null ,"
        + "'1')";
      insertSQLs.push(insertSQL);
      insertSQL = "INSERT INTO blog (`NAME`,`INSTANCE_GUID`) VALUES ('AAA', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(insertSQL);

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
      insertSQLs.push(insertSQL);
      insertSQL = "INSERT INTO blog (`NAME`,`INSTANCE_GUID`) VALUES ('AAA', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(insertSQL);

      entityDB.doUpdatesParallel(insertSQLs, function (err) {
        should(err).not.eql(null);
        err.code.should.equal('ER_DUP_ENTRY');
        done();
      });
    });

    it("should update DEL flag to 1", function (done) {
      let updateSQLs = [];
      let updateSQL = "UPDATE ENTITY_INSTANCES SET DEL ='1' " +
        "WHERE ENTITY_ID ='blog' AND INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      updateSQLs.push(updateSQL);

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
      delSQLs.push(delSQL);
      delSQL = "DELETE FROM blog WHERE INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
      delSQLs.push(delSQL);

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
      insertSQLs.push(insertSQL);
      insertSQL = "INSERT INTO blog (`NAME`,`INSTANCE_GUID`) VALUES ('AAA', " +
        entityDB.pool.escape(recGuid) + ")";
      insertSQLs.push(insertSQL);

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
      delSQL = "DELETE FROM blog WHERE INSTANCE_GUID = " + entityDB.pool.escape(recGuid);
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
      entityDB.loadEntities(['person', 'permission'],done);
    });

    it('should have 2 entities and 5 relations', function () {
      entityDB.entities.should.containDeep([{ENTITY_ID: 'person'},{ENTITY_ID: 'permission'}]);
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

  describe('#getElementMeta()', function () {
    it('return data element ENTITY_ID', function (done) {
      entityDB.getElementMeta('ENTITY_ID', function (err, elementMeta) {
        should(err).eql(null);
        elementMeta.should.containDeep([{
          ELEMENT_ID: 'ENTITY_ID',
          ELEMENT_DESC: 'Entity ID',
          DOMAIN_ID: null,
          LABEL_TEXT: 'Entity ID',
          LIST_HEADER_TEXT: 'Entity',
          DATA_TYPE: 1,
          DATA_LENGTH: 32,
          DECIMAL: null,
          SEARCH_HELP_ID: null,
          SEARCH_HELP_EXPORT_FIELD: null,
          DOMAIN_TYPE: null,
          UNSIGNED: null,
          CAPITAL_ONLY: null,
          REG_EXPR: null,
          DOMAIN_ENTITY_ID: null,
          DOMAIN_RELATION_ID: null }]);
        done();
      });
    });
    it('return data element ACTION', function (done) {
      entityDB.getElementMeta('ACTION', function (err, elementMeta) {
        should(err).eql(null);
        elementMeta.should.containDeep([{
          ELEMENT_ID: 'ACTION',
          ELEMENT_DESC: 'Action to an object. ',
          DOMAIN_ID: 'ACTION',
          LABEL_TEXT: 'Action',
          LIST_HEADER_TEXT: 'Action',
          DATA_TYPE: 1,
          DATA_LENGTH: 30,
          DECIMAL: null,
          SEARCH_HELP_ID: null,
          SEARCH_HELP_EXPORT_FIELD: null,
          DOMAIN_TYPE: 3,
          UNSIGNED: null,
          CAPITAL_ONLY: null,
          REG_EXPR: null,
          DOMAIN_ENTITY_ID: null,
          DOMAIN_RELATION_ID: null }]);
        done();
      });
    });
    it('return data element USER_ID', function (done) {
      entityDB.getElementMeta('USER_ID', function (err, elementMeta) {
        should(err).eql(null);
        elementMeta.should.containDeep([{
          ELEMENT_ID: 'USER_ID',
          ELEMENT_DESC: 'User ID',
          DOMAIN_ID: 'USER_ID',
          LABEL_TEXT: 'User ID',
          LIST_HEADER_TEXT: 'User ID',
          DATA_TYPE: 1,
          DATA_LENGTH: 10,
          DECIMAL: null,
          SEARCH_HELP_ID: null,
          SEARCH_HELP_EXPORT_FIELD: null,
          DOMAIN_TYPE: 2,
          UNSIGNED: null,
          CAPITAL_ONLY: null,
          REG_EXPR: null,
          DOMAIN_ENTITY_ID: 'person',
          DOMAIN_RELATION_ID: 'r_user' } ]);
        done();
      });
    });
  });

  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  })
});
