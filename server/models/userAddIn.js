const async = require('async');

function UserAddIn() {
  this._userAddIns = {};
}

UserAddIn.prototype.use = function(topic, addIn) {
  if (!topic) throw new Error('User Add-In must have a topic');
  if (!addIn || typeof addIn !== 'function')
    throw new Error('User Add-In must be provided as a function for topic: ' + topic );

  const topics = Array.isArray(topic)? topic : [topic];

  topics.forEach( topic => this._userAddIns[topic]? this._userAddIns[topic].push(addIn) :
                                                     this._userAddIns[topic] = [addIn]);
};

UserAddIn.prototype.execute = function(topic, req, callback) {
  let addIns = this._userAddIns['*'];
  if (!addIns) addIns = [];
  addIns = addIns.concat(this._userAddIns[topic]);
  if (addIns.length === 0) return callback(null, req.body);

  async.mapSeries(addIns, function (addInFunction, callback) {
    addInFunction(req, callback)
  }, function (err, results) {
    if (err) callback(err);
    else callback(null, results[results.length - 1]); // Only return the last one
  });
};

module.exports = UserAddIn;
