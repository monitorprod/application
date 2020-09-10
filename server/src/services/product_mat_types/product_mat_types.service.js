const createService = require("feathers-sequelize");
const createModel = require("../../models/product_mat_types.model");
const hooks = require("./product_mat_types.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/product_mat_types", createService(options));
  const service = app.service("product_mat_types");
  service.hooks(hooks);
};
