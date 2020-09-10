const createService = require("feathers-mongodb");
const hooks = require("./production_order_waste.hooks");

module.exports = function(app) {
  const paginate = app.get("paginate");
  const mongoClient = app.get("mongoClient");
  const options = { paginate };
  app.use("/production_order_waste", createService(options));
  const service = app.service("production_order_waste");
  mongoClient.then(db => {
    service.Model = db.collection("production_order_waste");
  });
  service.hooks(hooks);
};
