const createService = require("feathers-sequelize");
const createModel = require("../../models/machine_types.model");
const hooks = require("./machine_types.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/machine_types", createService(options));
  const service = app.service("machine_types");
  service.hooks(hooks);
};
