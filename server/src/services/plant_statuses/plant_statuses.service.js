const createService = require("feathers-sequelize");
const createModel = require("../../models/plant_statuses.model");
const hooks = require("./plant_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/plant_statuses", createService(options));
  const service = app.service("plant_statuses");
  service.hooks(hooks);
};
