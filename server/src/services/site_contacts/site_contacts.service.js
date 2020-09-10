const createService = require('feathers-sequelize');
const createModel = require('../../models/site_contacts.model');
const hooks = require('./site_contacts.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get('paginate');
  const options = {
    Model,
    paginate
  };
  app.use('/site_contacts', createService(options));
  const service = app.service('site_contacts');
  service.hooks(hooks);
};
