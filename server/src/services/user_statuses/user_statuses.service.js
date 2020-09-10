const createService = require("feathers-sequelize");
const createModel = require("../../models/user_statuses.model");
const hooks = require("./user_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/user_statuses", createService(options));
  const service = app.service("user_statuses");
  service.hooks(hooks);
};
