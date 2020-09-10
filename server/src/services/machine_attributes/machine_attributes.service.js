const createService = require("feathers-sequelize");
const createModel = require("../../models/machine_attributes.model");
const hooks = require("./machine_attributes.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/machine_attributes", createService(options));
  const service = app.service("machine_attributes");
  service.hooks(hooks);
};
