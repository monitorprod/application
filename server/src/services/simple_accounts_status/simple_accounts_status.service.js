const hooks = require("./simple_accounts_status.hooks");
const createService = require("feathers-sequelize");
const createModel = require("../../models/simple_accounts_statuses.model");

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate,
  };
  app.use("/simple-accounts-status", createService(options));
  const service = app.service("simple-accounts-status");
  service.hooks(hooks);
};
