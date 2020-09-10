const createService = require("feathers-sequelize");
const createModel = require("../../models/company_statuses.model");
const hooks = require("./company_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/company_statuses", createService(options));
  const service = app.service("company_statuses");
  service.hooks(hooks);
};
