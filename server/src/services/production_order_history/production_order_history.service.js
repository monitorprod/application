const createService = require("feathers-mongodb");
const hooks = require("./production_order_history.hooks");

module.exports = function(app) {
  // const paginate = app.get("paginate");
  const mongoClient = app.get("mongoClient");
  // const options = { paginate };
  const options = {
    paginate: {
      default: 200000,
      max: 200000
    }
  };
  app.use("/production_order_history", createService(options));
  const service = app.service("production_order_history");
  mongoClient.then(db => {
    service.Model = db.collection("production_order_history");
  });
  service.hooks(hooks);
};
