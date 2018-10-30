const model = require('../models/model.js');
const entityDB = require('../models/connections/mysql_mdb.js');

module.exports = {
  listEntityType: function (req, res) {
    model.listEntityType(req.query.term, function (errs, rows) {
      if(errs)res.json(errs);
      else res.json(rows);
    })
  },

  saveEntityType: function (req, res) {
    model.saveEntityType(req.body, function (err) {
      if(err) return res.json(err);
      entityDB.loadEntity(req.body.ENTITY_ID, function (err) {
        if(err) res.json(err);
        else res.json(entityDB.getEntityMeta(req.body.ENTITY_ID));
      });
    })
  }
};
