const entity = require('../models/entity.js');

module.exports = {
  listEntityID: function (req, res) {
    // res.json(entityDB.listEntityID())
    entity.listAllEntityIDs(function (errs, IDs) {
      if(errs) res.json(errs);
      else res.json(IDs);
    })
  },

  listEntityIDbyRole: function (req, res) {
    // res.json(entityDB.listEntityIDbyRole(req.params['roleID']))
    entity.listEntityIDbyRole(req.params['roleID'], function (errs, IDs) {
      if(errs) res.json(errs);
      else res.json(IDs);
    })
  },

  getEntityMeta: function (req, res) {
    entity.getEntityMeta(req.params['entityID'], function (errs, entityMeta) {
      if(errs) res.json(errs);
      else res.json(entityMeta);
    })
  },

  getEntityInstance: function (req, res, next) {
    entity.getInstanceByGUID(req.params['instanceGUID'], function (errs, instance) {
      if(errs){
        res.json(errs);
      } else {
        req.body = instance;
        next();
      }
    });
  },

  getEntityInstanceByID: function (req, res) {
    entity.getInstanceByID(req.body, function (err, instance) {
      if(err)res.json(err);
      else res.json(instance);
    });
  },

  getEntityInstancePieceByGUID: function(req, res) {
    entity.getInstancePieceByGUID(req.params['instanceGUID'], req.body, function (err, instance) {
      if(err)res.json(err);
      else res.json(instance);
    })
  },

  getEntityInstancePieceByID: function(req, res) {
    entity.getInstancePieceByID(req.body['ID'], req.body['piece'], function (err, instance) {
      if(err)res.json(err);
      else res.json(instance);
    })
  },

  getRelationMeta: function (req, res) {
    entity.getRelationMeta(req.params['relationID'], function (errs, relationMeta) {
      if(errs) res.json(errs);
      else res.json(relationMeta);
    })
  },

  getRelationMetaOfEntity: function (req, res) {
    entity.getRelationMetaOfEntity(req.params['entityID'], function (results) {
      res.json(results);
    })
  },

  createInstance: function (req, res, next) {
    entity.createInstance(req.body, function (err) {
      if(err) res.json(err);
      else next();
    })
  },

  changeInstance: function (req, res, next) {
    entity.changeInstance(req.body, function (err) {
      if(err) res.json(err);
      else next();
    })
  },

  overwriteInstance: function (req, res, next) {
    entity.overwriteInstance(req.body, function (err) {
      if(err) res.json(err);
      else next();
    })
  },

  softDeleteInstance: function(req, res, next) {
    entity.softDeleteInstanceByGUID(req.params['instanceGUID'], function (err) {
      if (err) res.json(err);
      else next();
    })
  },

  restoreInstance: function(req, res) {
    entity.restoreInstanceByGUID(req.params['instanceGUID'], function (err) {
      res.json(err);
    })
  },

  deleteInstance: function (req, res, next) {
    entity.hardDeleteByGUID(req.params['instanceGUID'], function (err) {
      if (err) res.json(err);
      else next();
    })
  }
};
