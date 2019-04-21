const entity = require('./entity');

const AddIn = require('./userAddIn.js');
const beforeEntityCreation = new AddIn();
const beforeEntityChanging = new AddIn();
const beforeEntityDeletion = new AddIn();
const beforeEntityQuery = new AddIn();
const afterEntityCreation = new AddIn();
const afterEntityChanging = new AddIn();
const afterEntityDeletion = new AddIn();
const afterEntityReading = new AddIn();
const beforeMetaReading = new AddIn();
const beforeModelProcessing = new AddIn();

afterEntityCreation.use('*', getEntityInstance);
afterEntityChanging.use('*', getEntityInstance);

/**
 * A User AddIn function has 2 parameters:
 * @param req: http request
 * @param callback(err, result)re
 * err: error message array
 * result: any object
 */
function getEntityInstance(req, callback) {
  entity.getInstanceByGUID(req.body['INSTANCE_GUID'], function (err, instance){
    if(err) callback(err); // Already Message
    else {
      req.body = instance; // Pass the instance to the next addIn function
      callback(null, instance);
    }
  })
}

module.exports = {
  beforeEntityCreation: beforeEntityCreation,
  beforeEntityChanging: beforeEntityChanging,
  beforeEntityDeletion: beforeEntityDeletion,
  beforeEntityQuery: beforeEntityQuery,
  beforeMetaReading: beforeMetaReading,
  beforeModelProcessing: beforeModelProcessing,
  afterEntityCreation: afterEntityCreation,
  afterEntityChanging: afterEntityChanging,
  afterEntityDeletion: afterEntityDeletion,
  afterEntityReading: afterEntityReading,
};
