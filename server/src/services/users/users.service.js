const createService = require('feathers-sequelize');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/users', createService(options));
  const service = app.service('users');
  service.hooks(hooks);
};
