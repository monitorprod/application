const createService = require("feathers-sequelize");
const createModel = require("../../../models/support/tickets.model");
const hooks = require("./tickets.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/tickets", createService(options));
  const service = app.service("tickets");
  service.hooks(hooks);
};
