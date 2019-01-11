const userFunction = require('../models/userFunction');

module.exports = {
  execute: function (req, res) {
    userFunction.execute(req.params['functionName'], req.body, function (errors, results) {
      if(errors) res.json(errors);
      else res.json(results);
    })
  }
};
