const model = require('../models/model.js');
const entityDB = require('../models/connections/sql_mdb.js');

module.exports = {
  listEntityType: function (req, res) {
    model.listEntityType(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getEntityTypeDesc: function(req, res) {
    model.getEntityTypeDesc(req.params['entityID'], function (errs, entityTypeDesc) {
      if(errs)res.json(errs);
      else res.json(entityTypeDesc);
    })
  },

  saveEntityType: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveEntityType(req.body, userID ,function (err) {
      if(err) return res.json(err);
      entityDB.loadEntity(req.body.ENTITY_ID, function (err) {
        if(err) res.json(err);
        else res.json(
          [ entityDB.getEntityMeta(req.body.ENTITY_ID),
            entityDB.getRelationMeta(req.body.ENTITY_ID)]);
      });
    })
  },

  listRelation: function (req, res) {
    model.listRelation(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getRelationDesc: function (req, res) {
    model.getRelationDesc(req.params['relationID'], function (errs, relationDesc) {
      if(errs)res.json(errs);
      else res.json(relationDesc);
    })
  },

  saveRelation: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveRelation(req.body, userID ,function (err) {
      if(err) return res.json(err);
      entityDB.loadRelation(req.body.RELATION_ID, function (err) {
        if(err) res.json(err);
        else res.json(entityDB.getRelationMeta(req.body.RELATION_ID));
      });
    })
  },

  listRelationship: function (req, res) {
    model.listRelationship(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getRelationship: function (req, res) {
    model.getRelationship(req.params['relationshipID'], function (errs, relationship) {
      if(errs)res.json(errs);
      else res.json(relationship);
    })
  },

  getRelationshipDesc: function(req, res) {
    model.getRelationshipDesc(req.params['relationshipID'], function (errs, relationshipDesc) {
      if(errs)res.json(errs);
      else res.json(relationshipDesc);
    })
  },

  saveRelationship: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveRelationship(req.body, userID, function (err) {
      if(err) return res.json(err);
      model.getRelationship(req.body.RELATIONSHIP_ID, function (err, relationship) {
        if(err) return res.json(err);
        entityDB.loadRelation(req.body.RELATIONSHIP_ID, function (err) {
          if(err) res.json(err);
          else res.json([relationship, entityDB.getRelationMeta(req.body.RELATIONSHIP_ID)]);
        });
      })
    })
  },

  listRole: function (req, res) {
    model.listRole(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getRole: function (req, res) {
    model.getRole(req.params['roleID'], function (errs, role) {
      if(errs)res.json(errs);
      else res.json(role);
    })
  },

  getRoleDesc: function (req, res) {
    model.getRoleDesc(req.params['roleID'], function (errs, roleDesc) {
      if(errs)res.json(errs);
      else res.json(roleDesc);
    })
  },

  saveRole: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveRole(req.body, userID, function (err) {
      if(err) return res.json(err);
      else{
        model.getRole(req.body.ROLE_ID, function (err, role) {
          if(err) return res.json(err);
          else return res.json(role);
        })
      }
    })
  }
};
