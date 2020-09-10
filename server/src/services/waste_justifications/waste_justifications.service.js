const createService = require("feathers-sequelize");
const createModel = require("../../models/waste_justifications.model");
const hooks = require("./waste_justifications.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/waste_justifications", createService(options));
  const service = app.service("waste_justifications");
  service.hooks(hooks);
};
