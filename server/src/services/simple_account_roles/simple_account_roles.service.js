const hooks = require("./simple_account_roles.hooks");
const createService = require("feathers-sequelize");
const createModel = require("../../models/simple_account_roles");

module.exports = function (app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate,
  };
  app.use("/simple-account-roles", createService(options));
  const service = app.service("simple-account-roles");
  service.hooks(hooks);
};
