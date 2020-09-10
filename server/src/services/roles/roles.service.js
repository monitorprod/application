const createService = require('feathers-sequelize');
const createModel = require('../../models/roles.model');
const hooks = require('./roles.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/roles', createService(options));
  const service = app.service('roles');
  service.hooks(hooks);
};
