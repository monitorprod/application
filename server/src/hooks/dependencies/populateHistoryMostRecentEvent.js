const lodash = require("lodash");
const { getActionType } = require("../../utils/events");

module.exports = function() {
  return async context => {
    const { app, method, type, params, result } = context;
    const eventTypesService = app.service("production_order_event_types");
    const actionTypesService = app.service("production_order_action_types");
    if (
      (lodash.get(params, "$mostRecentEvent") || lodash.get(params, "query.$mostRecentEvent")) &&
      method === "find"
    ) {
      params.$mostRecentEvent = true;
      lodash.unset(params, "query.$mostRecentEvent");
    }
    if (params.$mostRecentEvent && type === "after") {
      let resultArray = result.data || result;
      if (!Array.isArray(resultArray)) {
        resultArray = [resultArray];
      }
      resultArray = lodash.filter(
        await Promise.all(
          lodash.map(resultArray, async item => {
            const lastEV = lodash.last(lodash.get(item, "ev"));
            if (lastEV) {
              if (lastEV.ev === -1) {
                const undefinedActionType = await actionTypesService.get(
                  getActionType({ app, type: "undefined" })
                );
                lastEV.productionOrderEventType = {
                  ...undefinedActionType,
                  productionOrderActionTypeId: undefinedActionType.id,
                  production_order_action_type: { ...undefinedActionType }
                };
              } else {
                lastEV.productionOrderEventType = await eventTypesService.get(lastEV.ev);
              }
              return lastEV;
            }
          })
        ),
        item => item
      );
      if (result.data) {
        result.data = resultArray;
      } else {
        context.result = resultArray;
      }
    }
    return context;
  };
};
