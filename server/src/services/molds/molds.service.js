const createService = require('feathers-sequelize');
const createModel = require('../../models/molds.model');
const hooks = require('./molds.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/molds', createService(options));
  const service = app.service('molds');
  service.hooks(hooks);
};
