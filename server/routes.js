const express = require('express');
const router = express.Router();
const entity = require('./controller/entity_ctrl.js');
const query = require('./controller/query_ctrl.js');
const model = require('./controller/model_ctrl.js');
const path = require('path');

// Entity Service
router.post('/api/entity', entity.createInstance);
router.put('/api/entity', entity.changeInstance);
router.put('/api/entity/overwrite', entity.overwriteInstance);
router.get('/api/entity/instance/:instanceGUID', entity.getEntityInstance);
router.get('/api/entity/instance/piece/:instanceGUID', entity.getEntityInstancePiece);
router.get('/api/entity/instance', entity.getEntityInstanceByID);
router.get('/api/entity/EntityIDs', entity.listEntityID);
router.get('/api/entity/meta/:entityID', entity.getEntityMeta);
router.get('/api/relation/meta/:relationID', entity.getRelationMeta);
router.get('/api/relation/meta/entity/:entityID', entity.getRelationMetaOfEntity);

// Query Service
router.post('/api/query', query.run);

// Model Service
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

// Add this route to support page refresh
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = router;
