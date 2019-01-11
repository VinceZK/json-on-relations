const lamdbas = {};

module.exports = {
  register: register,
  execute: execute
};

function register(name, lambda) {
  if (!name || typeof name !== 'string')
    throw new Error('User function must be registered under a name!');
  if (!lambda || typeof lambda !== 'function')
    throw new Error('A valid function must be provided!');

  lamdbas[name] = lambda;
}

function execute(name, input, callback) {
  const lambda = lamdbas[name];
  if (!lambda) return callback([
    { msgCat: 'FUNCTION',
      msgName: 'INVALID_FUNCTION',
      msgType: 'E',
      msgShortText: 'Function: ' + name + ' is invalid'
    }]);

  lambda(input, callback);
}
