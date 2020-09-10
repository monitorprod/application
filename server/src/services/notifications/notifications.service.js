const createService = require("feathers-sequelize");
const createModel = require("../../models/notifications.model");
const hooks = require("./notifications.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/notifications", createService(options));
  const service = app.service("notifications");
  service.hooks(hooks);
};
