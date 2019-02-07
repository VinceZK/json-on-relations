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
        { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'testEntityx',
          ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0},
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'testEntityx',
          ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
      ],
      ROLES: [
        {action: 'add', ROLE_ID: 'system_role'}
      ]
    };

    it('should create a new entity type', function(done){
      model.saveEntityType(entityType, 'DH001', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should save an entity type with a new attribute and a new role', function(done){
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ENTITY_DESC: 'changed description of entity',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'testEntityx',
            ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ],
        ROLES: [{action:'add', ROLE_ID: 'system_user'}]
      };
      model.saveEntityType(entityType, 'DH002', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should save an entity type by deleting an attribute and a role', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ENTITY_DESC: 'description of entity',
        ATTRIBUTES: [
          { action: 'delete', ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB'}
        ],
        ROLES: [{action:'delete', ROLE_ID: 'system_role'}]
      };
      model.saveEntityType(entityType, 'DH003', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should save an entity type by changing an attribute', function (done) {
      entityType = {
        action: 'update',
        ENTITY_ID: 'testEntityx',
        ATTRIBUTES: [
          { action: 'update', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A',
            ATTR_NAME: 'FIELD3', DATA_TYPE: 4, DATA_LENGTH: 23, DECIMAL: 2}
        ],
      };
      model.saveEntityType(entityType, 'DH004', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should list some entity types', function(done){
      model.listEntityType('', function (errs, rows) {
        should(errs).eql(null);
        console.log(rows);
        done();
      });
    });

    it('should list the entity "person"', function (done) {
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
      model.saveRole(role, 'DH001', function (errs) {
        should(errs).eql(null);
        done();
      })
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
        done();
      })
    });

    it('should get a role', function (done) {
      model.getRole('testRole', function (errs, role) {
        should(errs).eql(null);
        role.should.containDeep({
          ROLE_ID: 'testRole',
          ROLE_DESC: 'description of testRole changed',
          RELATIONS: [
            { RELATION_ID: 'r_user', CARDINALITY: '[1..1]'},
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
        console.log(rows);
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
        "delete from ROLE_RELATION where ROLE_ID = 'testRole'"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  describe('Relation', function () {
    let relation = {
      action: 'add',
      RELATION_ID: 'r_testRelationx',
      RELATION_DESC: 'description of relation',
      ATTRIBUTES: [
        { ATTR_GUID: '70FE080427D14BBEB18596FAFFB67C30', RELATION_ID: 'r_testRelationx',
          ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 1,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0},
        { ATTR_GUID: '9E2D7D66AD7A40E8926E56AFA22F81CB', RELATION_ID: 'r_testRelationx',
          ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
      ],
      ASSOCIATIONS: [
        {RIGHT_RELATION_ID: 'r_user', CARDINALITY: '[1..0]', FOREIGN_KEY_CHECK: 1,
          FIELDS_MAPPING: [ {LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'USER_ID'} ]
        }
      ]
    };

    it('should create a new relation', function(done){
      model.saveRelation(relation, 'DH001', function(errs) {
        should(errs).eql(null);
        done();
      });
    });

    it('should save a relation with a new attribute and a new role', function(done){
      let relation = {
        action: 'update',
        RELATION_ID: 'r_testRelationx',
        RELATION_DESC: 'changed description of relation',
        ATTRIBUTES: [
          { action: 'add', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx',
            ATTR_NAME: 'FIELD3', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
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
        done();
      });
    });

    it('should change the attribute name from FIELD3 to FIELD30', function (done) {
      let relation = {
        action: 'update',
        RELATION_ID: 'r_testRelationx',
        ATTRIBUTES: [
          { action: 'update', ATTR_GUID: '97CCD1AD046A4D39A96C25823839AE8A', RELATION_ID: 'r_testRelationx',
            ATTR_NAME: 'FIELD30', DATA_TYPE: 3, PRIMARY_KEY: 0, ATTR_DESC: null, DATA_ELEMENT: null,
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ]
      };
      model.saveRelation(relation, 'DH001', function(err) {
        should(err).eql(null);
        done();
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
          { action: 'update', RIGHT_RELATION_ID: 'r_user', FOREIGN_KEY_CHECK: 1},
          {
            action: 'update', RIGHT_RELATION_ID: 'r_employee',
            FIELDS_MAPPING: [ {action: 'delete', LEFT_FIELD: 'FIELD2', RIGHT_FIELD: 'USER_ID'},
                              {action: 'add', LEFT_FIELD: 'FIELD1', RIGHT_FIELD: 'USER_NAME'}]
          }
        ]
      };
      model.saveRelation(relation, 'DH001', function(err) {
        should(err).eql(null);
        done();
      });
    });

    it('should list some relations', function(done){
      model.listRelation('', function (errs, rows) {
        should(errs).eql(null);
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
        "delete from relation where RELATION_ID = 'r_testRelationx'",
        "delete from attribute where RELATION_ID = 'r_testRelationx'",
        "delete from RELATION_ASSOCIATION where LEFT_RELATION_ID = 'r_testRelationx'",
        "delete from RELATION_ASSOCIATION_FIELDS_MAPPING where LEFT_RELATION_ID = 'r_testRelationx'",
        "drop table `r_testRelationx`"
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
        { ATTR_GUID: '21891D1AA60B44329DED70533F2169C6', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'FIELD1', DATA_TYPE: 1, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 32, DECIMAL: 0, AUTO_INCREMENT: 0},
        { ATTR_GUID: '3B8209C837C9414182B5154059DA4B0E', RELATION_ID: 'rs_testRelationship',
          ATTR_NAME: 'FIELD2', DATA_TYPE: 2, PRIMARY_KEY: 0,ATTR_DESC: null, DATA_ELEMENT: null,
          DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
      ],
      INVOLVES: [
        { ROLE_ID: 'husband', CARDINALITY: '[1..1]', DIRECTION: 'is husband of' },
        { ROLE_ID: 'wife', CARDINALITY: '[1..1]', DIRECTION: 'is wife of' }
      ]
    };

    it('should create a new relationship', function(done){
      model.saveRelationship(relationship, 'DH001', function(errs) {
        should(errs).eql(null);
        done();
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
            DATA_LENGTH: 0, DECIMAL: 0, AUTO_INCREMENT: 0}
        ]
      };
      model.saveRelationship(relationship, 'DH002', function(errs) {
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
        done();
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
        console.log(rows);
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
        "drop table `rs_testRelationship`"
      ];
      entityDB.doUpdatesParallel(clearSQLs, done);
    })
  });

  after('Close the MDB', function (done) {
    entityDB.closeMDB(done);
  })
});
