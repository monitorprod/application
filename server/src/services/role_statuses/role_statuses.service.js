const createService = require("feathers-sequelize");
const createModel = require("../../models/role_statuses.model");
const hooks = require("./role_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/role_statuses", createService(options));
  const service = app.service("role_statuses");
  service.hooks(hooks);
};
