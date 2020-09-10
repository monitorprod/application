const createService = require("feathers-sequelize");
const createModel = require("../../models/mold_products.model");
const hooks = require("./mold_products.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/mold_products", createService(options));
  const service = app.service("mold_products");
  service.hooks(hooks);
};
