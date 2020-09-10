const createService = require("feathers-sequelize");
const createModel = require("../../models/machine_mold_products.model");
const hooks = require("./machine_mold_products.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/machine_mold_products", createService(options));
  const service = app.service("machine_mold_products");
  service.hooks(hooks);
};
