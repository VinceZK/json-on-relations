const defaultAddIn = require('../models/default_addIns');

module.exports = {
  beforeEntityCreation: function (req, res, next) {
    defaultAddIn.beforeEntityCreation.execute(req.body['ENTITY_ID'], req, function (errors) {
      if (!errors) next();
      else res.json(errors);
    })
  },
  beforeEntityChanging: function (req, res, next) {
    defaultAddIn.beforeEntityChanging.execute(req.body['ENTITY_ID'], req, function (errors) {
      if (!errors) next();
      else res.json(errors);
    })
  },
  beforeEntityQuery: function (req, res, next) {
    defaultAddIn.beforeEntityQuery.execute(req.body['RELATION'], req, function (errors) {
      if (!errors) next();
      else res.json(errors);
    })
  },
  beforeMetaReading: function (req, res, next) {
    defaultAddIn.beforeMetaReading.execute('*', req, function (errors) {
      if (!errors) next();
      else res.json(errors);
    })
  },
  beforeModelProcessing: function (req, res, next) {
    defaultAddIn.beforeModelProcessing.execute('*', req, function (errors) {
      if (!errors) next('route');
      else res.json(errors);
    })
  },
  afterEntityCreation: function (req, res) {
    defaultAddIn.afterEntityCreation.execute(req.body['ENTITY_ID'], req, function (errors, results) {
      if (errors) res.json(errors);
      else res.json(results);
    })
  },
  afterEntityChanging: function (req, res) {
    defaultAddIn.afterEntityChanging.execute(req.body['ENTITY_ID'], req, function (errors, results) {
      if (errors) res.json(errors);
      else res.json(results);
    })
  },
  afterEntityReading: function (req, res) {
    defaultAddIn.afterEntityReading.execute(req.body['ENTITY_ID'], req, function (errors, results) {
      if (errors) res.json(errors);
      else res.json(results);
    })
  }
};
