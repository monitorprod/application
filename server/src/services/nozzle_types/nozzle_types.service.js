const createService = require("feathers-sequelize");
const createModel = require("../../models/nozzle_types.model");
const hooks = require("./nozzle_types.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/nozzle_types", createService(options));
  const service = app.service("nozzle_types");
  service.hooks(hooks);
};
