const createService = require("feathers-sequelize");
const createModel = require("../../models/mold_attributes.model");
const hooks = require("./mold_attributes.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/mold_attributes", createService(options));
  const service = app.service("mold_attributes");
  service.hooks(hooks);
};
