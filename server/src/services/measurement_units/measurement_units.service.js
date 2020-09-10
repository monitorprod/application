const createService = require("feathers-sequelize");
const createModel = require("../../models/measurement_units.model");
const hooks = require("./measurement_units.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/measurement_units", createService(options));
  const service = app.service("measurement_units");
  service.hooks(hooks);
};
