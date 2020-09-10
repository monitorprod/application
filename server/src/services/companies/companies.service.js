const createService = require('feathers-sequelize');
const createModel = require('../../models/companies.model');
const hooks = require('./companies.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/companies', createService(options));
  const service = app.service('companies');
  service.hooks(hooks);
};
