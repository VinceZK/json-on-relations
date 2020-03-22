/**
 * Created by VinceZK on 06/29/18.
 */
const entity = require('../server/models/entity.js');
const _ = require('underscore');

describe.only('entity tests', function () {
  let instance =
    { ENTITY_ID: 'person',
      person: {HEIGHT: 1.70, GENDER: 'Male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E', HOBBY:'Reading, Movie, Coding',
               TYPE: 'employee', SYSTEM_ACCESS: 'PORTAL'},
      r_user: {USER_ID: 'DH999', USER_NAME:'VINCEZK', DISPLAY_NAME: 'Vincent Zhang'},
      r_email: [{EMAIL: 'dh999@hotmail.com', TYPE: 'PRIVATE', PRIMARY:1},
                {EMAIL: 'dh999@gmail.com', TYPE: 'WORK', PRIMARY:0}
        ],
      r_address: [{COUNTRY: 'China', CITY:'Shanghai', POSTCODE: 201202,
                   ADDRESS_VALUE:'Room #402, Building #41, Dongjing Road #393',
                   TYPE: 'CLIVE', PRIMARY:1},
                  {COUNTRY: 'China', CITY:'Haimen', POSTCODE: 226126,
                   ADDRESS_VALUE:'Group 8 Lizhu Tangjia',
                   TYPE: 'WORK', PRIMARY:0}],
      r_employee: {USER_ID: 'DH999', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT', TITLE: 'Developer', GENDER:'Male'},
      relationships:[
         { RELATIONSHIP_ID: 'rs_user_role',
           values:[
             {action:'add', SYNCED:0,
               PARTNER_INSTANCES:[{ENTITY_ID:'permission', ROLE_ID:'system_role',
                 INSTANCE_GUID:'391E75B02A1811E981F3C33C6FB0A7C1', NO_EXISTING_CHECK: false}]}
           ]
           }]
    };
  let wifeInstanceGUID;

  describe('Entity Creation', function () {
    it('should not create an instance as mandatory relation is missing 1', function(done){
      let instance2 = _.clone(instance);
      delete instance2.person;
      entity.createInstance(instance2, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'MANDATORY_RELATION_MISSING',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should not create an instance as mandatory relation is missing 2', function(done){
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

    it('should not create an instance for non-exist partner entity', function(done){
      let instance2 = _.clone(instance);
      instance2.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            {action:'add', SYNCED:0,
              PARTNER_INSTANCES:[{ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167'}]},
            {action:'add', SYNCED:0,
              PARTNER_INSTANCES:[{ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:''}]}
          ]
        }];
      entity.createInstance(instance2, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'ENTITY_INSTANCE_NOT_EXIST',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should create an instance of person', function (done) {
      entity.createInstance(instance, function (errs) {
        should(errs).eql(null);
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
    });

    it('should fail to create an instance with relation of a disabled role', function (done) {
      let instance2 = { ENTITY_ID: 'person',
        person: {HEIGHT: 165, GENDER: 'female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama',
          TYPE: 'employee'},
        r_user: [{USER_ID: 'DH998', USER_NAME:'Jessy', DISPLAY_NAME: 'Jessy Huang'}],
        r_email: [{EMAIL: 'dh998@hotmail.com', TYPE: 'private', PRIMARY:1}],
        r_address: [],
        r_employee: {USER_ID: 'DH998', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
        r_personalization: {}
      };
      entity.createInstance(instance2, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATION_NOT_VALID',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should fail to create an instance with relationship of a disabled role', function (done) {
      let instance2 = { ENTITY_ID: 'person',
        person: {HEIGHT: 165, GENDER: 'female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama',
          TYPE: 'employee'},
        r_email: [{EMAIL: 'dh998@hotmail.com', TYPE: 'private', PRIMARY:1}],
        r_address: [],
        r_employee: {USER_ID: 'DH998', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
        relationships:[
          { RELATIONSHIP_ID: 'rs_user_role',
            values:[
              {action:'add', SYNCED:0,
                PARTNER_INSTANCES:[{ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167'}]}
            ]
          }]
      };
      entity.createInstance(instance2, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATIONSHIP_NOT_VALID',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should fail to create an instance, because of invalid gender', function (done) {
      let instance2 = { ENTITY_ID: 'person',
        person: {HEIGHT: 1.65, GENDER: 'invalid', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama',
          TYPE: 'employee'},
        r_email: [{EMAIL: 'dh998@hotmail.com', TYPE: 'PRIVATE', PRIMARY:1}],
        r_address: [],
        r_employee: {USER_ID: 'DH998', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
      };
      entity.createInstance(instance2, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'INVALID_VALUE_IN_DOMAIN',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should fail to create an instance, because of invalid email', function (done) {
      let instance2 = { ENTITY_ID: 'person',
        person: {HEIGHT: 1.65, GENDER: 'Female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama',
          TYPE: 'employee'},
        r_email: [{EMAIL: 'invalid Email', TYPE: 'PRIVATE', PRIMARY:1}],
        r_address: [],
        r_employee: {USER_ID: 'DH998', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
      };
      entity.createInstance(instance2, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'NOT_MATCH_REGEXP',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should create an instance of a female person', function (done) {
      let instance2 = { ENTITY_ID: 'person',
        person: {HEIGHT: 1.65, GENDER: 'Female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama',
                 TYPE: 'employee'},
        r_email: [{EMAIL: 'dh998@hotmail.com', TYPE: 'PRIVATE', PRIMARY:1}],
        r_address: [],
        r_employee: {USER_ID: 'DH998', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
      };
      entity.createInstance(instance2, function (err) {
        should(err).eql(null);
        wifeInstanceGUID = instance2.INSTANCE_GUID;
        done();
      });
    });

    it('should get an instance of the female person', function (done) {
      entity.getInstanceByGUID(wifeInstanceGUID, function (err, instance2) {
        should(err).eql(null);
        instance2.person.should.containDeep([
          {HEIGHT: 1.65, GENDER: 'Female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F',
            HOBBY:'Drama', TYPE: 'employee'}]);
        (instance2.r_user === undefined).should.true();
        (instance2.r_personalization === undefined).should.true();
        instance2.r_email.should.containDeep(
          [{EMAIL: 'dh998@hotmail.com', TYPE: 'PRIVATE', PRIMARY:1}]);
        (instance2.r_address === undefined).should.true();
        instance2.r_employee.should.containDeep([
          {USER_ID: 'DH998', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT', TITLE: 'Tester', GENDER:'Female'}]);
        done();
      })
    });

    it('should get pieces of the female person', function (done) {
      let piece = {RELATIONS: ['r_user', 'r_email'], RELATIONSHIPS: ['rs_user_role'] };
      entity.getInstancePieceByID({RELATION_ID: 'r_employee', USER_ID: 'DH998'}, piece,
        function (err) {
          err.should.containDeep([{
            msgCat: 'ENTITY',
            msgName: 'RELATION_NOT_VALID',
            msgType: 'E'
          }]);
          done();
      })
    });
  });

  describe('Entity Changing', function () {
    it('should change attributes of the instance', function (done) {
      let instance3 =
        {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
          person: {action:'update', HOBBY:'Reading, Movie, Coding, Bike', HEIGHT: 1.71 },
          r_user : {action:'update', USER_ID: 'DH999', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'},
          r_email: [
            {action:'delete', EMAIL: 'dh999@hotmail.com'},
            {action:'update', EMAIL: 'dh999@gmail.com', PRIMARY:1},
            {action:'add', EMAIL: 'dh999@sap.com', TYPE: 'WORK', PRIMARY:0},
            {EMAIL: 'dh999@hotmail.com', TYPE: 'PRIVATE', PRIMARY:0}],
          relationships:[
            { RELATIONSHIP_ID: 'rs_user_role',
              values:[
                {action:'add', SYNCED: 1,
                  PARTNER_INSTANCES:[
                    {ENTITY_ID:'permission', ROLE_ID:'system_role', INSTANCE_GUID:'23F3AE905E8311E9A91C03500E3C8091'}
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
            {EMAIL: 'dh999@gmail.com', PRIMARY:1},{EMAIL: 'dh999@hotmail.com', TYPE: 'PRIVATE', PRIMARY:0}]);
          delete instance3.relationships[0].values[0].action;
          instance2.relationships.should.containDeep(instance3.relationships);
          done();
        });
      })
    });

    it('should report an error as the INSTANCE_GUID does not exit', function (done) {
      let instance3 = {ENTITY_ID:"person",INSTANCE_GUID:"3AD9A9F0840F11E995EFADDBF5879A0E",
        person:{action:"update",GENDER:"male",HEIGHT:"175"}};
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'ENTITY_INSTANCE_NOT_EXIST',
          msgType: 'E'
        }]);
        done();
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

    it('should add user personalization successfully', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_personalization : {USER_ID: 'DH999', TIMEZONE: 'UTC+8', LANGUAGE: 'ZH'}};
      entity.changeInstance(instance3, function(err){
        should(err).eql(null);
        done();
      })
    });

    it('should be failed to add personalization, as it is [0..1] and already exists', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_personalization : {USER_ID: 'DH999', TIMEZONE: 'UTC+8', LANGUAGE: 'EN', DATE_FORMAT: 3}};
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

    it('should fail to delete r_user as it is [1..1]', function (done) {
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

    it('should be failed to change to an invalid gender', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        person : {action: 'update', GENDER: 'INVALID'} };
      entity.changeInstance(instance3, function(err){
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'INVALID_VALUE_IN_DOMAIN',
          msgType: 'E'
        }]);
        done();
      })
    });

    it('should disable the relations & relationships of role employee', function (done) {
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        person : {action: 'update', SYSTEM_ACCESS: ''}};
      entity.changeInstance(instance3, function(err){
        should(err).eql(null);
        entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, instance2) {
          should(err).eql(null);
          (instance2.r_user === undefined).should.true();
          (instance2.r_personalization === undefined).should.true();
          instance2.relationships.length.should.eql(0);
          instance3.person.SYSTEM_ACCESS = 'PORTAL';
          entity.changeInstance(instance3, function (err) {
            should(err).eql(null);
            done();
          });
        });
      });
    });

    it('should fail to change a person with invalid relation', function (done) {
      let instance3 = {
        ENTITY_ID: 'person', INSTANCE_GUID: wifeInstanceGUID,
        r_user : {USER_ID: 'DH998', USER_NAME:'Jessy', DISPLAY_NAME: 'Jessy Huang'}
      };
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATION_NOT_VALID',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should fail to change a person with invalid relationship', function (done) {
      let instance3 = {
        ENTITY_ID: 'person', INSTANCE_GUID: wifeInstanceGUID,
        relationships: [
          { RELATIONSHIP_ID: 'rs_user_role',
            values:[
              { action: 'add', SYNCED: 0,
                PARTNER_INSTANCES:[
                  {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
                ]}
            ]
          }
        ]
      };
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{
          msgCat: 'ENTITY',
          msgName: 'RELATIONSHIP_NOT_VALID',
          msgType: 'E'
        }]);
        done();
      });
    });

    it('should change the female person successfully', function (done) {
      let instance3 = {
        ENTITY_ID: 'person', INSTANCE_GUID: wifeInstanceGUID,
        person: {action: 'update', SYSTEM_ACCESS: 'PORTAL'},
        r_user: {USER_ID: 'DH998', USER_NAME:'Jessy', DISPLAY_NAME: 'Jessy Huang'}
      };
      entity.changeInstance(instance3, function (err) {
        should(err).eql(null);
        done();
      });
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
  });

  describe('Relationship tests(time dependent)', function () {
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

    it('should report an error of RELATIONSHIP_NOT_VALID', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_mtest01',
          values:[
            { action: 'extend', VALID_TO:'2030-12-31 00:00:00', SYNCED: 1}]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_NOT_VALID', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_GUID_MISSING', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_user_role',
          values:[
            { action: 'update', SYNCED: 1}]
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
            { action: 'add', SYNCED: 1}
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
            { action: 'add', SYNCED: 0,
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
            { action: 'add', SYNCED: 0,
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
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2017-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', REG_PLACE: 'SH',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: wifeInstanceGUID }
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
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2031-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', REG_PLACE: 'SH',
              PARTNER_INSTANCES:[
                {ENTITY_ID: 'person', ROLE_ID: 'wife', INSTANCE_GUID: wifeInstanceGUID }
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
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_TO:'2028-12-31 00:00:00',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'7B36CB959C06B2CAEB89C93EDFB30510' }
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

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..1]', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2025-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00', REG_PLACE: 'HM',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: wifeInstanceGUID }
              ]},
            { action: 'add', VALID_FROM:'2027-12-31 00:00:00', VALID_TO:'2035-12-31 00:00:00', REG_PLACE: 'SH',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: wifeInstanceGUID }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        err.should.containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    it.skip('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..n]', function (done) {
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', VALID_FROM:'2020-12-31 00:00:00', VALID_TO:'2030-12-31 00:00:00',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' }
              ]},
            { action: 'add', VALID_FROM:'2025-12-31 00:00:00', VALID_TO:'2035-12-31 00:00:00',
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

    it.skip('should report an error of RELATIONSHIP_INSTANCE_OVERLAP [1..n] in DB', function (done) {
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
            { action: 'add', SYNCED: 1,
              PARTNER_INSTANCES:[
                {ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'AF7E5550E7E511E992DC7BC6FE1F471B' }
              ]}
          ]
        },
        {
          RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'add', REG_PLACE: 'Shanghai', COUNTRY: 'CHINA',
              PARTNER_INSTANCES:[
               {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: wifeInstanceGUID }
              ]
            },
            { action: 'add', VALID_FROM: '2050-12-31 00:00:00', REG_PLACE: 'Dark side of Moon',
              PARTNER_INSTANCES:[
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: '430C8BB0E1C611E8877F9D5C9668A7A3' }
              ]
            }
          ]
        }
      ];
      entity.changeInstance(instance3, function (err) {
        should(err).eql(null);
        entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH999'}, function (err, newInstance){
          should(err).eql(null);
          instance2 = newInstance;
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
                {ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: wifeInstanceGUID }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance3, function (errs) {
        should(errs).containDeep([{msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'}]);
        done();
      })
    });

    /**
     * Current relationships in DB
     * [ { RELATIONSHIP_ID: 'rs_marriage', SELF_ROLE_ID: 'husband',
           values:
           [{ RELATIONSHIP_INSTANCE_GUID: '485769E06E5311E9A28C5B3C9CFBBB00',
              PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'wife', INSTANCE_GUID: '4835B1106E5311E9A28C5B3C9CFBBB00' } ],
              VALID_FROM: '2019-05-04 17:59:18', VALID_TO: '2029-05-04 17:59:18', REG_PLACE: Shanghai, COUNTRY: CHINA },
            { RELATIONSHIP_INSTANCE_GUID: '485769E06E5311E9A28C5B3C9CFBBB00',
              PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'wife', INSTANCE_GUID: '430C8BB0E1C611E8877F9D5C9668A7A3' } ],
              VALID_FROM: '2050-12-31 00:00:00', VALID_TO: '2060-12-28 00:00:00', REG_PLACE: 'Dark side of Moon', COUNTRY: null },
            ]},

         { RELATIONSHIP_ID: 'rs_user_role', SELF_ROLE_ID: 'system_user',
           values:
           [{ RELATIONSHIP_INSTANCE_GUID: '4829A3206E5311E9A28C5B3C9CFBBB00', SYNCED: '0',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'5F50DE92743683E1ED7F964E5B9F6167' } ]},
            { RELATIONSHIP_INSTANCE_GUID: '483A93106E5311E9A28C5B3C9CFBBB00', SYNCED: '1',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'F0EF0C4174A883BF639E2EB0C8735239' } ]},
            { RELATIONSHIP_INSTANCE_GUID: '485742D06E5311E9A28C5B3C9CFBBB00', SYNCED: '1',
              PARTNER_INSTANCES: [{ENTITY_ID:'permission',ROLE_ID:'system_role',INSTANCE_GUID:'F914BC7E2BD65D42A0B17FBEAD8E1AF2' } ]}
            ]}
     ]
     */
    it('should read the instance', function (done) {
      entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH999'}, function (err, instancex){
        should(err).eql(null);
        instance2 = instancex;
        done();
      });
    });

    it('should get pieces of an instance with additional partner entity information', function (done) {
      let piece = {
        RELATIONS: ['r_user'],
        RELATIONSHIPS: [
          {RELATIONSHIP_ID: 'rs_marriage',
            PARTNER_ENTITY_PIECES: {
              RELATIONSHIPS: ['rs_marriage']
            }}] };
      entity.getInstancePieceByGUID(instance.INSTANCE_GUID, piece, function (err, instancePiece) {
        should(err).eql(null);

        // instancePiece.relationships[0].values.forEach(value => console.log(value.PARTNER_INSTANCES[0]));
        instancePiece.r_user.should.containDeep(instance2.r_user);
        instancePiece.relationships[0].values[0].PARTNER_INSTANCES[0].should.containDeep(
          { ENTITY_ID: 'person',
            ROLE_ID: 'wife',
            INSTANCE_GUID: wifeInstanceGUID,
            relationships:
              [ { RELATIONSHIP_ID: 'rs_marriage',
                  SELF_ROLE_ID: 'wife'} ],
          });
        done();
      })
    });

    it('should get pieces of an instance with complex partner information', function (done) {
      let piece = {
        RELATIONSHIPS:
          [
            {
              RELATIONSHIP_ID: 'rs_marriage',
              PARTNER_ENTITY_PIECES: [
                { ENTITY_ID: 'person',
                  piece: {RELATIONS: ['r_user'], RELATIONSHIPS: ['rs_marriage']}
                }
              ]
            },
            {
              RELATIONSHIP_ID: 'rs_user_role',
              PARTNER_ENTITY_PIECES: [
                { ENTITY_ID: 'permission',
                  piece: {RELATIONS: ['r_role'], RELATIONSHIPS: ['rs_user_role']}
                }
              ]
            },
          ]
      };
      entity.getInstancePieceByGUID(instance.INSTANCE_GUID, piece, function (err, instancePiece) {
        should(err).eql(null);
        instancePiece.relationships.should.containDeep([
          { RELATIONSHIP_ID: 'rs_marriage',
            SELF_ROLE_ID: 'husband'},
          { RELATIONSHIP_ID: 'rs_user_role',
            SELF_ROLE_ID: 'system_user'},
        ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_DELETION_NOT_ALLOWED', function (done) {
      let userRoleRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_marriage';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === wifeInstanceGUID;
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
          values:[
            { action: 'delete', RELATIONSHIP_INSTANCE_GUID: currentRelationshipGUID }
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
        return relationship.RELATIONSHIP_ID === 'rs_marriage';
      });
      let futureRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === '430C8BB0E1C611E8877F9D5C9668A7A3';
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
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
        return relationship.RELATIONSHIP_ID === 'rs_marriage';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === wifeInstanceGUID;
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
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
        return relationship.RELATIONSHIP_ID === 'rs_marriage';
      });
      let currentRelationshipGUID = userRoleRelationship.values.find(function (value) {
        return value.PARTNER_INSTANCES[0].INSTANCE_GUID === wifeInstanceGUID;
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage', REG_PLACE: 'HAIMEN',
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
      let marriageRelationship = instance2.relationships.find(function (relationship) {
        return relationship.RELATIONSHIP_ID === 'rs_marriage';
      });
      let futureRelationshipGUID = marriageRelationship.values.find(function (value) {
        return new Date(value.VALID_FROM) > new Date();
      }).RELATIONSHIP_INSTANCE_GUID;
      instance3.relationships = [
        { RELATIONSHIP_ID: 'rs_marriage',
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

  describe('Relationship tests(time independent)', function () {
    let instance4;
    let relationshipGUID;
    before(function () { // Using the category: Demo
      instance4 = {ENTITY_ID: 'category', INSTANCE_GUID: '3D9D0AE02A1611E9BBE39B9C6748A022'};
    });

    it('should report an error of RELATIONSHIP_IS_NOT_TIME_DEPENDENT', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'expire', RELATIONSHIP_INSTANCE_GUID: '6A56A3D02A1A11E981F3C33C6FB0A7C1'}]
        }
      ];
      entity.changeInstance(instance4, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_IS_NOT_TIME_DEPENDENT', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_IS_NOT_TIME_DEPENDENT', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'extend', RELATIONSHIP_INSTANCE_GUID: '6A56A3D02A1A11E981F3C33C6FB0A7C1'}]
        }
      ];
      entity.changeInstance(instance4, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_IS_NOT_TIME_DEPENDENT', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP before inserting', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'add',
              PARTNER_INSTANCES:[ // App Modeling
                {ENTITY_ID:'app',ROLE_ID:'portal_app',INSTANCE_GUID:'568822C02A0B11E98FB33576955DB73A' }
              ]},
            { action: 'add',
              PARTNER_INSTANCES:[ // App Modeling
                {ENTITY_ID:'app',ROLE_ID:'portal_app',INSTANCE_GUID:'568822C02A0B11E98FB33576955DB73A' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance4, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'} ]);
        done();
      })
    });

    it('should report an error of RELATIONSHIP_INSTANCE_OVERLAP after inserting', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'add',
              PARTNER_INSTANCES:[ // App Bubble
                {ENTITY_ID:'app',ROLE_ID:'portal_app',INSTANCE_GUID:'ABAB7C202A0B11E98FB33576955DB73A' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance4, function (err) {
        err.should.containDeep([ {
          msgCat: 'ENTITY', msgName: 'RELATIONSHIP_INSTANCE_OVERLAP', msgType: 'E'} ]);
        done();
      })
    });

    it('should add an app to the category successfully', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'add',
              PARTNER_INSTANCES:[ // App Modeling
                {ENTITY_ID:'app',ROLE_ID:'portal_app',INSTANCE_GUID:'568822C02A0B11E98FB33576955DB73A' }
              ]}
          ]
        }
      ];
      entity.changeInstance(instance4, function (err) {
        should(err).eql(null);
        entity.getInstanceByGUID('568822C02A0B11E98FB33576955DB73A', function (err, result) {
          const relationship = result['relationships'][0];
          relationshipGUID = relationship.values.find(
            value => value.PARTNER_INSTANCES[0].INSTANCE_GUID === '3D9D0AE02A1611E9BBE39B9C6748A022')
            .RELATIONSHIP_INSTANCE_GUID;
          done();
        });
      })
    });

    it('should delete an app from the category successfully', function (done) {
      instance4.relationships = [
        { RELATIONSHIP_ID: 'rs_app_category',
          values:[
            { action: 'delete', RELATIONSHIP_INSTANCE_GUID: relationshipGUID}
          ]
        }
      ];
      entity.changeInstance(instance4, function (err) {
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

    it('should overwrite the instance successfully', function (done) {
      let overwriteInstance = {
        INSTANCE_GUID: instance.INSTANCE_GUID, ENTITY_ID: 'person',
        person: {GENDER: 'Male', HEIGHT: 1.80, HOBBY: 'Reading, Movie',
          FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E'},
        r_employee:
          [{USER_ID: 'DH999', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'Development',
            TITLE: 'Developer', GENDER: 'Male'
          }],
        r_email:
          [{EMAIL: 'dh999@outlook.com', TYPE: 'PRIVATE', PRIMARY: 1},
            {EMAIL: 'dh999@darkhouse.com', TYPE: 'WORK', PRIMARY: 0}],
        r_user:
          [{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: 0, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: 'Kai', MIDDLE_NAME: null
          }],
        r_address: []
      };
      entity.overwriteInstance(overwriteInstance, function (err) {
        should(err).eql(null);
        entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, newInstance) {
          newInstance.person.should.containDeep([{GENDER: 'Male', HEIGHT: 1.80, HOBBY: 'Reading, Movie',
            FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E', TYPE: 'employee', SYSTEM_ACCESS: 'PORTAL' }]);
          newInstance.r_user.should.containDeep([{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: 0, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: 'Kai', MIDDLE_NAME: null
          }]);
          newInstance.r_email.should.containDeep([{EMAIL: 'dh999@outlook.com', TYPE: 'PRIVATE', PRIMARY: 1},
            {EMAIL: 'dh999@darkhouse.com', TYPE: 'WORK', PRIMARY: 0}]);
          newInstance.r_employee.should.containDeep([{USER_ID: 'DH999', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT',
            TITLE: 'Developer', GENDER: 'Male'}]);
          (typeof newInstance.r_address).should.be.equal('undefined');
          (typeof newInstance.r_personalization).should.be.equal('undefined');
          done();
        });
      })
    });

    it('should only overwrite explicated attributes', function (done) {
      let overwriteInstance = {
        INSTANCE_GUID: instance.INSTANCE_GUID, ENTITY_ID: 'person',
        person: { HEIGHT: 1.83},
        r_employee: {USER_ID: 'DH999'},
        r_email: [{EMAIL: 'dh999@outlook.com'}, {EMAIL: 'dh999@darkhouse.com'}],
        r_user: {USER_ID: 'DH999'}
      };
      entity.overwriteInstance(overwriteInstance, function (err) {
        should(err).eql(null);
        entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, newInstance) {
          newInstance.person.should.containDeep([{GENDER: 'Male', HEIGHT: 1.83, HOBBY: 'Reading, Movie',
            FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E' }]);
          newInstance.r_user.should.containDeep([{USER_ID: 'DH999', USER_NAME: 'VINCEZK', PASSWORD: null, PWD_STATE: 0, LOCK: null,
            DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang',GIVEN_NAME: 'Kai', MIDDLE_NAME: null
          }]);
          newInstance.r_email.should.containDeep([{EMAIL: 'dh999@outlook.com', TYPE: 'PRIVATE', PRIMARY: 1},
            {EMAIL: 'dh999@darkhouse.com', TYPE: 'WORK', PRIMARY: 0}]);
          newInstance.r_employee.should.containDeep([{USER_ID: 'DH999', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT',
            TITLE: 'Developer', GENDER: 'Male'}]);
          done();
        });
      })
    });
  });

  describe('Entity Deletion', function () {
    it('should soft delete an instance by GUID', function (done) {
      entity.softDeleteInstanceByGUID(instance.INSTANCE_GUID, function (err) {
        should(err).eql(null);
        done();
      })
    });

    it('should restore an instance', function (done) {
      entity.restoreInstanceByGUID(instance.INSTANCE_GUID, function (errs) {
        should(errs).eql(null);
        done();
      })
    });

    it('should soft delete an instance by ID', function (done) {
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

    it('should restore an instance by ID', function (done) {
      entity.restoreInstanceByID({RELATION_ID: 'person', FINGER_PRINT: instance.person.FINGER_PRINT}, function (err) {
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

    it('should delete the female instance from DB', function (done) {
      entity.softDeleteInstanceByID({RELATION_ID: 'r_employee', USER_ID: 'DH998'}, function (err) {
        should(err).eql(null);
        entity.hardDeleteByID({RELATION_ID: 'r_employee', USER_ID: 'DH998'}, function (err) {
          should(err).eql(null);
          done();
        })
      })
    })
  });

  describe( 'orchestration', function () {
    const instance1 = { ENTITY_ID: 'person',
      person: {HEIGHT: 1.75, GENDER: 'Male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E', HOBBY:'Game', TYPE: 'employee'},
      r_email: [{EMAIL: 'DH999@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY:1}],
      r_employee: {USER_ID: 'DH999', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Male'}
    };
    const instance2 = { ENTITY_ID: 'person',
      person: {HEIGHT: 1.65, GENDER: 'Female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F', HOBBY:'Drama', TYPE: 'employee'},
      r_email: [{EMAIL: 'DH998@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY:1}],
      r_employee: {USER_ID: 'DH998', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Tester', GENDER:'Female'},
      relationships: [{ RELATIONSHIP_ID: 'rs_marriage',  values:[
        { action: 'add', VALID_FROM:'', VALID_TO:'2030-12-31 00:00:00', REG_PLACE: 'SH',
          PARTNER_INSTANCES:[{ENTITY_ID:'person',ROLE_ID:'husband',INSTANCE_GUID: '', NO_EXISTING_CHECK: true}]}]}]};
    const instance3 = { ENTITY_ID: 'person',
      person: {HEIGHT: 1.65, GENDER: 'Female', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743G', HOBBY:'Drawing', TYPE: 'employee'},
      r_email: [{EMAIL: 'DH997@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY:1}],
      r_employee: {USER_ID: 'DH997', COMPANY_ID:'DARKHOUSE', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Female'},
    };
    const operations = [
      {
        action: 'createInstance',
        noCommit: true,
        instance: instance1
      },
      {
        action: 'createInstance',
        noCommit: true,
        replacements: [{
          movePath: [0, 'result', 'instance', 'INSTANCE_GUID'],
          toPath: ['relationships', 0, 'values', 0, 'PARTNER_INSTANCES', 0, 'INSTANCE_GUID']
        }],
        instance: instance2
      }
    ];

    it('should create a husband and wife pair', function (done) {
      entity.orchestrate( operations, function (errs, results) {
        should(errs).eql(null);
        done();
      })
    });

    it('should return a husband and wife pair', function (done) {
      const getOperations = [
        {
          action: 'getInstancePieceByGUID',
          instance: {INSTANCE_GUID: operations[0].result.instance.INSTANCE_GUID,
            RELATIONS: ['person', 'r_email', 'r_employee'], RELATIONSHIPS: ['rs_marriage']}
        },
        {
          action: 'getInstancePieceByGUID',
          instance: {INSTANCE_GUID: operations[1].result.instance.INSTANCE_GUID,
            RELATIONS: ['person', 'r_email', 'r_employee'], RELATIONSHIPS: ['rs_marriage']}
        }
      ];
      entity.orchestrate( getOperations, function (errs, results) {
        should(errs).eql(null);
        results[0].result.instance.should.containDeep(
          { ENTITY_ID: 'person',
            relationships: [{ RELATIONSHIP_ID: 'rs_marriage', SELF_ROLE_ID: 'husband',
              values: [{PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'wife'} ], REG_PLACE: 'SH', COUNTRY: null}] } ],
            person: [{GENDER: 'Male', HEIGHT: 1.75, HOBBY: 'Game', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E',
              TYPE: 'employee', SYSTEM_ACCESS: null, BIRTHDAY: null } ],
          r_email: [{ EMAIL: 'DH999@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY: 1 } ],
          r_employee: [{USER_ID: 'DH999', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT',
              TITLE: 'Developer', GENDER: 'Male' } ] });
        results[1].result.instance.should.containDeep(
          { ENTITY_ID: 'person',
            relationships: [{ RELATIONSHIP_ID: 'rs_marriage', SELF_ROLE_ID: 'wife',
              values: [{PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'husband'} ], REG_PLACE: 'SH', COUNTRY: null}] } ],
            person: [{GENDER: 'Female', HEIGHT: 1.65, HOBBY: 'Drama', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743F',
              TYPE: 'employee', SYSTEM_ACCESS: null, BIRTHDAY: null } ],
            r_email: [{ EMAIL: 'DH998@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY: 1 } ],
            r_employee: [{USER_ID: 'DH998', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT',
              TITLE: 'Tester', GENDER: 'Female' } ] });
        done();
      })
    });

    it('should create a new female person and change the relationship', function (done) {
      const changeOperations = [
        {
          action: 'createInstance',
          noCommit: true,
          instance: instance3
        },
        {
          action: 'changeInstance',
          noCommit: true,
          replacements: [{
            movePath: [0, 'result', 'instance', 'INSTANCE_GUID'],
            toPath: ['relationships', 0, 'values', 1, 'PARTNER_INSTANCES', 0, 'INSTANCE_GUID']
          }],
          instance: {
            ENTITY_ID: 'person', INSTANCE_GUID: instance1.INSTANCE_GUID,
            relationships: [{ RELATIONSHIP_ID: 'rs_marriage',  values:[
                { action: 'expire', RELATIONSHIP_INSTANCE_GUID: instance2.relationships[0].values[0].RELATIONSHIP_INSTANCE_GUID},
                { action: 'add', VALID_FROM:'', VALID_TO:'2030-12-31 00:00:00', REG_PLACE: 'SH',
                  PARTNER_INSTANCES:[{ENTITY_ID:'person',ROLE_ID:'wife',INSTANCE_GUID: '', NO_EXISTING_CHECK: true}]}]}]
          }
        }
      ];
      entity.orchestrate( changeOperations, function (errs) {
        should(errs).eql(null);
        done();
      })
    });

    it('should return a husband and 2 wives', function (done) {
      const getOperations = [
        {
          action: 'getInstancePieceByGUID',
          instance: {INSTANCE_GUID: instance1.INSTANCE_GUID,
            RELATIONSHIPS: ['rs_marriage']}
        },
        {
          action: 'getInstancePieceByGUID',
          instance: {INSTANCE_GUID: instance2.INSTANCE_GUID,
            RELATIONSHIPS: ['rs_marriage']}
        },
        {
          action: 'getInstancePieceByGUID',
          instance: {INSTANCE_GUID: instance3.INSTANCE_GUID,
            RELATIONS: ['person', 'r_email', 'r_employee'], RELATIONSHIPS: ['rs_marriage']}
        }
      ];
      entity.orchestrate( getOperations, function (errs, results) {
        should(errs).eql(null);
        results[0].result.instance.should.containDeep(
          { relationships:
              [{ RELATIONSHIP_ID: 'rs_marriage', SELF_ROLE_ID: 'husband',
              values: [{PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'wife'} ], REG_PLACE: 'SH', COUNTRY: null}] } ]
          });
        results[1].result.instance.relationships[0].values[0].VALID_FROM.should.eql(
          results[1].result.instance.relationships[0].values[0].VALID_TO
        );
        results[2].result.instance.should.containDeep(
          { ENTITY_ID: 'person',
            relationships: [{ RELATIONSHIP_ID: 'rs_marriage', SELF_ROLE_ID: 'wife',
              values: [{PARTNER_INSTANCES: [{ ENTITY_ID: 'person', ROLE_ID: 'husband'} ], REG_PLACE: 'SH', COUNTRY: null}] } ],
            person: [{GENDER: 'Female', HEIGHT: 1.65, HOBBY: 'Drawing', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743G',
              TYPE: 'employee', SYSTEM_ACCESS: null, BIRTHDAY: null } ],
            r_email: [{ EMAIL: 'DH997@darkhouse.com.cn', TYPE: 'PRIVATE', PRIMARY: 1 } ],
            r_employee: [{USER_ID: 'DH997', COMPANY_ID: 'DARKHOUSE', DEPARTMENT_ID: 'DEVELOPMENT',
              TITLE: 'Developer', GENDER: 'Female' } ] });
        done();
      })
    });

    it('should delete all the instances', function (done) {
      const deleteOperations = [
        {
          action: 'softDeleteInstanceByGUID',
          instance: {INSTANCE_GUID: instance1.INSTANCE_GUID}
        },
        {
          action: 'softDeleteInstanceByGUID',
          instance: {INSTANCE_GUID: instance2.INSTANCE_GUID}
        },
        {
          action: 'softDeleteInstanceByGUID',
          instance: {INSTANCE_GUID: instance3.INSTANCE_GUID}
        },
        {
          action: 'hardDeleteByGUID',
          instance: {INSTANCE_GUID: instance1.INSTANCE_GUID}
        },
        {
          action: 'hardDeleteByGUID',
          instance: {INSTANCE_GUID: instance2.INSTANCE_GUID}
        },
        {
          action: 'hardDeleteByGUID',
          instance: {INSTANCE_GUID: instance3.INSTANCE_GUID}
        }
      ];
      entity.orchestrate( deleteOperations, function (errs) {
        should(errs).eql(null);
        done();
      })
    });
  });

  after('Close the MDB', function (done) {
    entity.entityDB.closeMDB(done);
  })
});
