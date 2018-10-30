const express = require('express');
const router = express.Router();
const Auth = require('./controller/auth_ctrl.js');
const entity = require('./controller/entity_ctrl.js');
const query = require('./controller/query_ctrl.js');
const model = require('./controller/model_ctrl.js');
const path = require('path');

// Basic login with username & password
router.delete('/api/logout',Auth.logout);

// Ensure all the APIs bellow are under authentication.
// router.all('/api/*', Auth.ensureAuthenticated);

// Entity Service
router.get('/api/entity/EntityIDs', entity.listEntityID);
router.get('/api/entity/meta/:entityID', entity.getEntityMeta);
router.get('/api/entity/instance/:instanceGUID', entity.getEntityInstance);
// router.get('/api/relation/meta/:relationID', entity.getRelationMeta);
router.get('/api/relation/meta/entity/:entityID', entity.getRelationMetaOfEntity);
router.put('/api/entity', entity.changeInstance);
router.post('/api/entity', entity.createInstance);

// Query Service
router.post('/api/query', query.run);

// Model Service
router.get('/api/model/entity-type/list', model.listEntityType);
router.post('/api/model/entity-type', model.saveEntityType);

// Add this route to support page refresh
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

module.exports = router;
