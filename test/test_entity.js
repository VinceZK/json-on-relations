/**
 * Created by VinceZK on 06/29/18.
 */
const entity = require('../server/models/entity.js');
const _ = require('underscore');

describe('entity tests', function () {
  before(function (done) {
    entity.entityDB.loadEntity('person', done);
  });

  let instance =
    { ENTITY_ID: 'person',
      person: {HEIGHT: 170, GENDER: 'male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E', HOBBY:'Reading, Movie, Coding'},
      r_user: {USER_ID: 'DH999', USER_NAME:'VINCEZK', DISPLAY_NAME: 'Vincent Zhang'},
      r_email: [{EMAIL: 'dh999@hotmail.com', TYPE: 'private', PRIMARY:1},
                {EMAIL: 'dh999@gmail.com', TYPE: 'private important', PRIMARY:0}
        ],
      r_address: [{COUNTRY: 'China', CITY:'Shanghai', POSTCODE: 201202,
                   ADDRESS_VALUE:'Room #402, Building #41, Dongjing Road #393',
                   TYPE: 'Current Live', PRIMARY:1},
                  {COUNTRY: 'China', CITY:'Haimen', POSTCODE: 226126,
                   ADDRESS_VALUE:'Group 8 Lizhu Tangjia',
                   TYPE: 'Born Place', PRIMARY:0}],
      r_employee: {USER_ID: 'DH999', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Male'},
      relationships:[
         { RELATIONSHIP_ID: 'rs_user_role',
           values:[
             {action:'add', SYNCED:0,
               PARTNER_INSTANCES:[{ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167'}]}
           ]
           }]
    };

  describe('Entity Creation', function () {
    it('should not create an instance as mandatory relation is missing', function(done){
      let instance2 = _.clone(instance);
      delete instance2.r_user;
      entity.createInstance(instance2, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'MANDATORY_RELATION_MISSING',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should not create an instance as multiple values is not allowed for r_employee', function(done){
      let instance2 = _.clone(instance);
      instance2.r_employee = [
        {USER_ID: 'DH999', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Male'},
        {USER_ID: 'DH998', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Director', GENDER:'Male'}
      ];
      entity.createInstance(instance2, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATION_NOT_ALLOW_MULTIPLE_VALUE',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should not create an instance for illegal actions', function(done){
      let instance2 = _.clone(instance);
      instance2.r_email = [
        {action: 'delete', EMAIL: 'dh999@hotmail.com', TYPE: 'private', PRIMARY:1},
        {action: 'update', EMAIL: 'dh999@gmail.com', TYPE: 'private important', PRIMARY:0}
      ];
      entity.createInstance(instance2, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'UPDATE_DELETE_NOT_ALLOWED',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should create an instance of person', function (done) {
      entity.createInstance(instance,function (err, instance) {
        should(err).eql(null);
        done();
      });
    });

    it('should get an instance of person', function (done) {
      entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH999'}, function (err, instance2) {
        should(err).eql(null);
        instance2.ENTITY_ID.should.eql(instance.ENTITY_ID);
        instance2.person.should.containDeep([instance.person]);
        instance2.r_user.should.containDeep([instance.r_user]);
        instance2.r_email.should.containDeep(instance.r_email);
        instance2.r_address.should.containDeep(instance.r_address);
        instance2.r_employee.should.containDeep([instance.r_employee]);
        delete instance.relationships[0].values[0].action;
        instance2.relationships.should.containDeep(instance.relationships);
        done();
      })
    });

    it('should get pieces of an instance', function (done) {
      let piece = {RELATIONS: ['r_user', 'r_email'], RELATIONSHIPS: ['rs_user_role'] };
      entity.getInstancePieceByGUID(instance.INSTANCE_GUID, piece, function (err, instancePiece) {
        should(err).eql(null);
        instancePiece.r_user.should.containDeep([instance.r_user]);
        instancePiece.r_email.should.containDeep(instance.r_email);
        instancePiece.relationships.should.containDeep(instance.relationships);
        done();
      })
    })
  });

  describe('Entity Changing', function () {
    it('should change attributes of the instance', function (done) {
      let instance3 =
        {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
          person: {action:'update', HOBBY:'Reading, Movie, Coding, Bike', HEIGHT: 171 },
          r_user : {action:'update', USER_ID: 'DH999', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'},
          r_email: [
            {action:'delete', EMAIL: 'dh999@hotmail.com'},
            {action:'update', EMAIL: 'dh999@gmail.com', PRIMARY:1},
            {action:'add', EMAIL: 'dh999@sap.com', TYPE: 'work', PRIMARY:0},
            {EMAIL: 'dh999@hotmail.com', TYPE: 'private', PRIMARY:0}],
          relationships:[
            { RELATIONSHIP_ID: 'rs_user_role',
              values:[
                {action:'add', SYNCED: 1,
                  PARTNER_INSTANCES:[
                    {ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:'F0EF0C4174A883BF639E2EB0C8735239'}
                    ]}]}
          ]
        };
      entity.changeInstance(instance3, function(err){
        should(err).eql(null);
        entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, instance2) {
          should(err).eql(null);
          delete instance3.person.action;
          instance2.person.should.containDeep([instance3.person]);
          delete instance3.r_user.action;
          instance2.r_user.should.containDeep([instance3.r_user]);
          instance2.r_email.should.containDeep([
            {EMAIL: 'dh999@sap.com'},
            {EMAIL: 'dh999@gmail.com', PRIMARY:1},{EMAIL: 'dh999@hotmail.com', TYPE: 'private', PRIMARY:0}]);
          delete instance3.relationships[0].values[0].action;
          instance2.relationships.should.containDeep(instance3.relationships);
          done();
        });
      })
    });

    it('should report an error as ENTITY_ID is not provided', function (done) {
      let instance3 = {INSTANCE_GUID: instance.INSTANCE_GUID,
        r_user : {action:'update', USER_ID: 'DH999', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'ENTITY_ID_MISSING',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should report an error as r_user is [1..1] relation', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_user : {USER_ID: 'DH998', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATION_NOT_ALLOW_MULTIPLE_VALUE',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should add user personalization successfully', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_personalization : {USER_ID: 'DH999', TIMEZONE: ' UTC+8', LANGUAGE: 'ZH'}};
      entity.changeInstance(instance3, function(err){
        should(err).eql(null);
        done();
      })
    });

    it('should be failed to add personalization, as it is [0..1] and already exists', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_personalization : {USER_ID: 'DH999', TIMEZONE: ' UTC+8', LANGUAGE: 'EN', DATE_FORMAT: 'YYYY/MM/DD hh:mm:ss'}};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATION_NOT_ALLOW_MULTIPLE_VALUE',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should be failed to clear emails, as it is [1..n]', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_email : [{action:'delete', EMAIL: 'dh999@gmail.com', PRIMARY:1},
          {action:'delete', EMAIL: 'dh999@sap.com'},
          {action:'delete', EMAIL: 'dh999@hotmail.com', PRIMARY:0}]};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'MANDATORY_RELATION_MISSING',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should update the emails successfully', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_email : [
          {action:'delete', EMAIL: 'dh999@gmail.com', PRIMARY:1},
          {action:'delete', EMAIL: 'dh999@sap.com'},
          {action:'delete', EMAIL: 'dh999@hotmail.com', PRIMARY:0},
          {action:'add', EMAIL: 'dh999@hotmail.com', PRIMARY:1}]};
      entity.changeInstance(instance3, function(err){
        should(err).eql(null);
        done();
      })
    });

    it('should failed to delete r_user as it is [1..1]', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_user : {action: 'delete',USER_ID: 'DH999'}};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'MANDATORY_RELATION_MISSING',
          msgType: 'E'
        }]);
        done();
      })
    });

  });

  describe('relationship tests', function () {
    let instance3;
    before(function () {
      instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID};
    });

    it('should report an error of RELATIONSHIP_ACTION_INVALID', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'aa', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1}]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_ACTION_INVALID', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_GUID_MISSING', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'update', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1}]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_GUID_MISSING', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of PARTNER_INSTANCE_GUID_MISSING', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'PARTNER_INSTANCES_MISSING', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of INVOLVED_ROLE_NUMBER_INCORRECT', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_TO:'2030-12-31 00:00:00', SYNCED: 0,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' },
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'AC560C8786095BB7B4842ABA2F323478' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'INVOLVED_ROLE_NUMBER_INCORRECT', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of ROLE_NOT_VALID', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_TO:'2030-12-31 00:00:00', SYNCED: 0,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role1',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'ROLE_NOT_VALID', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of NEW_RELATIONSHIP_ADD_TO_BEFORE ', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2017-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 0,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'NEW_RELATIONSHIP_ADD_TO_BEFORE', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of VALID_TO_BEFORE_VALID_FROM ', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2031-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 0,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'VALID_TO_BEFORE_VALID_FROM', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of ENTITY_INSTANCE_NOT_EXIST', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2019-12-31 00:00:00', VALID_TO:'2028-12-31 00:00:00', SYNCED: 0,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'ENTITY_INSTANCE_NOT_EXIST', msgType: 'E'}]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_NOT_EXIST', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'update', RELATIONSHIP_INSTANCE_GUID: '9F86F86198B711E8A69A2DDC7A79514A',SYNCED: '1'},
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_NOT_EXIST', msgType: 'E'}]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..n]', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2020-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]},
            { action: 'add', VALID_FROM:'2025-12-31 00:00:00', VALID_TO:'2035-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..1]', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2020-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]},
            { action: 'add', VALID_FROM:'2025-12-31 00:00:00', VALID_TO:'2035-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'1483BE56BDA717184CD170467A214695' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..n] in DB', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2020-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    let instance2;
    it('should successfully add 3 relationships', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'add', VALID_FROM:'2124-12-31 00:00:00', VALID_TO:'2128-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]},
            { action: 'add', VALID_FROM:'2020-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'F914BC7E2BD65D42A0B17FBEAD8E1AF2' }
              ]}
          ]
        },
        {
          RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add',
              PARTNER_INSTANCES:[
               {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'1A4EB21F9CE0B3236F61EDBB57BC9738' }
              ]
            }
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        should(err).eql(null);
        entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH999'}, function (err, instancex){
          should(err).eql(null);
          instance2 = instancex;
          done();
        });
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..1] in DB', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2025-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'1A4EB21F9CE0B3236F61EDBB57BC9738' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    /**
     * Current relationships in DB
     * [ { RELATIONSHIP_ID: 'rs_user_role', SELF_ROLE_ID: 'system_user',
           values:
           [{ RELATIONSHIP_INSTANCE_GUID: '383AF8109A5011E888D27D8CC56E2EFC',
              VALID_FROM: '2118-12-31 00:00:00', VALID_TO: '2128-12-31 00:00:00', SYNCED: '1',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' } ]},
            { RELATIONSHIP_INSTANCE_GUID: '383AF8119A5011E888D27D8CC56E2EFC',
              VALID_FROM: '2020-12-31 00:00:00', VALID_TO: '2030-12-31 00:00:00', SYNCED: '0',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'F914BC7E2BD65D42A0B17FBEAD8E1AF2' } ]},
            { RELATIONSHIP_INSTANCE_GUID: 'E54922A198B811E8B53245D7B7311FC8',
              VALID_FROM: '2018-08-05 22:07:32', VALID_TO: '2118-10-20 22:07:32', SYNCED: '0',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' } ]},
            { RELATIONSHIP_INSTANCE_GUID: 'E556902098B811E8B53245D7B7311FC8',
              VALID_FROM: '2018-08-05 22:07:32', VALID_TO: '2118-10-20 22:07:32', SYNCED: '1',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'F0EF0C4174A883BF639E2EB0C8735239' }]}]}
     ]
     */
    it('should read the instance', function (done) {
      entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH999'}, function (err, instancex){
        should(err).eql(null);
        instance2 = instancex;
        done();
      });
    });

    it('should report an error of RELATIONSHIP_DELETION_NOT_ALLOWED', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_user_role';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === 'F0EF0C4174A883BF639E2EB0C8735239';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'delete', RELATIONSHIP_INSTANCE_GUID:currentRelationshipGUID }
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_DELETION_NOT_ALLOWED', msgType: 'E'}]);
        done();
      })
    });

    it('should report an error of FUTURE_RELATIONSHIP', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_user_role';
      });
      let futureRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === 'F914BC7E2BD65D42A0B17FBEAD8E1AF2';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'expire', RELATIONSHIP_INSTANCE_GUID: futureRelationshipGUID},
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'FUTURE_RELATIONSHIP', msgType: 'E'}]);
        done();
      })
    });

    it('should expire an active relationship', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_user_role';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === 'F0EF0C4174A883BF639E2EB0C8735239';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action:'expire', RELATIONSHIP_INSTANCE_GUID: currentRelationshipGUID},
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should report an error of CHANGE_TO_EXPIRED_RELATIONSHIP', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_user_role';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === 'F0EF0C4174A883BF639E2EB0C8735239';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role', SYNCED:'1',
          values:[
            { action:'update', RELATIONSHIP_INSTANCE_GUID: currentRelationshipGUID},
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'CHANGE_TO_EXPIRED_RELATIONSHIP', msgType: 'E'}]);
        done();
      })
    });

    it('should delete a future relationship', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_user_role';
      });
      let futureRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === 'F914BC7E2BD65D42A0B17FBEAD8E1AF2';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action:'delete', RELATIONSHIP_INSTANCE_GUID: futureRelationshipGUID},
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        should(err).eql(null);
        done();
      })
    })
  });

  describe('Overwrite an Entity', function () {
    it('should report error as relationship not allow overwrite', function (done) {
      let overwriteInstance = {
        INSTANCE_GUID: instance.INSTANCE_GUID, ENTITY_ID: 'person',
        person: {GENDER: 'male', HEIGHT: 171,HOBBY: 'Reading, Movie, Coding, Bike',
                 FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E' },
        r_employee:
          [{USER_ID: 'DH999', COMPANY_ID: 'Darkhouse', DEPARTMENT_ID: 'Development',
            TITLE: 'Developer', GENDER: 'Male'
          }],
        r_email:
          [{EMAIL: 'dh999@hotmail.com', TYPE: null, PRIMARY: 1}],
        r_user:
          [{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: null, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: null, MIDDLE_NAME: null
          }],
        relationships:[]
      };
      entity.overwriteInstance(overwriteInstance, function (err) {
        err.should.containDeep([{msgName: 'OVERWRITE_RELATIONSHIPS_NOT_ALLOWED'}]);
        done()
      })
    });

    it('should report error as primary key is missing', function (done) {
      let overwriteInstance = {
        INSTANCE_GUID: instance.INSTANCE_GUID, ENTITY_ID: 'person',
        person: {GENDER: 'male', HEIGHT: 171,HOBBY: 'Reading, Movie, Coding, Bike',
          FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E' },
        r_employee:
          [{COMPANY_ID: 'Darkhouse', DEPARTMENT_ID: 'Development',
            TITLE: 'Developer', GENDER: 'Male'
          }],
        r_email:
          [{EMAIL: 'dh999@hotmail.com', TYPE: null, PRIMARY: 1}],
        r_user:
          [{USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: null, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: null, MIDDLE_NAME: null
          }]
      };
      entity.overwriteInstance(overwriteInstance, function (err) {
        err.should.containDeep([{msgName: 'PRIMARY_KEY_MISSING'}]);
        done()
      })
    });

    it('should overwrite the instance succesfully', function (done) {
      let overwriteInstance = {
        INSTANCE_GUID: instance.INSTANCE_GUID, ENTITY_ID: 'person',
        person: {GENDER: 'male', HEIGHT: 180, HOBBY: 'Reading, Movie',
          FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E' },
        r_employee:
          [{USER_ID: 'DH999', COMPANY_ID: 'Darkhouse', DEPARTMENT_ID: 'Development',
            TITLE: 'Developer', GENDER: 'Male'
          }],
        r_email:
          [{EMAIL: 'dh999@outlook.com', TYPE: null, PRIMARY: 1},
            {EMAIL: 'dh999@darkhouse.com', TYPE: null, PRIMARY: 0}],
        r_user:
          [{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: null, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: 'Kai', MIDDLE_NAME: null
          }]
      };
      entity.overwriteInstance(overwriteInstance, function (err) {
        should(err).eql(null);
        entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, newInstance) {
          newInstance.person.should.containDeep([{GENDER: 'male', HEIGHT: 180, HOBBY: 'Reading, Movie',
            FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E' }]);
          newInstance.r_user.should.containDeep([{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: null, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: 'Kai', MIDDLE_NAME: null
          }]);
          newInstance.r_email.should.containDeep([{EMAIL: 'dh999@outlook.com', TYPE: null, PRIMARY: 1},
            {EMAIL: 'dh999@darkhouse.com', TYPE: null, PRIMARY: 0}]);
          newInstance.r_employee.should.containDeep([{USER_ID: 'DH999', COMPANY_ID: 'Darkhouse', DEPARTMENT_ID: 'Development',
            TITLE: 'Developer', GENDER: 'Male'}]);
          should(newInstance.r_address === undefined).be.true;
          should(newInstance.r_personalization === undefined).be.true;
          done();
        });
      })
    });

  });

  describe('Entity Deletion', function () {
    it('should soft delete an instance', function (done) {
      entity.softDeleteInstanceByID({RELATION_ID: 'person', FINGER_PRINT: instance.person.FINGER_PRINT}, function (err) {
        should(err).eql(null);
        let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
          r_user : {action:'update', USER_ID: 'DH999', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
        entity.changeInstance(instance3, function (err) {
          err.should.containDeep([{
            msgCat: 'ENTITY',
            msgName: 'INSTANCE_MARKED_DELETE',
            msgType: 'E'
          }]);
          done();
        });
      })
    });

    it('should restore an instance', function (done) {
      entity.restoreInstanceByGUID(instance.INSTANCE_GUID, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should fail to delete the instance from DB', function (done) {
      entity.hardDeleteByID({RELATION_ID: 'r_user', USER_NAME: 'VINCEZK'}, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'INSTANCE_NOT_MARKED_DELETE',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should soft delete an instance by GUID', function (done) {
      // instance.INSTANCE_GUID = 'CFCCBCF0DAB411E88EFC45AED60FB8CB';
      entity.softDeleteInstanceByGUID(instance.INSTANCE_GUID, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should delete the instance from DB', function (done) {
      entity.hardDeleteByGUID(instance.INSTANCE_GUID, function (err) {
        should(err).eql(null);
        done();
      })
    });
  });

  after('Close the MDB', function (done) {
    entity.entityDB.closeMDB(done);
  })
});
