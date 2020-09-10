const createService = require("feathers-sequelize");
const createModel = require("../../models/wiki_sections.model");
const hooks = require("./wiki_sections.hooks");

module.exports = function(app) {
  const Model = createModel(app);
  const paginate = app.get("paginate");
  const options = {
    Model,
    paginate
  };
  app.use("/wiki_sections", createService(options));
  const service = app.service("wiki_sections");
  service.hooks(hooks);
};
