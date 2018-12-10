const entity = require('../models/entity.js');
const entityDB = require('../models/connections/mysql_mdb.js');

module.exports = {
  listEntityID: function (req, res) {
    res.json(entityDB.listEntityID())
  },

  getEntityMeta: function (req, res) {
    res.json(entity.getEntityMeta(req.params['entityID']))
  },

  getEntityInstance: function (req, res) {
    entity.getInstanceByGUID(req.params['instanceGUID'], function (err, instance) {
      if(err)res.json(err);
      else res.json(instance);
    });
  },

  getEntityInstanceByID: function (req, res) {
    entity.getInstanceByID(req.body, function (err, instance) {
      if(err)res.json(err);
      else res.json(instance);
    });
  },

  getRelationMeta: function (req, res) {
    res.json(entity.getRelationMeta(req.params['relationID']));
  },

  getRelationMetaOfEntity: function (req, res) {
    res.json(entity.getRelationMetaOfEntity(req.params['entityID']));
  },
  
  createInstance: function (req, res) {
    entity.createInstance(req.body, function (err, instance) {
      if(err) return res.json(err);
      entity.getInstanceByGUID(instance.INSTANCE_GUID, function (err, instance){
        if(err)res.json(err);
        else res.json(instance);
      })
    })
  },

  changeInstance: function (req, res) {
    // delete req.body.ENTITY_ID;
    entity.changeInstance(req.body, function (err) {
      if(err) return res.json(err);
      entity.getInstanceByGUID(req.body['INSTANCE_GUID'], function (err, instance){
        if(err)res.json(err);
        else res.json(instance);
      })
    })
  }
};
