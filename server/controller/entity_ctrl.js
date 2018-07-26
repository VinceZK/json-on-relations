const entity = require('../models/entity.js');

module.exports = {
  getEntityMeta: function (req, res) {
    res.json(entity.getEntityMeta(req.params['entityID']))
  },

  getEntityInstance: function (req, res) {
    entity.getInstanceByGUID(req.params['instanceGUID'], function (err, instance) {
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
