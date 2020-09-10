const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { app, result } = context;
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    const history = lodash.get(
      await productionOrderHistoryService.find({
        query: { poi: result.id }
      }),
      "data.0"
    );
    const lastCav = lodash.get(lodash.last(lodash.get(history, "cav")), "cav");
    const lastIcy = lodash.get(lodash.last(lodash.get(history, "icy")), "icy");
    const patch = {};
    if (lastCav && `${result.openCavities}` !== `${lastCav}`) {
      history.cav.push({
        d: moment().toDate(),
        cav: result.openCavities
      });
      patch.cav = history.cav;
    }
    if (lastIcy && `${result.idealCycle}` !== `${lastIcy}`) {
      history.icy.push({
        d: moment().toDate(),
        icy: result.idealCycle
      });
      patch.icy = history.icy;
    }
    if (Object.keys(patch).length) {
      await productionOrderHistoryService.patch(history._id, patch);
    }
    return context;
  };
};
