const createService = require('feathers-sequelize');
const createModel = require('../../models/production_orders.model');
const hooks = require('./production_orders.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/production_orders', createService(options));
  const service = app.service('production_orders');
  service.hooks(hooks);
};
