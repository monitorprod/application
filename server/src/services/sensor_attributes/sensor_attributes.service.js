const createService = require("feathers-sequelize");
const createModel = require("../../models/sensor_attributes.model");
const hooks = require("./sensor_attributes.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/sensor_attributes", createService(options));
  const service = app.service("sensor_attributes");
  service.hooks(hooks);
};
