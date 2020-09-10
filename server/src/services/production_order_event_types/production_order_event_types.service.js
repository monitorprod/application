const createService = require('feathers-sequelize');
const createModel = require('../../models/production_order_event_types.model');
const hooks = require('./production_order_event_types.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/production_order_event_types', createService(options));
  const service = app.service('production_order_event_types');
  service.hooks(hooks);
};
