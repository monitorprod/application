const createService = require("feathers-sequelize");
const createModel = require("../../../models/support/ticket_messages.model");
const hooks = require("./ticket_messages.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/ticket_messages", createService(options));
  const service = app.service("ticket_messages");
  service.hooks(hooks);
};
