const lodash = require("lodash");
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, method, type, params, data, result } = context;
    const sensorsService = app.service("sensors");
    const moldsService = app.service("molds");
    const productsService = app.service("products");
    const productionOrderTypesService = app.service("production_order_types");
    const productionOrdersService = app.service("production_orders");
    const productionOrderEventsService = app.service("production_order_events");
    const eventTypesService = app.service("production_order_event_types");
    if (
      (lodash.get(params, "$productionOrders") ||
        lodash.get(params, "query.$productionOrders")) &&
      method === "find"
    ) {
      params.$productionOrders =
        lodash.get(params, "$productionOrders") ||
        lodash.get(params, "query.$productionOrders");
      lodash.unset(params, "query.$productionOrders");
    }
    if (params.$productionOrders && type === "after") {
      await getConfigs({ app });
      const machines = result.data || result;
      const machineIds = lodash.map(machines, m => m.id);
      const startD = moment(params.$productionOrders.sd);
      const { data: productionOrders } = await productionOrdersService.find({
        query: {
          machineId: { $in: machineIds },
          $populateSelect: ["mostRecentEvent", "lastReading"],
          isActive: true,
          $sort: {
            actualStartDate: 1
          }
        }
      });
      const machineProductionOrdersMap = lodash.groupBy(
        productionOrders,
        "machineId"
      );
      const moldIds = lodash.map(productionOrders, p => p.moldId);
      const { data: molds } = await moldsService.find({
        query: {
          id: { $in: moldIds }
        }
      });
      const moldsMap = lodash.keyBy(molds, "id");
      const productIds = lodash.map(productionOrders, p => p.productId);
      const { data: products } = await productsService.find({
        query: {
          id: { $in: productIds }
        }
      });
      const productsMap = lodash.keyBy(products, "id");
      const productionOrderTypeIds = lodash.map(
        productionOrders,
        p => p.productionOrderTypeId
      );
      const {
        data: productionOrderTypes
      } = await productionOrderTypesService.find({
        query: {
          id: { $in: productionOrderTypeIds }
        }
      });
      const productionOrderTypesMap = lodash.keyBy(productionOrderTypes, "id");
      const { data: noOPEventType } = await eventTypesService.find({
        query: {
          name: "FALTA OP",
          companyId: data.companyId,
          $populateAll: true
        }
      });
      await Promise.all(
        lodash.map(machines, async machine => {
          // TODO use lodash get default value
          if (
            lodash.get(machineProductionOrdersMap, `${machine.id}.length`, 0) >
            0
          ) {
            lodash.set(
              machine,
              "productionOrder",
              lodash.get(machineProductionOrdersMap, `${machine.id}.0`, {})
            );
            lodash.set(
              machine,
              "productionOrder.mold",
              lodash.get(moldsMap, machine.productionOrder.moldId, {})
            );
            lodash.set(
              machine,
              "productionOrder.dataValues.mold",
              lodash.get(moldsMap, machine.productionOrder.moldId, {})
            );
            lodash.set(
              machine,
              "productionOrder.product",
              lodash.get(productsMap, machine.productionOrder.productId, {})
            );
            lodash.set(
              machine,
              "productionOrder.dataValues.product",
              lodash.get(productsMap, machine.productionOrder.productId, {})
            );
            lodash.set(
              machine,
              "productionOrder.production_order_type",
              lodash.get(
                productionOrderTypesMap,
                machine.productionOrder.productionOrderTypeId,
                {}
              )
            );
            lodash.set(
              machine,
              "productionOrder.dataValues.production_order_type",
              lodash.get(
                productionOrderTypesMap,
                machine.productionOrder.productionOrderTypeId,
                {}
              )
            );
          } else {
            machine.productionOrder = {
              $withoutOP: true
            };
            const { data: sensors } = await sensorsService.find({
              query: { machineId: machine.id }
            });
            const { data: events } = await productionOrderEventsService.find({
              query: {
                mi: machine.id,
                si: lodash.get(sensors, "0.id"),
                $populateAll: true,
                "r.0": { $exists: true },
                sd: {
                  $gte: startD.toDate()
                },
                $sort: {
                  sd: -1
                },
                $limit: 1
              }
            });
            machine.events = events;
          }
          machine.noOPEventType = lodash.get(noOPEventType, "0", {
            name: "SIST. SEM COMUNICAÇÃO"
          });
        })
      );
    }
    return context;
  };
};
