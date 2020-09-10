const createService = require('feathers-sequelize');
const createModel = require('../../models/machines.model');
const hooks = require('./machines.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/machines', createService(options));
  const service = app.service('machines');
  service.hooks(hooks);
};
