const lodash = require("lodash");
const { getActionType } = require("../../utils/events");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    if (data.rp || data.nw) {
      return context;
    }
    const productionOrdersService = app.service("production_orders");
    const productionOrderTypesService = app.service("production_order_types");
    const eventTypesService = app.service("production_order_event_types");
    const activeStatus = lodash.get(
      app.get("config.productionOrder.status.active"),
      "value"
    );
    const closedStatus = lodash.get(
      app.get("config.productionOrder.status.closed"),
      "value"
    );
    try {
      const productionOrder = lodash.get(
        await productionOrdersService.find({
          query: {
            id: result.poi,
            $limit: 1
          }
        }),
        "data.0"
      );
      const productionOrderType = lodash.get(
        await productionOrderTypesService.find({
          query: {
            id: productionOrder.productionOrderTypeId,
            $limit: 1
          }
        }),
        "data.0"
      );
      const eventType = lodash.get(
        await eventTypesService.find({
          query: {
            id: result.ev,
            $limit: 1
          }
        }),
        "data.0"
      );
      const actionTypeId = eventType.productionOrderActionTypeId;
      const patch = {};
      const activeActionType = getActionType({ app, type: "active" });
      const setupActionType = getActionType({ app, type: "setup" });
      const setupAutoActionType = getActionType({ app, type: "setupAuto" });
      const scheduledStopActionType = getActionType({
        app,
        type: "scheduledStop"
      });
      const noScheduledStopActionType = getActionType({
        app,
        type: "noScheduledStop"
      });
      const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
      const closedActionType = getActionType({ app, type: "closed" });
      if (
        !lodash.get(productionOrder, "isActive") &&
        `${actionTypeId}` === `${closedActionType}`
      ) {
        patch.isActive = false;
        patch.isClosed = true;
        patch.productionOrderStatusId = closedStatus;
        patch.actualStartDate = result.sd;
        patch.actualEndDate = result.ed;
      } else if (
        lodash.get(productionOrder, "isActive") &&
        `${actionTypeId}` === `${closedActionType}`
      ) {
        patch.isActive = false;
        patch.isClosed = true;
        patch.productionOrderStatusId = closedStatus;
        patch.actualEndDate = result.ed;
      } else if (lodash.get(productionOrderType, "isInProduction")) {
        if (
          !lodash.get(productionOrder, "isActive") &&
          [
            `${activeActionType}`,
            `${setupActionType}`,
            `${setupAutoActionType}`,
            `${noScheduledStopActionType}`
          ].indexOf(`${actionTypeId}`) !== -1
        ) {
          patch.isActive = true;
          patch.isClosed = false;
          patch.productionOrderStatusId = activeStatus;
          patch.actualStartDate = result.sd;
        }
      } else {
        if (
          !lodash.get(productionOrder, "isActive") &&
          [`${scheduledStopActionType}`, `${noWorkDayActionType}`].indexOf(
            `${actionTypeId}`
          ) !== -1
        ) {
          patch.isActive = true;
          patch.isClosed = false;
          patch.productionOrderStatusId = activeStatus;
          patch.actualStartDate = result.sd;
        }
      }
      patch.totalProduction =
        (parseInt(lodash.get(productionOrder, "totalProduction"), "10") || 0) +
        (parseInt(result.t, "10") || 0);
      if (
        `${actionTypeId}` === `${closedActionType}` &&
        !productionOrder.confirmedProduction
      ) {
        patch.confirmedProduction = productionOrder.totalProduction;
      }
      if (result.poi) {
        await productionOrdersService.patch(result.poi, patch);
      }
    } catch (error) {
      // console.log(">>>>> ERROR UPDATE PO", error, result);
    }
    return context;
  };
};
