const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { app, result } = context;
    const productionOrderHistoryService = app.service("production_order_history");
    const history = lodash.get(
      await productionOrderHistoryService.find({
        query: { poi: result.id }
      }),
      "data.0"
    );
    if (history) {
      return context;
    }
    await productionOrderHistoryService.create({
      ci: result.companyId,
      mi: result.machineId,
      si: result.sensorId,
      poi: result.id,
      cav: [
        {
          d: moment().toDate(),
          cav: result.openCavities
        }
      ],
      icy: [
        {
          d: moment().toDate(),
          icy: result.idealCycle
        }
      ],
      ev: []
    });
    return context;
  };
};
