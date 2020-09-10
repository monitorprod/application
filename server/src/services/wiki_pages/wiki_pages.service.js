const createService = require("feathers-sequelize");
const createModel = require("../../models/wiki_pages.model");
const hooks = require("./wiki_pages.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/wiki_pages", createService(options));
  const service = app.service("wiki_pages");
  service.hooks(hooks);
};
