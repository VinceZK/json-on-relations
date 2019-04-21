const express = require('express');
const router = express.Router();
const entity = require('./controller/entity_ctrl.js');
const query = require('./controller/query_ctrl.js');
const model = require('./controller/model_ctrl.js');
const defaultAddIns = require('./controller/default_addIns_ctrl');
const userFunction = require('./controller/userFunction_ctrl');

// Entity Instance Service
router.post('/api/entity',
  defaultAddIns.beforeEntityCreation,
  entity.createInstance,
  defaultAddIns.afterEntityCreation);
router.put('/api/entity',
  defaultAddIns.beforeEntityChanging,
  entity.changeInstance,
  defaultAddIns.afterEntityChanging);
router.put('/api/entity/overwrite',
  defaultAddIns.beforeEntityChanging,
  entity.overwriteInstance,
  defaultAddIns.afterEntityChanging);
router.get('/api/entity/instance/:instanceGUID',
  entity.getEntityInstance,
  defaultAddIns.afterEntityReading);
router.post('/api/entity/instance/piece/:instanceGUID',
  entity.getEntityInstancePieceByGUID,
  defaultAddIns.afterEntityReading);
router.post('/api/entity/instance',
  entity.getEntityInstanceByID,
  defaultAddIns.afterEntityReading);
router.post('/api/entity/instance/piece',
  entity.getEntityInstancePieceByID,
  defaultAddIns.afterEntityReading);
router.delete('/api/entity/instance/:instanceGUID',
  defaultAddIns.beforeEntityDeletion,
  entity.softDeleteInstance,
  entity.deleteInstance,
  defaultAddIns.afterEntityDeletion);
router.put('/api/entity/instance/softDelete/:instanceGUID',
  entity.softDeleteInstance,
  defaultAddIns.afterEntityDeletion);
router.put('/api/entity/instance/restore/:instanceGUID',
  entity.restoreInstance);

// Entity Meta Service
router.get('/api/entity/EntityIDs',
  defaultAddIns.beforeMetaReading,
  entity.listEntityID);
router.get('/api/entity/meta/:entityID',
  defaultAddIns.beforeMetaReading,
  entity.getEntityMeta);
router.get('/api/relation/meta/:relationID',
  defaultAddIns.beforeMetaReading,
  entity.getRelationMeta);
router.get('/api/relation/meta/entity/:entityID',
  defaultAddIns.beforeMetaReading,
  entity.getRelationMetaOfEntity);

// Query Service
router.post('/api/query',
  defaultAddIns.beforeEntityQuery,
  query.run);

// Model Service
router.all('/api/model/*', defaultAddIns.beforeModelProcessing);
router.get('/api/model/entity-type/list', model.listEntityType);
router.get('/api/model/entity-type/desc/:entityID', model.getEntityTypeDesc);
router.post('/api/model/entity-type', model.saveEntityType);
router.get('/api/model/relation/list', model.listRelation);
router.get('/api/model/relation/desc/:relationID', model.getRelationDesc);
router.post('/api/model/relation', model.saveRelation);
router.get('/api/model/relationship/list', model.listRelationship);
router.get('/api/model/relationship/desc/:relationshipID', model.getRelationshipDesc);
router.get('/api/model/relationship/:relationshipID', model.getRelationship);
router.post('/api/model/relationship', model.saveRelationship);
router.get('/api/model/role/list', model.listRole);
router.get('/api/model/role/:roleID', model.getRole);
router.get('/api/model/role/desc/:roleID', model.getRoleDesc);
router.post('/api/model/role', model.saveRole);

// User Functions
router.post('/api/function/:functionName', userFunction.execute);

module.exports = router;
