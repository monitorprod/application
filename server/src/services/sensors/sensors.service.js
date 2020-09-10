const createService = require('feathers-sequelize');
const createModel = require('../../models/sensors.model');
const hooks = require('./sensors.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/sensors', createService(options));
  const service = app.service('sensors');
  service.hooks(hooks);
};
