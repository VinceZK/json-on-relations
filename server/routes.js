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
router.post('/api/entity/orchestrate',
  entity.orchestrate);

// Query Service
router.post('/api/query',
  defaultAddIns.beforeEntityQuery,
  query.run);

// User Functions
router.post('/api/function/:functionName', userFunction.execute);

// Entity Meta Service
router.get('/api/entity/EntityIDs',
  defaultAddIns.beforeMetaReading,
  entity.listEntityID);
router.get('/api/entity/EntityIDs/:roleID',
  defaultAddIns.beforeMetaReading,
  entity.listEntityIDbyRole);
router.get('/api/entity/meta/:entityID',
  defaultAddIns.beforeMetaReading,
  entity.getEntityMeta);
router.get('/api/relation/meta/:relationID',
  defaultAddIns.beforeMetaReading,
  entity.getRelationMeta);
router.get('/api/relation/meta/entity/:entityID',
  defaultAddIns.beforeMetaReading,
  entity.getRelationMetaOfEntity);

// Model Service
router.all('/api/model/*', defaultAddIns.beforeModelProcessing);
router.get('/api/model/entity-types', model.listEntityType);
router.get('/api/model/entity-types/:entityID/desc', model.getEntityTypeDesc);
router.post('/api/model/entity-types', model.saveEntityType);
router.get('/api/model/relations', model.listRelation);
router.get('/api/model/relations/:relationID/desc', model.getRelationDesc);
router.post('/api/model/relations', model.saveRelation);
router.get('/api/model/relationships', model.listRelationship);
router.get('/api/model/relationships/:relationshipID/desc', model.getRelationshipDesc);
router.get('/api/model/relationships/:relationshipID', model.getRelationship);
router.post('/api/model/relationships', model.saveRelationship);
router.get('/api/model/roles', model.listRole);
router.get('/api/model/roles/:roleID', model.getRole);
router.get('/api/model/roles/:roleID/desc', model.getRoleDesc);
router.post('/api/model/roles', model.saveRole);
router.get('/api/model/data-elements', model.listDataElement);
router.get('/api/model/data-elements/:elementID', model.getDataElement);
router.get('/api/model/data-elements/:elementID/desc', model.getDataElementDesc);
router.post('/api/model/data-elements', model.saveDataElement);
router.get('/api/model/data-domains', model.listDataDomain);
router.get('/api/model/data-domains/:domainID', model.getDataDomain);
router.get('/api/model/data-domains/:domainID/desc', model.getDataDomainDesc);
router.post('/api/model/data-domains', model.saveDataDomain);
router.get('/api/model/search-helps', model.listSearchHelp);
router.get('/api/model/search-helps/:searchHelpID', model.getSearchHelp);
router.get('/api/model/search-helps/:searchHelpID/desc', model.getSearchHelpDesc);
router.post('/api/model/search-helps', model.saveSearchHelp);
router.get('/api/model/element-meta/:elementID', model.getElementMeta);

module.exports = router;
