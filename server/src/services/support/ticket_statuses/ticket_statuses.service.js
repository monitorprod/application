const createService = require("feathers-sequelize");
const createModel = require("../../../models/support/ticket_statuses.model");
const hooks = require("./ticket_statuses.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/ticket_statuses", createService(options));
  const service = app.service("ticket_statuses");
  service.hooks(hooks);
};
