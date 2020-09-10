const createService = require('feathers-sequelize');
const createModel = require('../../models/user_roles.model');
const hooks = require('./user_roles.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/user_roles', createService(options));
  const service = app.service('user_roles');
  service.hooks(hooks);
};
