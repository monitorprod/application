const createService = require("feathers-sequelize");
const createModel = require("../../models/turns.model");
const hooks = require("./turns.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/turns", createService(options));
  const service = app.service("turns");
  service.hooks(hooks);
};
