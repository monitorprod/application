const createService = require("feathers-sequelize");
const createModel = require("../../models/product_attributes.model");
const hooks = require("./product_attributes.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/product_attributes", createService(options));
  const service = app.service("product_attributes");
  service.hooks(hooks);
};
