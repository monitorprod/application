const lodash = require("lodash");

const getConfigs = async ({ app, forced }) => {
  if (forced || !app.get("config.machine.status")) {
    const { data: configs } = await app.service("configs").find();
    lodash.forEach(configs, config => app.set(`config.${config.name}`, config));
  }
  if (forced || !app.get("actionType.init")) {
    const { data: actionTypes } = await app
      .service("production_order_action_types")
      .find({ query: { $populateAll: true } });
    lodash.forEach(actionTypes, type => app.set(`actionType.${type.id}`, type));
    app.set("actionType.init", true);
  }
};

module.exports = getConfigs;
