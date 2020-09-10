const createService = require("feathers-sequelize");
const createModel = require("../../models/production_order_types.model");
const hooks = require("./production_order_types.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/production_order_types", createService(options));
  const service = app.service("production_order_types");
  service.hooks(hooks);
};
