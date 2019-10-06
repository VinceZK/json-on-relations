/**
 * Created by VinceZK on 06/29/18.
 */
const entityDB = require('../server/models/connections/sql_mdb.js');
const model = require('../server/models/model.js');

describe('model tests', function () {

  describe('Entity Types', function () {
    let entityType = {
      action: 'add',
      ENTITY_ID: 'testEntityx',
      ENTITY_DESC: 'description of entity',
      ATTRIBUTES: [
        { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'testEntityy', ORDER: 1,
          ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0},
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'testEntityx', ORDER: 2,
          ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
      ],
      ROLES: [
        {action: 'add', ROLE_ID: 'system_role', CONDITIONAL_ATTR: 'FIELD1', CONDITIONAL_VALUE: 'XXXX'}
      ]
    };

    it('should fail to create a new entity type due to wrong relation', function(done){
      model.saveEntityType(entityType, 'DH001', function(errs) {
        errs.should.containDeep(
          [{ msgCat: 'MODEL',
             msgName: 'ATTRIBUTE_NOT_BELONG_TO_RELATION',
             msgType: 'E' }]
        );
        done();
      });
    });

    it('should create a new entity type', function(done){
      entityType.ATTRIBUTES[0].RELATION_ID = 'testEntityx';
      model.saveEntityType(entityType, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta(entityType.ENTITY_ID, function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityx', ENTITY_DESC: 'description of entity',
              VERSION_NO: 1, RELOAD_IND: 1, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001',
              ROLES: [{ ROLE_ID: 'system_role', CONDITIONAL_ATTR: 'FIELD1', CONDITIONAL_VALUE: 'XXXX'}] });
          done();
        });
      });
    });

    it('should save an entity type with a new attribute and a new role', function(done){
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ENTITY_DESC: 'changed description of entity',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'testEntityx', ORDER: 3,
            ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ],
        ROLES: [
          {action:'add', ROLE_ID: 'system_user', CONDITIONAL_ATTR: 'FIELD2', CONDITIONAL_VALUE: 'YYYY'},
          {action:'update', ROLE_ID: 'system_role',  CONDITIONAL_VALUE: 'XXYY'},
        ]
      };
      model.saveEntityType(entityType, 'DH002', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta(entityType.ENTITY_ID, function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityx', ENTITY_DESC: 'changed description of entity',
              VERSION_NO: 2, RELOAD_IND: 2, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH002',
              ROLES: [
                { ROLE_ID: 'system_role', CONDITIONAL_ATTR: 'FIELD1', CONDITIONAL_VALUE: 'XXYY'},
                { ROLE_ID: 'system_user', CONDITIONAL_ATTR: 'FIELD2', CONDITIONAL_VALUE: 'YYYY'}
              ] });
          entityDB.getRelationMeta(entityType.ENTITY_ID, function (err, relationMeta) {
            should(err).eql(null);
            relationMeta.should.containDeep(
              { RELATION_ID: 'testEntityx', RELATION_DESC: 'changed description of entity',
                VERSION_NO: 2, RELOAD_IND: 2,
                ATTRIBUTES:
                  [ { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'testEntityx',
                      ATTR_NAME: 'FIELD1', LABEL_TEXT: 'FIELD1', LIST_HEADER_TEXT: 'FIELD1',
                      DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0, UNSIGNED: null,
                      ORDER: 1, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 },
                    { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'testEntityx',
                      ATTR_NAME: 'FIELD2', LABEL_TEXT: 'FIELD2', LIST_HEADER_TEXT: 'FIELD2',
                      DATA_TYPE: 2, DATA_LENGTH: 0, DECIMAL: 0, UNSIGNED: null,
                      ORDER: 2, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 },
                    { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'testEntityx',
                      ATTR_NAME: 'FIELD3', LABEL_TEXT: 'FIELD3', LIST_HEADER_TEXT: 'FIELD3',
                      DATA_TYPE: 3, DATA_LENGTH: 0, DECIMAL: 0, UNSIGNED: null,
                      ORDER: 3, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 }
                     ]});
            done();
          });
        });
      });
    });

    it('should fail to delete an attribute for not providing attribute name', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB'}
        ]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        errs.should.containDeep(
          [{ msgCat: 'MODEL',
            msgName: 'MISS_ATTRIBUTE_NAME_WHEN_DELETION',
            msgType: 'E' }]);
        done();
      });
    });

    it('should fail to delete an attribute as it is used in role condition', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', ATTR_NAME: 'FIELD2'}
        ]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        errs.should.containDeep(
          [{ msgCat: 'MODEL',
            msgName: 'ATTRIBUTE_USED_IN_ROLE_CONDITION',
            msgShortText:
            'Attribute "FIELD2" is used in condition of role "system_user", thus cannot be deleted',
            msgType: 'E' }]);
        done();
      });
    });

    it('should fail to delete an attribute as it is about to be used in role condition', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', ATTR_NAME: 'FIELD3'}
        ],
        ROLES: [
          {action:'update', ROLE_ID: 'system_user', CONDITIONAL_ATTR: 'FIELD3'}
        ]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        errs.should.containDeep(
          [{ msgCat: 'MODEL',
            msgName: 'ATTRIBUTE_USED_IN_ROLE_CONDITION',
            msgShortText:
              'Attribute "FIELD3" is used in condition of role "system_user", thus cannot be deleted',
            msgType: 'E' }]);
        done();
      });
    });

    it('should fail to update the role condition as the field does not exist', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ROLES: [
          {action:'update', ROLE_ID: 'system_user', CONDITIONAL_ATTR: 'FIELD4'}
        ]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        errs.should.containDeep(
          [{ msgCat: 'MODEL',
             msgName: 'INVALID_ROLE_CONDITION_ATTRIBUTE',
             msgType: 'E' }]);
        done();
      });
    });

    it('should save an entity type by deleting an attribute and a role', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ENTITY_DESC: 'description of entity',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', ATTR_NAME: 'FIELD3'}
        ],
        ROLES: [{action:'delete', ROLE_ID: 'system_user'}]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta(entityType.ENTITY_ID, function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityx', ENTITY_DESC: 'description of entity',
              VERSION_NO: 3, RELOAD_IND: 3, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH003'});
          entityDB.getRelationMeta(entityType.ENTITY_ID, function (err, relationMeta) {
            should(err).eql(null);
            relationMeta.should.containDeep(
              { RELATION_ID: 'testEntityx', RELATION_DESC: 'description of entity',
                VERSION_NO: 3, RELOAD_IND: 3});
            done();
          });
        });
      });
    });

    it('should save an entity type by changing an attribute', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'update', ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB',
            ATTR_NAME: 'FIELD4', DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2}
        ],
        ROLES: [
          {action:'update', ROLE_ID: 'system_role', CONDITIONAL_ATTR: 'FIELD4', CONDITIONAL_VALUE: 20.01}
        ]
      };
      model.saveEntityType(entityType, 'DH004', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta(entityType.ENTITY_ID, function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityx', ENTITY_DESC: 'description of entity',
              VERSION_NO: 4, RELOAD_IND: 4, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH004',
              ROLES: [{ROLE_ID: 'system_role', CONDITIONAL_ATTR: 'FIELD4', CONDITIONAL_VALUE: '20.01'}]});
          entityDB.getRelationMeta(entityType.ENTITY_ID, function (err, relationMeta) {
            should(err).eql(null);
            relationMeta.should.containDeep(
              { RELATION_ID: 'testEntityx', RELATION_DESC: 'description of entity',
                VERSION_NO: 4, RELOAD_IND: 4,
                ATTRIBUTES:
                  [ { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'testEntityx',
                      ATTR_NAME: 'FIELD4', LABEL_TEXT: 'FIELD4', LIST_HEADER_TEXT: 'FIELD4',
                      DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2, UNSIGNED: null,
                      ORDER: 2, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 }]
                });
            done();
          });
        });
      });
    });

    it('should add a new field with DTEL', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '5FF47C04C7034E34B9EFC181083AF5B5', RELATION_ID: 'testEntityx',
            ATTR_NAME: 'FIELD5', PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: 'DESCRIPTION_SHORT',
          }
        ]
      };
      model.saveEntityType(entityType, 'DH002', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should list some entity types', function(done){
      model.listEntityType('', function (errs, rows) {
        should(errs).eql(null);
        done();
      });
    });

    it('should list the entity "testEntityx"', function (done) {
      model.listEntityType('test', function (errs, rows) {
        should(errs).eql(null);
        rows.should.containDeep([{ENTITY_ID: 'testEntityx'}]);
        done();
      })
    });

    after('clear the testEntity', function (done) {
      let clearSQLs = [
        "delete from entity where ENTITY_ID = 'testEntityx'",
        "delete from relation where RELATION_ID = 'testEntityx'",
        "delete from attribute where RELATION_ID = 'testEntityx'",
        "delete from entity_roles where ENTITY_ID = 'testEntityx'",
        "drop table `testEntityx`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Role', function () {
    let role = {
      action: 'add',
      ROLE_ID: 'testRole',
      ROLE_DESC: 'description of Role',
      RELATIONS: [
        { RELATION_ID: 'r_company', CARDINALITY: '[0..1]'},
        { RELATION_ID: 'r_address', CARDINALITY: '[1..n]'}
      ]
    };

    it('should create a new Role', function (done) {
      model.saveRole(role, 'DH001', function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create an entity type with the new role', function (done) {
      let entityType = {
        ENTITY_ID: 'testEntityy', ENTITY_DESC: 'description of entity',
        ROLES: [ {ROLE_ID: 'testRole'} ]
      };
      model.saveEntityType(entityType, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta('testEntityy', function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityy', ENTITY_DESC: 'description of entity',
              VERSION_NO: 1, RELOAD_IND: 1, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001',
              ROLES: [
                { ROLE_ID: 'testRole',
                  RELATIONS: [
                    { RELATION_ID: 'r_address', CARDINALITY: '[1..n]' } ]} ] });
          done();
        });
      });
    });

    it('should change a role', function (done) {
      role = {
        action: 'update',
        ROLE_ID: 'testRole',
        ROLE_DESC: 'description of testRole changed',
        RELATIONS: [
          { action: 'add', RELATION_ID: 'r_user', CARDINALITY: '[1..1]'},
          { action: 'delete', RELATION_ID: 'r_company', CARDINALITY: '[0..1]'},
          { action: 'update', RELATION_ID: 'r_address', CARDINALITY: '[0..n]'}
        ]
      };
      model.saveRole(role, 'DH002', function (errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta('testEntityy', function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityy', ENTITY_DESC: 'description of entity',
              VERSION_NO: 1, RELOAD_IND: 2, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001',
              ROLES: [
                { ROLE_ID: 'testRole',
                  RELATIONS: [
                    { RELATION_ID: 'r_address', CARDINALITY: '[0..n]' },
                    { RELATION_ID: 'r_user', CARDINALITY: '[1..1]' } ]} ] });
          done();
        });

      })
    });

    it('should get a role', function (done) {
      model.getRole('testRole', function (errs, role) {
        should(errs).eql(null);
        role.should.containDeep({
          ROLE_ID: 'testRole',
          ROLE_DESC: 'description of testRole changed',
          RELATIONS: [
            { RELATION_ID: 'r_user', CARDINALITY: '[1..1]' },
            { RELATION_ID: 'r_address', CARDINALITY: '[0..n]'}
          ]
        });
        done();
      })
    });

    it('should get the description of the role', function (done) {
      model.getRoleDesc('testRole', function (errs, roleDesc) {
        should(errs).eql(null);
        roleDesc.should.eql('description of testRole changed');
        done();
      })
    });

    it('should list some roles', function(done){
      model.listRole('', function (errs, rows) {
        should(errs).eql(null);
        rows.length.should.above(2);
        done();
      });
    });

    it('should list the role "testRole"', function (done) {
      model.listRole('test', function (errs, rows) {
        should(errs).eql(null);
        rows.should.containDeep([{ROLE_ID: 'testRole'}]);
        done();
      })
    });

    after('clear the testRole', function (done) {
      let clearSQLs = [
        "delete from ROLE where ROLE_ID = 'testRole'",
        "delete from ROLE_RELATION where ROLE_ID = 'testRole'",
        "delete from entity where ENTITY_ID = 'testEntityy'",
        "delete from relation where RELATION_ID = 'testEntityy'",
        "delete from attribute where RELATION_ID = 'testEntityy'",
        "delete from entity_roles where ENTITY_ID = 'testEntityy'",
        "drop table `testEntityy`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Relation', function () {
    it('should create a new relation', function(done){
      let relation = {
        action: 'add',
        RELATION_ID: 'r_testRelationx',
        RELATION_DESC: 'description of relation',
        ATTRIBUTES: [
          { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx', ORDER: 1,
            ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 1,ATTR_DESC: 'Field1', DATA_ELEMENT: null,
            DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0},
          { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx', ORDER: 2,
            ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: 'Field2', DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ],
        ASSOCIATIONS: [
          {RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 1,
            FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'USER_ID'} ]
          }
        ]
      };
      model.saveRelation(relation, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep(
            { RELATION_ID: 'r_testRelationx', RELATION_DESC: 'description of relation',
              VERSION_NO: 1, RELOAD_IND: 1,
              ATTRIBUTES:
                [ {ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx', ORDER: 1,
                  ATTR_NAME: 'FIELD1', ATTR_DESC: 'Field1', DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0,
                   PRIMARY_KEY: 1, AUTO_INCREMENT: 0 },
                  {ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx', ORDER: 2,
                   ATTR_NAME: 'FIELD2', ATTR_DESC: 'Field2', DATA_TYPE: 2, DATA_LENGTH: 0, DECIMAL: 0,
                    PRIMARY_KEY: 0, AUTO_INCREMENT: 0 } ],
              ASSOCIATIONS:
                [ { RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 1} ] }
          );
          done();
        });
      });
    });

    it('should save a relation with a new attribute and a new association', function(done){
      let relation = {
        action: 'update',
        RELATION_ID: 'r_testRelationx',
        RELATION_DESC: 'changed description of relation',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx', ORDER: 3,
            ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: 'Field3', DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ],
        ASSOCIATIONS: [
          {action: 'update', RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..n]', FOREIGN_KEY_CHECK: 0,
            FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD2', RIGHT_FIELD: 'USER_NAME'} ]
          },
          {
            RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 0,
            FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD2', RIGHT_FIELD: 'USER_ID'} ]
          }
        ]
      };
      model.saveRelation(relation, 'DH002', function(err) {
        should(err).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep({
            RELATION_ID: 'r_testRelationx', RELATION_DESC: 'changed description of relation',
            VERSION_NO: 2, RELOAD_IND: 2,
            ATTRIBUTES:
              [ { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx', ORDER: 1,
                ATTR_NAME: 'FIELD1', ATTR_DESC: 'Field1', DATA_ELEMENT: null,
                  DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0, PRIMARY_KEY: 1, AUTO_INCREMENT: 0 },
                { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx',
                  ATTR_NAME: 'FIELD3', ATTR_DESC: 'Field3', DATA_ELEMENT: null, ORDER: 3,
                  DATA_TYPE: 3, DATA_LENGTH: 0, DECIMAL: 0, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 },
                { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx',
                  ATTR_NAME: 'FIELD2', ATTR_DESC: 'Field2', DATA_ELEMENT: null, DATA_TYPE: 2, ORDER: 2,
                  DATA_LENGTH: 0, DECIMAL: 0, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 } ],
            ASSOCIATIONS:
              [ { RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..n]', FOREIGN_KEY_CHECK: 0 },
                { RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 0} ]
          });
          done();
        });
      });
    });

    it('should change the attribute name from FIELD3 to FIELD30', function (done) {
      let relation = {
        action: 'update',
        RELATION_ID: 'r_testRelationx',
        ATTRIBUTES: [
          { action: 'update', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx',
            ORDER: 3, ATTR_NAME: 'FIELD30', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: 'Field30'}
        ]
      };
      model.saveRelation(relation, 'DH001', function(err) {
        should(err).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep({
            RELATION_ID: 'r_testRelationx', RELATION_DESC: 'changed description of relation',
            VERSION_NO: 3, RELOAD_IND: 3,
            ATTRIBUTES:
              [ { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx', ORDER: 1,
                ATTR_NAME: 'FIELD1', ATTR_DESC: 'Field1', DATA_ELEMENT: null,
                DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0, PRIMARY_KEY: 1, AUTO_INCREMENT: 0 },
                { ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx', ORDER: 3,
                  ATTR_NAME: 'FIELD30', ATTR_DESC: 'Field30', DATA_ELEMENT: null,
                  DATA_TYPE: 3, DATA_LENGTH: 0, DECIMAL: 0, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 },
                { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx', ORDER: 2,
                  ATTR_NAME: 'FIELD2', ATTR_DESC: 'Field2', DATA_ELEMENT: null, DATA_TYPE: 2,
                  DATA_LENGTH: 0, DECIMAL: 0, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 } ],
            ASSOCIATIONS:
              [ { RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..n]', FOREIGN_KEY_CHECK: 0 },
                { RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 0} ]
          });
          done();
        });
      });
    });

    it('should remove an attribute', function (done) {
      let relation = {
        action: 'update',
        RELATION_ID: 'r_testRelationx',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A' }
        ],
        ASSOCIATIONS: [
          { action: 'update', RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 0},
          {
            action: 'update', RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[0..1]',
            FIELDS_MAPPING: [ {action: 'delete', LEFT_FIELD: 'FIELD2', RIGHT_FIELD: 'USER_ID'},
                              {action: 'add', LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'USER_NAME'}]
          }
        ]
      };
      model.saveRelation(relation, 'DH001', function(err) {
        should(err).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep({
            RELATION_ID: 'r_testRelationx', RELATION_DESC: 'changed description of relation',
            VERSION_NO: 4, RELOAD_IND: 4,
            ATTRIBUTES:
              [ { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx', ORDER: 1,
                ATTR_NAME: 'FIELD1', ATTR_DESC: 'Field1', DATA_ELEMENT: null,
                  DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0, PRIMARY_KEY: 1, AUTO_INCREMENT: 0 },
                { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx', ORDER: 2,
                  ATTR_NAME: 'FIELD2', ATTR_DESC: 'Field2', DATA_ELEMENT: null, DATA_TYPE: 2,
                  DATA_LENGTH: 0, DECIMAL: 0, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 } ],
            ASSOCIATIONS:
              [ { RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 0 },
                { RIGHT_RELATION_ID: 'r_employee', CARDINALITY: '[0..1]', FOREIGN_KEY_CHECK: 0,
                  FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'USER_NAME'} ]} ]
          });
          done();
        });
      });
    });

    it('should create a new relation with DTEL', function(done){
      let relation = {
        RELATION_ID: 'r_testRelationy',
        RELATION_DESC: 'description of relation',
        ATTRIBUTES: [
          { ATTR_GUID: '9165F4FA9AA040F2B57318BD7D8B3DC9', RELATION_ID: 'r_testRelationy', ORDER: 1,
            ATTR_NAME: 'FIELD1', DATA_ELEMENT: 'ROLE_NAME', PRIMARY_KEY: 1},
          { ATTR_GUID: 'DE482C7E0F7644C59876674DA3848937', RELATION_ID: 'r_testRelationy', ORDER: 2,
            ATTR_NAME: 'FIELD2', DATA_ELEMENT: 'VERSION_NO'},
          { ATTR_GUID: 'D593BB0A0D1A48E58DAD18D5CAC60B6F', RELATION_ID: 'r_testRelationy', ORDER: 3,
            ATTR_NAME: 'FIELD3', DATA_ELEMENT: 'BOOLEAN'},
          { ATTR_GUID: '442CDFA4EC0A41E09FC9BDF0F0511440', RELATION_ID: 'r_testRelationy', ORDER: 4,
            ATTR_NAME: 'FIELD4', DATA_ELEMENT: 'AMOUNT_LC'},
          { ATTR_GUID: 'A4300E01F764469D9C7664E26ABF79AF', RELATION_ID: 'r_testRelationy', ORDER: 5,
            ATTR_NAME: 'FIELD5', DATA_ELEMENT: 'TEXT'},
          { ATTR_GUID: '4CEA6F4B2BB84B87BE081BA0F475BC8D', RELATION_ID: 'r_testRelationy', ORDER: 6,
            ATTR_NAME: 'FIELD6', DATA_ELEMENT: 'BINARY'},
          { ATTR_GUID: '86D2B6568BDB43999D7471693F3E7140', RELATION_ID: 'r_testRelationy', ORDER: 7,
            ATTR_NAME: 'FIELD7', DATA_ELEMENT: 'DATE'},
          { ATTR_GUID: '0ED8A57E9A8349E49993332FE67FFC4C', RELATION_ID: 'r_testRelationy', ORDER: 8,
            ATTR_NAME: 'FIELD8', DATA_ELEMENT: 'TIMESTAMP'}
        ],
        ASSOCIATIONS: [
          {RIGHT_RELATION_ID: 'r_role', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 1,
            FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'NAME'} ]
          }
        ]
      };
      model.saveRelation(relation, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep(
            { RELATION_ID: 'r_testRelationy', RELATION_DESC: 'description of relation',
              VERSION_NO: 1, RELOAD_IND: 1,
              ATTRIBUTES:
                [ { ATTR_GUID: '9165F4FA9AA040F2B57318BD7D8B3DC9', RELATION_ID: 'r_testRelationy', ORDER: 1,
                    ATTR_NAME: 'FIELD1', DATA_ELEMENT: 'ROLE_NAME', PRIMARY_KEY: 1 },
                  { ATTR_GUID: 'DE482C7E0F7644C59876674DA3848937', RELATION_ID: 'r_testRelationy', ORDER: 2,
                    ATTR_NAME: 'FIELD2', DATA_ELEMENT: 'VERSION_NO', DATA_TYPE: 2, UNSIGNED: 1 },
                  { ATTR_GUID: 'D593BB0A0D1A48E58DAD18D5CAC60B6F', RELATION_ID: 'r_testRelationy', ORDER: 3,
                    ATTR_NAME: 'FIELD3', DATA_ELEMENT: 'BOOLEAN'},
                  { ATTR_GUID: '442CDFA4EC0A41E09FC9BDF0F0511440', RELATION_ID: 'r_testRelationy', ORDER: 4,
                    ATTR_NAME: 'FIELD4', DATA_ELEMENT: 'AMOUNT_LC'},
                  { ATTR_GUID: 'A4300E01F764469D9C7664E26ABF79AF', RELATION_ID: 'r_testRelationy', ORDER: 5,
                    ATTR_NAME: 'FIELD5', DATA_ELEMENT: 'TEXT'},
                  { ATTR_GUID: '4CEA6F4B2BB84B87BE081BA0F475BC8D', RELATION_ID: 'r_testRelationy', ORDER: 6,
                    ATTR_NAME: 'FIELD6', DATA_ELEMENT: 'BINARY'},
                  { ATTR_GUID: '86D2B6568BDB43999D7471693F3E7140', RELATION_ID: 'r_testRelationy', ORDER: 7,
                    ATTR_NAME: 'FIELD7', DATA_ELEMENT: 'DATE'},
                  { ATTR_GUID: '0ED8A57E9A8349E49993332FE67FFC4C', RELATION_ID: 'r_testRelationy', ORDER: 8,
                    ATTR_NAME: 'FIELD8', DATA_ELEMENT: 'TIMESTAMP'}],
              ASSOCIATIONS:
                [ { RIGHT_RELATION_ID: 'r_role', CARDINALITY: '[1..1]', FOREIGN_KEY_CHECK: 1} ] }
          );
          entityDB.checkDBConsistency(relationMeta, function (err, result) {
            should(err).eql(null);
            should(result).eql(null);
            done();
          });
        });
      });
    });

    it('should list some relations', function(done){
      model.listRelation('', function (errs, rows) {
        should(errs).eql(null);
        rows.should.containDeep([{RELATION_ID: 'r_testRelationx'}]);
        done();
      });
    });

    it('should list the relation "r_testRelationx"', function (done) {
      model.listRelation('test', function (errs, rows) {
        should(errs).eql(null);
        rows.should.containDeep([{RELATION_ID: 'r_testRelationx'}]);
        done();
      })
    });

    after('clear the r_testRelationx', function (done) {
      let clearSQLs = [
        "delete from relation where RELATION_ID like 'r_testRelation%'",
        "delete from attribute where RELATION_ID like 'r_testRelation%'",
        "delete from RELATION_ASSOCIATION where LEFT_RELATION_ID like 'r_testRelation%'",
        "delete from RELATION_ASSOCIATION_FIELDS_MAPPING where LEFT_RELATION_ID like 'r_testRelation%'",
        "drop table `r_testRelationx`",
        "drop table `r_testRelationy`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Relationship',function () {
    let relationship = {
      action: 'add',
      RELATIONSHIP_ID: 'rs_testRelationship',
      RELATIONSHIP_DESC: 'description of relationship',
      VALID_PERIOD: 1000000,
      ATTRIBUTES: [
        { ATTR_GUID: '3F2FA5F8C5CE461E925DEDDAFA2C254C', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'husband_INSTANCE_GUID', DATA_ELEMENT: 'INSTANCE_GUID', ORDER: 1},
        { ATTR_GUID: '644B30EEA6C345EB96E4C7F713412DEE', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'husband_ENTITY_ID', DATA_ELEMENT: 'ENTITY_ID', ORDER: 2},
        { ATTR_GUID: 'DF29FFC8EC9F4292AD0596494B681C3A', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'wife_INSTANCE_GUID', DATA_ELEMENT: 'INSTANCE_GUID', ORDER: 3},
        { ATTR_GUID: 'C4C1171F4D084C74879ED4816647191D', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'wife_ENTITY_ID', DATA_ELEMENT: 'ENTITY_ID', ORDER: 4},
        { ATTR_GUID: 'C74C52C74C214849956447B77DF12C38', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'VALID_FROM', DATA_ELEMENT: 'VALID_FROM', ORDER: 5},
        { ATTR_GUID: 'F0423B2A5C934C858F7D0437DFA27157', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'VALID_TO', DATA_ELEMENT: 'VALID_TO', ORDER: 6},
        { ATTR_GUID: '21891D1AA60B44329DED70533F2169C6', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0, ORDER: 7},
        { ATTR_GUID: '3B8209C837C9414182B5154059DA4B0E', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0, ORDER: 8}
      ],
      INVOLVES: [
        { ROLE_ID: 'husband', CARDINALITY: '[1..1]', DIRECTION: 'is husband of' },
        { ROLE_ID: 'wife', CARDINALITY: '[1..1]', DIRECTION: 'is wife of' }
      ]
    };

    it('should create a new relationship', function(done){
      model.saveRelationship(relationship, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getRelationMeta(relationship.RELATIONSHIP_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep(
          { RELATION_ID: 'rs_testRelationship', RELATION_DESC: 'description of relationship',
            VERSION_NO: 1, RELOAD_IND: 1,
            ATTRIBUTES: [
              {ATTR_GUID: '3F2FA5F8C5CE461E925DEDDAFA2C254C', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'husband_INSTANCE_GUID', ATTR_DESC: 'Instance GUID', DATA_ELEMENT: 'INSTANCE_GUID',
                DOMAIN_ID: 'GUID', LABEL_TEXT: 'Instance GUID', LIST_HEADER_TEXT: 'Instance GUID', DATA_TYPE: 1,
                DATA_LENGTH: 32, DECIMAL: null, UNSIGNED: null, ORDER: 1, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: '644B30EEA6C345EB96E4C7F713412DEE', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'husband_ENTITY_ID', ATTR_DESC: 'Entity ID', DATA_ELEMENT: 'ENTITY_ID', DOMAIN_ID: null,
                LABEL_TEXT: 'Entity ID', LIST_HEADER_TEXT: 'Entity', DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: null,
                UNSIGNED: null, ORDER: 2, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: 'DF29FFC8EC9F4292AD0596494B681C3A', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'wife_INSTANCE_GUID', ATTR_DESC: 'Instance GUID', DATA_ELEMENT: 'INSTANCE_GUID',
                DOMAIN_ID: 'GUID', LABEL_TEXT: 'Instance GUID', LIST_HEADER_TEXT: 'Instance GUID', DATA_TYPE: 1,
                DATA_LENGTH: 32, DECIMAL: null, UNSIGNED: null, ORDER: 3, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: 'C4C1171F4D084C74879ED4816647191D', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'wife_ENTITY_ID', ATTR_DESC: 'Entity ID', DATA_ELEMENT: 'ENTITY_ID', DOMAIN_ID: null,
                LABEL_TEXT: 'Entity ID', LIST_HEADER_TEXT: 'Entity', DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: null,
                UNSIGNED: null, ORDER: 4, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: 'C74C52C74C214849956447B77DF12C38', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'VALID_FROM', ATTR_DESC: 'Valid from timestamp', DATA_ELEMENT: 'VALID_FROM', DOMAIN_ID: null,
                LABEL_TEXT: 'Valid from', LIST_HEADER_TEXT: 'Valid from', DATA_TYPE: 8, DATA_LENGTH: null,
                DECIMAL: null, UNSIGNED: null, ORDER: 5, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: 'F0423B2A5C934C858F7D0437DFA27157', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'VALID_TO', ATTR_DESC: 'Valid to', DATA_ELEMENT: 'VALID_TO', DOMAIN_ID: null,
                LABEL_TEXT: 'Valid to', LIST_HEADER_TEXT: 'Valid to', DATA_TYPE: 8, DATA_LENGTH: null, DECIMAL: null,
                UNSIGNED: null, ORDER: 6, PRIMARY_KEY: null, AUTO_INCREMENT: 0 },
              {ATTR_GUID: '21891D1AA60B44329DED70533F2169C6', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'FIELD1', ATTR_DESC: null, DATA_ELEMENT: null, DOMAIN_ID: null,
                LABEL_TEXT: 'FIELD1', LIST_HEADER_TEXT: 'FIELD1', DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: 0,
                UNSIGNED: null, ORDER: 7, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 },
              {ATTR_GUID: '3B8209C837C9414182B5154059DA4B0E', RELATION_ID: 'rs_testRelationship',
                ATTR_NAME: 'FIELD2', ATTR_DESC: null, DATA_ELEMENT: null, DOMAIN_ID: null,
                LABEL_TEXT: 'FIELD2', LIST_HEADER_TEXT: 'FIELD2', DATA_TYPE: 2, DATA_LENGTH: 0, DECIMAL: 0,
                UNSIGNED: null, ORDER: 8, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 }
                ]});
          entityDB.checkDBConsistency(relationMeta, function (err, result) {
            should(err).eql(null);
            should(result).eql(null);
            done();
          });
        });
      });
    });

    it('should save a relationship with a new attribute', function(done){
      relationship = {
        action: 'update',
        RELATIONSHIP_ID: 'rs_testRelationship',
        RELATIONSHIP_DESC: 'description of relationship changed',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '417375F73E1844BCBB77A4C9B9F7BF26', RELATION_ID: 'rs_testRelationship',
            ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0, ORDER: 9}
        ]
      };
      model.saveRelationship(relationship, 'DH002', function(errs) {
        should(errs).eql(null);
        entityDB.getRelationMeta(relationship.RELATIONSHIP_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep(
            { RELATION_ID: 'rs_testRelationship', RELATION_DESC: 'description of relationship changed',
              VERSION_NO: 2, RELOAD_IND: 2,
              ATTRIBUTES: [
                {ATTR_GUID: '417375F73E1844BCBB77A4C9B9F7BF26', RELATION_ID: 'rs_testRelationship',
                  ATTR_NAME: 'FIELD3', ATTR_DESC: null, DATA_ELEMENT: null, DOMAIN_ID: null,
                  LABEL_TEXT: 'FIELD3', LIST_HEADER_TEXT: 'FIELD3', DATA_TYPE: 3, DATA_LENGTH: 0, DECIMAL: 0,
                  UNSIGNED: null, ORDER: 9, PRIMARY_KEY: 0, AUTO_INCREMENT: 0 }
              ]});
          entityDB.checkDBConsistency(relationMeta, function (err, result) {
            should(err).eql(null);
            should(result).eql(null);
            done();
          });
        });
      });
    });

    it('should create an entity type involves in the relationship', function (done) {
      let entityType = {
        ENTITY_ID: 'testEntityy', ENTITY_DESC: 'description of entity',
        ROLES: [ {ROLE_ID: 'husband'}, {ROLE_ID: 'wife'} ]
      };
      model.saveEntityType(entityType, 'DH001', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should save a relationship with updated involvement', function(done){
      relationship = {
        action: 'update',
        RELATIONSHIP_ID: 'rs_testRelationship',
        VALID_PERIOD: 2000000,
        INVOLVES: [
          { action:'update', ROLE_ID: 'wife', CARDINALITY: '[1..N]', DIRECTION: 'are wives of' }
        ]
      };
      model.saveRelationship(relationship, 'DH003', function(errs) {
        should(errs).eql(null);
        entityDB.getEntityMeta('testEntityy', function (err, entityMeta) {
          should(err).eql(null);
          entityMeta.should.containDeep(
            { ENTITY_ID: 'testEntityy', ENTITY_DESC: 'description of entity',
              VERSION_NO: 1, RELOAD_IND: 3, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001',
              ROLES: [
                { ROLE_ID: 'husband', CONDITIONAL_ATTR: null, CONDITIONAL_VALUE: null,
                  RELATIONSHIPS: [
                    { RELATIONSHIP_ID: 'rs_testRelationship', VALID_PERIOD: 2000000,
                      INVOLVES: [
                        { ROLE_ID: 'husband', CARDINALITY: '[1..1]' },
                        { ROLE_ID: 'wife', CARDINALITY: '[1..N]' }
                        ]}]},
                { ROLE_ID: 'wife', CONDITIONAL_ATTR: null, CONDITIONAL_VALUE: null,
                  RELATIONSHIPS: [
                    { RELATIONSHIP_ID: 'rs_testRelationship', VALID_PERIOD: 2000000,
                      INVOLVES: [
                        { ROLE_ID: 'husband', CARDINALITY: '[1..1]' },
                        { ROLE_ID: 'wife', CARDINALITY: '[1..N]' }
                        ]}]}]});
          done();
        })
      });
    });

    it('should get the relationship rs_testRelationship', function (done) {
      model.getRelationship('rs_testRelationship', function (errs, relationship) {
        should(errs).eql(null);
        relationship.should.containDeep({
          RELATIONSHIP_ID: 'rs_testRelationship',
          RELATIONSHIP_DESC: 'description of relationship changed',
          VALID_PERIOD: 2000000,
          INVOLVES: [
            { ROLE_ID: 'husband', CARDINALITY: '[1..1]', DIRECTION: 'is husband of' },
            { ROLE_ID: 'wife', CARDINALITY: '[1..N]', DIRECTION: 'are wives of' }
          ]
        });
        done();
      })
    });

    it('should list some relationships', function(done){
      model.listRelationship('', function (errs, rows) {
        should(errs).eql(null);
        rows.length.should.above(2);
        done();
      });
    });

    it('should list the entity "person"', function (done) {
      model.listRelationship('test', function (errs, rows) {
        should(errs).eql(null);
        rows.should.containDeep([{RELATIONSHIP_ID: 'rs_testRelationship'}]);
        done();
      })
    });

    after('clear the testRelation', function (done) {
      let clearSQLs = [
        "delete from relationship where RELATIONSHIP_ID = 'rs_testRelationship'",
        "delete from relationship_involves where RELATIONSHIP_ID = 'rs_testRelationship'",
        "delete from relation where RELATION_ID = 'rs_testRelationship'",
        "delete from attribute where RELATION_ID = 'rs_testRelationship'",
        "drop table `rs_testRelationship`",
        "delete from entity where ENTITY_ID = 'testEntityy'",
        "delete from relation where RELATION_ID = 'testEntityy'",
        "delete from attribute where RELATION_ID = 'testEntityy'",
        "delete from entity_roles where ENTITY_ID = 'testEntityy'",
        "drop table `testEntityy`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Data Element', function () {

    it('should save a character data element', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementChar',
        ELEMENT_DESC: 'Description of element',
        DATA_TYPE: 1,
        DATA_LENGTH: 32,
        SEARCH_HELP_ID: 'SHLP',
        SEARCH_HELP_EXPORT_FIELD: 'SHLP_FLD',
        PARAMETER_ID: 'PARA_ID',
        LABEL_TEXT: 'Label text',
        LIST_HEADER_TEXT: 'List header text'
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should get the data element', function (done) {
      model.getDataElement('testDataElementChar', function (err, dataElement) {
        should(err).eql(null);
        dataElement.should.containEql({
          ELEMENT_ID: 'testDataElementChar', ELEMENT_DESC: 'Description of element',
          DATA_TYPE: 1, DATA_LENGTH: 32, VERSION_NO: 1,
          SEARCH_HELP_ID: 'SHLP', SEARCH_HELP_EXPORT_FIELD: 'SHLP_FLD',
          PARAMETER_ID: 'PARA_ID', LABEL_TEXT: 'Label text', LIST_HEADER_TEXT: 'List header text'
        });
        done();
      });
    });

    it('should save a decimal data element', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementDec',
        ELEMENT_DESC: 'Description of element',
        DATA_TYPE: 4,
        DATA_LENGTH: 23,
        DECIMAL: 2,
        LABEL_TEXT: 'Label text',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataElement('testDataElementDec', function (err, dataElement) {
          should(err).eql(null);
          dataElement.should.containEql({
            ELEMENT_ID: 'testDataElementDec', ELEMENT_DESC: 'Description of element',
            DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2, VERSION_NO: 1,
            SEARCH_HELP_ID: null, SEARCH_HELP_EXPORT_FIELD: null,
            PARAMETER_ID: null, LABEL_TEXT: 'Label text', LIST_HEADER_TEXT: null
          });
          done();
        });
      })
    });

    it('should save a data element with domain', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementDomain',
        ELEMENT_DESC: 'Description of element',
        DOMAIN_ID: 'HUMAN_AGE',
        LABEL_TEXT: 'Label text',
        LIST_HEADER_TEXT: 'List header text'
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataElement('testDataElementDomain', function (err, dataElement) {
          should(err).eql(null);
          dataElement.should.containEql({
            ELEMENT_ID: 'testDataElementDomain', ELEMENT_DESC: 'Description of element',
            DOMAIN_ID: 'HUMAN_AGE', DATA_TYPE: null, DATA_LENGTH: null, DECIMAL: null,
            SEARCH_HELP_ID: null, SEARCH_HELP_EXPORT_FIELD: null, VERSION_NO: 1,
            PARAMETER_ID: null, LABEL_TEXT: 'Label text', LIST_HEADER_TEXT: 'List header text'
          });
          done();
        });
      })
    });

    it('should create a relation with above 3 data elements', function(done){
      let relation = {
        RELATION_ID: 'r_testRelationDTEL',
        RELATION_DESC: 'description of relation',
        ATTRIBUTES: [
          { ATTR_GUID: '9165F4FA9AA040F2B57318BD7D8B3DC9', RELATION_ID: 'r_testRelationDTEL', ORDER: 1,
            ATTR_NAME: 'FIELD1', DATA_ELEMENT: 'testDataElementChar', PRIMARY_KEY: 1},
          { ATTR_GUID: 'DE482C7E0F7644C59876674DA3848937', RELATION_ID: 'r_testRelationDTEL', ORDER: 2,
            ATTR_NAME: 'FIELD2', DATA_ELEMENT: 'testDataElementDec'},
          { ATTR_GUID: 'D593BB0A0D1A48E58DAD18D5CAC60B6F', RELATION_ID: 'r_testRelationDTEL', ORDER: 3,
            ATTR_NAME: 'FIELD3', DATA_ELEMENT: 'testDataElementDomain'}
        ]
      };
      model.saveRelation(relation, 'DH001', function(errs) {
        should(errs).eql(null);
        entityDB.getRelationMeta(relation.RELATION_ID, function (err, relationMeta) {
          should(err).eql(null);
          relationMeta.should.containDeep(
            { RELATION_ID: 'r_testRelationDTEL', RELATION_DESC: 'description of relation',
              VERSION_NO: 1, RELOAD_IND: 1,
              ATTRIBUTES:
                [ { ATTR_GUID: '9165F4FA9AA040F2B57318BD7D8B3DC9', RELATION_ID: 'r_testRelationDTEL', ORDER: 1,
                  ATTR_NAME: 'FIELD1', DATA_ELEMENT: 'testDataElementChar', DATA_TYPE: 1, DATA_LENGTH: 32, PRIMARY_KEY: 1 },
                  { ATTR_GUID: 'DE482C7E0F7644C59876674DA3848937', RELATION_ID: 'r_testRelationDTEL', ORDER: 2,
                    ATTR_NAME: 'FIELD2', DATA_ELEMENT: 'testDataElementDec', DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2},
                  { ATTR_GUID: 'D593BB0A0D1A48E58DAD18D5CAC60B6F', RELATION_ID: 'r_testRelationDTEL', ORDER: 3,
                    ATTR_NAME: 'FIELD3', DATA_ELEMENT: 'testDataElementDomain', DOMAIN_ID: 'HUMAN_AGE', DATA_TYPE: 2}]}
          );
          done();
        });
      });
    });

    it('should change the data element testDataElementDec', function (done) {
      let dataElement = {
        action: 'update',
        ELEMENT_ID: 'testDataElementDec',
        ELEMENT_DESC: 'Description of element changed',
        DATA_TYPE: 4,
        DATA_LENGTH: 17,
        DECIMAL: 3,
        LIST_HEADER_TEXT: 'List header text',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataElement('testDataElementDec', function (err, dataElement) {
          should(err).eql(null);
          dataElement.should.containEql({
            ELEMENT_ID: 'testDataElementDec', ELEMENT_DESC: 'Description of element changed',
            DATA_TYPE: 4, DATA_LENGTH: 17, DECIMAL: 3, VERSION_NO: 2,
            SEARCH_HELP_ID: null, SEARCH_HELP_EXPORT_FIELD: null,
            PARAMETER_ID: null, LABEL_TEXT: 'Label text', LIST_HEADER_TEXT: 'List header text'
          });
          done();
        });
      })
    });

    it('should update the reload indicator and sync the DB table', function (done) {
      entityDB.getRelationMeta('r_testRelationDTEL', function (err, relationMeta) {
        should(err).eql(null);
        relationMeta.should.containDeep(
          { RELATION_ID: 'r_testRelationDTEL', VERSION_NO: 1, RELOAD_IND: 2}
        );
        entityDB.checkDBConsistency(relationMeta, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      });
    });

    it('should list data elements', function (done) {
      model.listDataElement('testDataElement', function (err, dataElements) {
        should(err).eql(null);
        dataElements.should.containDeep([
          {
            ELEMENT_ID: 'testDataElementChar', ELEMENT_DESC: 'Description of element',
            DOMAIN_ID: null, DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: null,
            SEARCH_HELP_ID: 'SHLP', SEARCH_HELP_EXPORT_FIELD: 'SHLP_FLD', PARAMETER_ID: 'PARA_ID',
            VERSION_NO: 1, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001' },
          {
            ELEMENT_ID: 'testDataElementDec', ELEMENT_DESC: 'Description of element changed',
            DOMAIN_ID: null, DATA_TYPE: 4, DATA_LENGTH: 17, DECIMAL: 3,
            SEARCH_HELP_ID: null, SEARCH_HELP_EXPORT_FIELD: null, PARAMETER_ID: null,
            VERSION_NO: 2, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001' },
          {
            ELEMENT_ID: 'testDataElementDomain', ELEMENT_DESC: 'Description of element',
            DOMAIN_ID: 'HUMAN_AGE', DATA_TYPE: null, DATA_LENGTH: null, DECIMAL: null,
            SEARCH_HELP_ID: null, SEARCH_HELP_EXPORT_FIELD: null, PARAMETER_ID: null,
            VERSION_NO: 1, CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001' }
        ]);
        done();
      });
    });

    it('should get description of the data element', function (done) {
      model.getDataElementDesc('testDataElementChar', function (err, desc) {
        should(err).eql(null);
        desc.should.eql('Description of element');
        done();
      });
    });

    after('clear the data element', function (done) {
      let clearSQLs = [
        "delete from DATA_ELEMENT where ELEMENT_ID like 'testDataElement%'",
        "delete from DATA_ELEMENT_TEXT where ELEMENT_ID like 'testDataElement%'",
        "delete from relation where RELATION_ID = 'r_testRelationDTEL'",
        "delete from attribute where RELATION_ID = 'r_testRelationDTEL'",
        "drop table `r_testRelationDTEL`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Data Domain', function () {

    it('should create a CHAR data domain', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainChar',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 1,
        DATA_LENGTH: 32,
        DOMAIN_TYPE: 0,
        CAPITAL_ONLY: 1
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should get the data domain', function (done) {
      model.getDataDomain('testDataDomainChar', function (err, dataDomain) {
        should(err).eql(null);
        dataDomain.should.containEql({
          DOMAIN_ID: 'testDataDomainChar', DOMAIN_DESC: 'Description of data domain',
          DATA_TYPE: 1, DATA_LENGTH: 32, DECIMAL: null, DOMAIN_TYPE: 0, UNSIGNED: null,
          CAPITAL_ONLY: 1, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 1,
          CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
        });
        done();
      });
    });

    it('should create a DECIMAL data domain', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainDec',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 4,
        DATA_LENGTH: 23,
        DECIMAL: 2,
        DOMAIN_TYPE: 0
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainDec', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containEql({
            DOMAIN_ID: 'testDataDomainDec', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2, DOMAIN_TYPE: 0, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should create an INTEGER data domain', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainInt',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 2,
        DOMAIN_TYPE: 0
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainInt', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containEql({
            DOMAIN_ID: 'testDataDomainInt', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 2, DATA_LENGTH: null, DECIMAL: null, DOMAIN_TYPE: 0, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should create a DATE data domain', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainDate',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 7,
        DOMAIN_TYPE: 0
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainDate', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containEql({
            DOMAIN_ID: 'testDataDomainDate', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 7, DATA_LENGTH: null, DECIMAL: null, DOMAIN_TYPE: 0, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should create an STRING data domain with REGEXP', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainStringRegexp',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 5,
        DOMAIN_TYPE: 1,
        REG_EXPR: '[a-Z0-9]'
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainStringRegexp', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containEql({
            DOMAIN_ID: 'testDataDomainStringRegexp', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 5, DATA_LENGTH: null, DECIMAL: null, DOMAIN_TYPE: 1, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: '[a-Z0-9]', RELATION_ID: null, VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should create an CHAR data domain with RELATION', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainCharRelation',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 1,
        DOMAIN_TYPE: 2,
        RELATION_ID: 'r_user'
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainCharRelation', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containEql({
            DOMAIN_ID: 'testDataDomainCharRelation', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 1, DATA_LENGTH: null, DECIMAL: null, DOMAIN_TYPE: 2, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: 'r_user', VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should create an CHAR data domain with Value Array', function (done) {
      let dataDomain = {
        DOMAIN_ID: 'testDataDomainCharValueArray',
        DOMAIN_DESC: 'Description of data domain',
        DATA_TYPE: 1,
        DATA_LENGTH: 10,
        DOMAIN_TYPE: 3,
        DOMAIN_VALUES: [
          { LOW_VALUE: 'VALUE1', LOW_VALUE_TEXT: 'Value1' },
          { LOW_VALUE: 'VALUE2', LOW_VALUE_TEXT: 'Value2' }
        ]
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainCharValueArray', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containDeep({
            DOMAIN_ID: 'testDataDomainCharValueArray', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 1, DATA_LENGTH: 10, DECIMAL: null, DOMAIN_TYPE: 3, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 1,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001', DOMAIN_VALUES: [
              { LOW_VALUE: 'VALUE1', LOW_VALUE_TEXT: 'Value1', HIGH_VALUE: null },
              { LOW_VALUE: 'VALUE2', LOW_VALUE_TEXT: 'Value2', HIGH_VALUE: null }
            ]
          });
          done();
        });
      })
    });

    it('should create a data element: testDataElementChar', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementChar',
        DOMAIN_ID: 'testDataDomainChar',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create a data element: testDataElementInt', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementInt',
        DOMAIN_ID: 'testDataDomainInt',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create a data element: testDataElementDec', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementDec',
        DOMAIN_ID: 'testDataDomainDec',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create a data element: testDataElementString', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementString',
        DOMAIN_ID: 'testDataDomainStringRegexp',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create a data element: testDataElementValueArray', function (done) {
      let dataElement = {
        ELEMENT_ID: 'testDataElementValueArray',
        DOMAIN_ID: 'testDataDomainCharValueArray',
      };
      model.saveDataElement(dataElement, 'DH001', function(err) {
        should(err).eql(null);
        done();
      })
    });

    it('should create a relation with above data elements', function(done){
      let relation = {
        RELATION_ID: 'r_testRelationDOMA',
        RELATION_DESC: 'description of relation',
        ATTRIBUTES: [
          { ATTR_GUID: '9165F4FA9AA040F2B57318BD7D8B3DC9', RELATION_ID: 'r_testRelationDOMA', ORDER: 1,
            ATTR_NAME: 'FIELD1', DATA_ELEMENT: 'testDataElementChar', PRIMARY_KEY: 1},
          { ATTR_GUID: 'DE482C7E0F7644C59876674DA3848937', RELATION_ID: 'r_testRelationDOMA', ORDER: 2,
            ATTR_NAME: 'FIELD2', DATA_ELEMENT: 'testDataElementInt'},
          { ATTR_GUID: 'D593BB0A0D1A48E58DAD18D5CAC60B6F', RELATION_ID: 'r_testRelationDOMA', ORDER: 3,
            ATTR_NAME: 'FIELD3', DATA_ELEMENT: 'testDataElementDec'},
          { ATTR_GUID: 'BEC21BA2E9E04BAC8B026E1063417F07', RELATION_ID: 'r_testRelationDOMA', ORDER: 4,
            ATTR_NAME: 'FIELD4', DATA_ELEMENT: 'testDataElementString'},
          { ATTR_GUID: 'F0423B2A5C934C858F7D0437DFA27157', RELATION_ID: 'r_testRelationDOMA', ORDER: 5,
            ATTR_NAME: 'FIELD5', DATA_ELEMENT: 'testDataElementValueArray'}
        ]
      };
      model.saveRelation(relation, 'DH001', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should change testDataDomainInt to UNSIGNED', function (done) {
      let dataDomain = {
        action: 'update',
        DOMAIN_ID: 'testDataDomainInt',
        UNSIGNED: 1
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainInt', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containDeep({
            DOMAIN_ID: 'testDataDomainInt', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 2, DATA_LENGTH: null, DECIMAL: null, DOMAIN_TYPE: 0, UNSIGNED: 1,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 2,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should affect the relation reload and DB sync', function(done) {
      entityDB.getRelationMeta('r_testRelationDOMA', function (err, relationMeta) {
        should(err).eql(null);
        relationMeta.should.containEql({
          RELATION_ID: 'r_testRelationDOMA', VERSION_NO: 1, RELOAD_IND: 2,});
        entityDB.checkDBConsistency(relationMeta, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      });
    });

    it('should change length and decimal of testDataDomainDec', function (done) {
      let dataDomain = {
        action: 'update',
        DOMAIN_ID: 'testDataDomainDec',
        DATA_LENGTH: 17, DECIMAL: 3
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainDec', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containDeep({
            DOMAIN_ID: 'testDataDomainDec', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 4, DATA_LENGTH: 17, DECIMAL: 3, DOMAIN_TYPE: 0, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 2,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should affect the relation reload and DB sync', function(done) {
      entityDB.getRelationMeta('r_testRelationDOMA', function (err, relationMeta) {
        should(err).eql(null);
        relationMeta.should.containEql({
          RELATION_ID: 'r_testRelationDOMA', VERSION_NO: 1, RELOAD_IND: 3,});
        entityDB.checkDBConsistency(relationMeta, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      });
    });

    it('should change type of testDataDomainStringRegexp', function (done) {
      let dataDomain = {
        action: 'update',
        DOMAIN_ID: 'testDataDomainStringRegexp',
        DATA_TYPE: 1, DATA_LENGTH: 200, DOMAIN_TYPE: 0, REG_EXPR: null
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainStringRegexp', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containDeep({
            DOMAIN_ID: 'testDataDomainStringRegexp', DOMAIN_DESC: 'Description of data domain',
            DATA_TYPE: 1, DATA_LENGTH: 200, DECIMAL: null, DOMAIN_TYPE: 0, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 2,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001'
          });
          done();
        });
      })
    });

    it('should affect the relation reload and DB sync', function(done) {
      entityDB.getRelationMeta('r_testRelationDOMA', function (err, relationMeta) {
        should(err).eql(null);
        relationMeta.should.containEql({
          RELATION_ID: 'r_testRelationDOMA', VERSION_NO: 1, RELOAD_IND: 4,});
        entityDB.checkDBConsistency(relationMeta, function (err, result) {
          should(err).eql(null);
          should(result).eql(null);
          done();
        });
      });
    });

    it('should change an CHAR data domain Value Array', function (done) {
      let dataDomain = {
        action: 'update',
        DOMAIN_ID: 'testDataDomainCharValueArray', DOMAIN_DESC: 'Description of data domain changed',
        DOMAIN_VALUES: [
          { LOW_VALUE: 'VALUE1', LOW_VALUE_TEXT: 'Value1' },
          { LOW_VALUE: 'VALUE2', LOW_VALUE_TEXT: 'Value2' },
          { LOW_VALUE: 'VALUE3', LOW_VALUE_TEXT: 'Value3' }
        ]
      };
      model.saveDataDomain(dataDomain, 'DH001', function(err) {
        should(err).eql(null);
        model.getDataDomain('testDataDomainCharValueArray', function (err, dataDomain) {
          should(err).eql(null);
          dataDomain.should.containDeep({
            DOMAIN_ID: 'testDataDomainCharValueArray', DOMAIN_DESC: 'Description of data domain changed',
            DATA_TYPE: 1, DATA_LENGTH: 10, DECIMAL: null, DOMAIN_TYPE: 3, UNSIGNED: null,
            CAPITAL_ONLY: null, REG_EXPR: null, RELATION_ID: null, VERSION_NO: 2,
            CREATE_BY: 'DH001', LAST_CHANGE_BY: 'DH001', DOMAIN_VALUES: [
              { LOW_VALUE: 'VALUE1', LOW_VALUE_TEXT: 'Value1', HIGH_VALUE: null },
              { LOW_VALUE: 'VALUE2', LOW_VALUE_TEXT: 'Value2', HIGH_VALUE: null },
              { LOW_VALUE: 'VALUE3', LOW_VALUE_TEXT: 'Value3', HIGH_VALUE: null }
            ]
          });
          done();
        });
      })
    });

    it('should not affect the relation reload and DB sync', function(done) {
      entityDB.getRelationMeta('r_testRelationDOMA', function (err, relationMeta) {
        should(err).eql(null);
        relationMeta.should.containEql({
          RELATION_ID: 'r_testRelationDOMA', VERSION_NO: 1, RELOAD_IND: 4,});
        done();
      });
    });

    it('should list data domains', function (done) {
      model.listDataDomain('testDataDomain', function (err, dataDomains) {
        should(err).eql(null);
        dataDomains.should.containDeep([
          { DOMAIN_ID: 'testDataDomainChar', DOMAIN_DESC: 'Description of data domain' },
          { DOMAIN_ID: 'testDataDomainCharRelation', DOMAIN_DESC: 'Description of data domain' },
          { DOMAIN_ID: 'testDataDomainCharValueArray', DOMAIN_DESC: 'Description of data domain changed' },
          { DOMAIN_ID: 'testDataDomainDate', DOMAIN_DESC: 'Description of data domain' },
          { DOMAIN_ID: 'testDataDomainDec', DOMAIN_DESC: 'Description of data domain' },
          { DOMAIN_ID: 'testDataDomainInt', DOMAIN_DESC: 'Description of data domain' },
          { DOMAIN_ID: 'testDataDomainStringRegexp', DOMAIN_DESC: 'Description of data domain' }
        ]);
        done();
      });
    });

    it('should get description of the data domain', function (done) {
      model.getDataDomainDesc('testDataDomainChar', function (err, desc) {
        should(err).eql(null);
        desc.should.eql('Description of data domain');
        done();
      });
    });

    after('clear the data domains', function (done) {
      let clearSQLs = [
        "delete from DATA_DOMAIN where DOMAIN_ID like 'testDataDomain%'",
        "delete from DATA_DOMAIN_VALUE where DOMAIN_ID like 'testDataDomain%'",
        "delete from DATA_DOMAIN_VALUE_TEXT where DOMAIN_ID like 'testDataDomain%'",
        "delete from DATA_ELEMENT where ELEMENT_ID like 'testDataElement%'",
        "delete from DATA_ELEMENT_TEXT where ELEMENT_ID like 'testDataElement%'",
        "delete from relation where RELATION_ID = 'r_testRelationDOMA'",
        "delete from attribute where RELATION_ID = 'r_testRelationDOMA'",
        "drop table `r_testRelationDOMA`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  });
});
