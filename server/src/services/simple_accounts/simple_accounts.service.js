const hooks = require("./simple_accounts.hooks");
const createService = require("feathers-sequelize");
const createModel = require("../../models/simple_accounts.model");

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate,
  };
  app.use("/simple-accounts", createService(options));
  const service = app.service("simple-accounts");
  service.hooks(hooks);
};
