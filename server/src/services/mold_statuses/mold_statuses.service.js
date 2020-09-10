const createService = require("feathers-sequelize");
const createModel = require("../../models/mold_statuses.model");
const hooks = require("./mold_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/mold_statuses", createService(options));
  const service = app.service("mold_statuses");
  service.hooks(hooks);
};
