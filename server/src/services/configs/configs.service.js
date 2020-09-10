const createService = require("feathers-sequelize");
const createModel = require("../../models/configs.model");
const getConfigs = require("../../utils/getConfigs");
const hooks = require("./configs.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/configs", createService(options));
  const service = app.service("configs");
  service.hooks(hooks);
  getConfigs({ app });
};
