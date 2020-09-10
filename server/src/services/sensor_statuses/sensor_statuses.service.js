const createService = require("feathers-sequelize");
const createModel = require("../../models/sensor_statuses.model");
const hooks = require("./sensor_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/sensor_statuses", createService(options));
  const service = app.service("sensor_statuses");
  service.hooks(hooks);
};
