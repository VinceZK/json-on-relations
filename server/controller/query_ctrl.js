const query = require('../models/query.js');

module.exports = {
  run: function (req, res) {
    query.run(req.body, function (errs, rows) {
      if(errs) res.json(errs);
      else res.json(rows);
    })
  }
};
