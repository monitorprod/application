const createService = require('feathers-sequelize');
const createModel = require('../../models/products.model');
const hooks = require('./products.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/products', createService(options));
  const service = app.service('products');
  service.hooks(hooks);
};
