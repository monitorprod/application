const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, result, method, type } = context;
    const productionOrdersService = app.service("production_orders");
    const productionOrderWasteService = app.service("production_order_waste");
    let shouldSubstract = false;
    if (["patch", "remove"].indexOf(method) !== -1) {
      shouldSubstract = true;
    }
    try {
      let patch = {};
      if (type === "before" && shouldSubstract) {
        const wasteReading = await productionOrderWasteService.get(context.id);
        const productionOrder = await productionOrdersService.get(wasteReading.poi);
        patch.confirmedProduction =
          (parseInt(lodash.get(productionOrder, "confirmedProduction"), "10") || 0) -
          (parseInt(wasteReading.cp, "10") || 0);
        patch.wastedProduction =
          (parseInt(lodash.get(productionOrder, "wastedProduction"), "10") || 0) -
          (parseInt(wasteReading.wp, "10") || 0);
        if (productionOrder.id) {
          await productionOrdersService.patch(productionOrder.id, patch);
        }
      }
      if (type === "after" && ["create", "patch"].indexOf(method) !== -1) {
        const productionOrder = await productionOrdersService.get(result.poi);
        patch.confirmedProduction =
          (parseInt(lodash.get(productionOrder, "confirmedProduction"), "10") || 0) +
          (parseInt(result.cp, "10") || 0);
        patch.wastedProduction =
          (parseInt(lodash.get(productionOrder, "wastedProduction"), "10") || 0) +
          (parseInt(result.wp, "10") || 0);
        if (productionOrder.id) {
          await productionOrdersService.patch(productionOrder.id, patch);
        }
      }
    } catch (error) {
      // console.log(">>>>> ERROR UPDATE PO PRODUCTION", error, result);
    }
    return context;
  };
};
