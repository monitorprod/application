const createService = require('feathers-sequelize');
const createModel = require('../../models/attributes.model');
const hooks = require('./attributes.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/attributes', createService(options));
  const service = app.service('attributes');
  service.hooks(hooks);
};
