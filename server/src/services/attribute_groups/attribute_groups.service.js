const createService = require('feathers-sequelize');
const createModel = require('../../models/attribute_groups.model');
const hooks = require('./attribute_groups.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/attribute_groups', createService(options));
  const service = app.service('attribute_groups');
  service.hooks(hooks);
};
