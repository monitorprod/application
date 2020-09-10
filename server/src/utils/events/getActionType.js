const lodash = require("lodash");

const getActionType = ({ app, type }) =>
  lodash.get(app.get(`config.productionOrder.eventType.${type}`), "value");

module.exports = getActionType;


