const createService = require("feathers-sequelize");
const createModel = require("../../models/holidays.model");
const hooks = require("./holidays.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/holidays", createService(options));
  const service = app.service("holidays");
  service.hooks(hooks);
};
