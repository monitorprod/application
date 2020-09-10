const createService = require("feathers-sequelize");
const createModel = require("../../models/machine_statuses.model");
const hooks = require("./machine_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/machine_statuses", createService(options));
  const service = app.service("machine_statuses");
  service.hooks(hooks);
};
