const createService = require("feathers-sequelize");
const createModel = require("../../models/product_statuses.model");
const hooks = require("./product_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/product_statuses", createService(options));
  const service = app.service("product_statuses");
  service.hooks(hooks);
};
