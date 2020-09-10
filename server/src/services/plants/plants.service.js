const createService = require("feathers-sequelize");
const createModel = require("../../models/plants.model");
const hooks = require("./plants.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/plants", createService(options));
  const service = app.service("plants");
  service.hooks(hooks);
};
