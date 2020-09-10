const createService = require("feathers-sequelize");
const createModel = require("../../models/colors.model");
const hooks = require("./colors.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/colors", createService(options));
  const service = app.service("colors");
  service.hooks(hooks);
};
