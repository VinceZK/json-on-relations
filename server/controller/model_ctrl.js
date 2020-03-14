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
      entityDB.getEntityMeta(req.body.ENTITY_ID, function (errs, entityMeta) {
        if(err) return res.json(err);
        entityDB.getRelationMeta(req.body.ENTITY_ID, function (err, relationMeta) {
          if(err) res.json(err);
          else res.json([entityMeta, relationMeta]);
        })
      })
    })
  },

  listRelation: function (req, res) {
    model.listRelation(req.query.term, function (err, rows) {
      if(err)res.json(err);
      else res.json(rows);
    })
  },

  getRelationDesc: function (req, res) {
    model.getRelationDesc(req.params['relationID'], function (err, relationDesc) {
      if(err)res.json(err);
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
      entityDB.getRelationMeta(req.body.RELATION_ID, function (errs, relationMeta) {
        if(err) res.json(err);
        else res.json(relationMeta);
      })
    })
  },

  listRelationship: function (req, res) {
    model.listRelationship(req.query.term, function (err, rows) {
      if (err) res.json(err);
      else res.json(rows);
    })
  },

  getRelationship: function (req, res) {
    model.getRelationship(req.params['relationshipID'], function (err, relationship) {
      if(err) res.json(err);
      else res.json(relationship);
    })
  },

  getRelationshipDesc: function(req, res) {
    model.getRelationshipDesc(req.params['relationshipID'], function (err, relationshipDesc) {
      if (err) res.json(err);
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
        entityDB.getRelationMeta(req.body.RELATIONSHIP_ID, function (err, relationMeta) {
          if(err) res.json(err);
          else res.json([relationship, relationMeta]);
        })
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
  },

  listDataElement: function (req, res) {
    model.listDataElement(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getDataElement: function (req, res) {
    model.getDataElement(req.params['elementID'], function (errs, dataElement) {
      if(errs)res.json(errs);
      else res.json(dataElement);
    })
  },

  getDataElementDesc: function (req, res) {
    model.getDataElementDesc(req.params['elementID'], function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  saveDataElement: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveDataElement(req.body, userID, function (err) {
      if (err) res.json(err);
      else {
        model.getDataElement(req.body.ELEMENT_ID, function (err, dataElement) {
          if(err) return res.json(err);
          else return res.json(dataElement);
        })
      }
    })
  },

  listDataDomain: function (req, res) {
    model.listDataDomain(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  getDataDomain: function (req, res) {
    model.getDataDomain(req.params['domainID'], function (errs, dataDomain) {
      if(errs)res.json(errs);
      else res.json(dataDomain);
    })
  },

  getDataDomainDesc: function (req, res) {
    model.getDataDomainDesc(req.params['domainID'], function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  saveDataDomain: function (req, res) {
    let userID = 'DH001';
    if (req.user && req.user.identity && req.user.identity.userBasic.USER_ID) {
      userID = req.user.identity.userBasic.USER_ID;
    }
    model.saveDataDomain(req.body, userID, function (err) {
      if(err) res.json(err);
      else {
        model.getDataDomain(req.body.DOMAIN_ID, function (err, dataDomain) {
          if(err) res.json(err);
          else res.json(dataDomain);
        })
      }
    })
  },

  getElementMeta: function (req, res) {
    model.getElementMeta(req.params['elementID'], function (errs, elementMeta) {
      if(errs) res.json(errs);
      else res.json(elementMeta);
    })
  }
};
