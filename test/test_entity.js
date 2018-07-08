/**
 * Created by VinceZK on 06/29/18.
 */
const entity = require('../server/models/entity.js');
const timeUtil = require('../server/util/date_time.js');
const _ = require('underscore');

describe('entity tests', function () {
  before(function (done) {
    entity.entityDB.loadEntity('person', done);
  });

  let instance =
    { ENTITY_ID: 'person',
      HOBBY: ['Reading', 'Movie', 'Coding'], HEIGHT: '170', GENDER: 'male', FINGER_PRINT: 'CA67DE15727C72961EB4B6B59B76743E',
      r_user: {USER_ID: 'DH001', USER_NAME:'VINCEZK', DISPLAY_NAME: 'Vincent Zhang'},
      r_email: [{EMAIL: 'zklee@hotmail.com', TYPE: 'private', PRIMARY:1},
                {EMAIL: 'vinentzklee@gmail.com', TYPE: 'private important', PRIMARY:0}
        ],
      r_address: [{COUNTRY: 'China', CITY:'Shanghai', POSTCODE: 201202,
                   ADDRESS_VALUE:'Room #402, Building #41, Dongjing Road #393',
                   TYPE: 'Current Live', PRIMARY:1},
                  {COUNTRY: 'China', CITY:'Haimen', POSTCODE: 226126,
                   ADDRESS_VALUE:'Group 8 Lizhu Tangjia',
                   TYPE: 'Born Place', PRIMARY:0}],
      r_employee: {USER_ID: 'DH001', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Male'},
      relationships:[
         {RELATIONSHIP_ID: 'user_role', SELF_ROLE_ID: 'system_user', PARTNER_ROLE_ID: 'system_role', PARTNER_ENTITY_ID: 'system_role',
           values:[{INSTANCE_GUID: '5F50DE92743683E1ED7F964E5B9F6167'}]
           }]
    };

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
      {USER_ID: 'DH001', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Developer', GENDER:'Male'},
      {USER_ID: 'DH002', COMPANY_ID:'Darkhouse', DEPARTMENT_ID: 'Development', TITLE: 'Director', GENDER:'Male'}
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
      {action: 'delete', EMAIL: 'zklee@hotmail.com', TYPE: 'private', PRIMARY:1},
      {action: 'update', EMAIL: 'vinentzklee@gmail.com', TYPE: 'private important', PRIMARY:0}
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
    entity.getInstanceByID({RELATION_ID: 'r_user', USER_ID: 'DH001'}, function (err, instance2) {
      should(err).eql(null);
      instance2.ENTITY_ID.should.eql(instance.ENTITY_ID);
      instance2.HOBBY.should.eql(instance.HOBBY);
      instance2.r_user.should.containDeep([instance.r_user]);
      instance2.r_email.should.containDeep(instance.r_email);
      instance2.r_address.should.containDeep(instance.r_address);
      instance2.r_employee.should.containDeep([instance.r_employee]);
      instance2.relationships.should.containDeep(instance.relationships);
      done();
    })
  });

  it('should change attributes of the instance', function (done) {
    let instance3 =
      {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        HOBBY : ['Reading', 'Movie', 'Coding', 'Bike'],
        HEIGHT : '171',
        r_user : {action:'update', USER_ID: 'DH001', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'},
        r_email: [{action:'delete', EMAIL: 'zklee@hotmail.com'},
                  {action:'update', EMAIL: 'vinentzklee@gmail.com', PRIMARY:1},
                  {action:'add', EMAIL: 'vincent.zhang@sap.com', TYPE: 'work', PRIMARY:0},
                  {EMAIL: 'zklee@hotmail.com', TYPE: 'private', PRIMARY:0}],
        relationships:[
          {RELATIONSHIP_ID: 'user_role', PARTNER_ENTITY_ID: 'system_role', PARTNER_ROLE_ID: 'system_role',
            values:[{INSTANCE_GUID: '5F50DE92743683E1ED7F964E5B9F6167',
                     VALID_TO:timeUtil.getCurrentDateTime("yyyy-MM-dd HH:mm:ss")},
                    {INSTANCE_GUID: 'F0EF0C4174A883BF639E2EB0C8735239'}]
          }]
    };
    entity.changeInstance(instance3, function(err){
      should(err).eql(null);
      entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, instance2) {
        should(err).eql(null);
        instance2.HOBBY.should.eql(instance3.HOBBY);
        instance2.HEIGHT.should.eql(instance3.HEIGHT);
        delete instance3.r_user.action;
        instance2.r_user.should.containDeep([instance3.r_user]);
        instance2.r_email.should.containDeep([{EMAIL: 'vincent.zhang@sap.com'},
          {EMAIL: 'vinentzklee@gmail.com', PRIMARY:1},{EMAIL: 'zklee@hotmail.com', TYPE: 'private', PRIMARY:0}]);
        instance2.relationships.should.containDeep(instance3.relationships);
        done();
      });
    })
  });

  it('should report an error as ENTITY_ID is not provided', function (done) {
    let instance3 = {INSTANCE_GUID: instance.INSTANCE_GUID,
                     r_user : {action:'update', USER_ID: 'DH001', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
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
      r_user : {USER_ID: 'DH002', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
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
                     r_personalization : {USER_ID: 'DH001', TIMEZONE: ' UTC+8', LANGUAGE: 'ZH'}};
    entity.changeInstance(instance3, function(err){
      should(err).eql(null);
      done();
    })
  });

  it('should be failed to add personalization, as it is [0..1] and already exists', function (done) {
    let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
      r_personalization : {USER_ID: 'DH001', TIMEZONE: ' UTC+8', LANGUAGE: 'EN', DATE_FORMAT: 'YYYY/MM/DD hh:mm:ss'}};
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
      r_email : [{action:'delete', EMAIL: 'vinentzklee@gmail.com', PRIMARY:1},
                 {action:'delete', EMAIL: 'vincent.zhang@sap.com'},
                 {action:'delete', EMAIL: 'zklee@hotmail.com', PRIMARY:0}]};
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
      r_email : [{action:'delete', EMAIL: 'vinentzklee@gmail.com', PRIMARY:1},
                 {action:'delete', EMAIL: 'vincent.zhang@sap.com'},
                 {action:'delete', EMAIL: 'zklee@hotmail.com', PRIMARY:0},
                 {action:'add', EMAIL: 'zklee@hotmail.com', PRIMARY:1}]};
    entity.changeInstance(instance3, function(err){
      should(err).eql(null);
      done();
    })
  });

  it('should failed to delete r_user as it is [1..1]', function (done) {
    let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
                     r_user : {action: 'delete',USER_ID: 'DH001'}};
    entity.changeInstance(instance3, function(err){
      err.should.containDeep([{
        msgCat: 'ENTITY',
        msgName: 'MANDATORY_RELATION_MISSING',
        msgType: 'E'
      }]);
      done();
    })
  });

  it('should soft delete an instance', function (done) {
    entity.softDeleteInstanceByID({RELATION_ID: 'person', FINGER_PRINT: instance.FINGER_PRINT}, function (err) {
      should(err).eql(null);
      let instance3 = {ENTITY_ID: 'person', INSTANCE_GUID: instance.INSTANCE_GUID,
        r_user : {action:'update', USER_ID: 'DH001', DISPLAY_NAME: 'Zhang Kai', FAMILY_NAME: 'Zhang'}};
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
      err.should.containDeep({
        msgCat: 'ENTITY',
        msgName: 'INSTANCE_NOT_MARKED_DELETE',
        msgType: 'E'
      });
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

  after('Close the MDB', function (done) {
    // entity.entityDB.closeMDB(done);
    done();
  })
});
