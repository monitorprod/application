const lodash = require("lodash");

module.exports = async ({ app, data }) => {
  const productionOrdersService = app.service("production_orders");
  const productionOrderHistoryService = app.service("production_order_history");
  const machinesService = app.service("machines");
  const sensorsService = app.service("sensors");
  const plantsService = app.service("plants");
  let productionOrder, machine, plant, mostRecentEvent;
  if (data.sensorId) {
    const { data: sensors } = await sensorsService.find({
      query: { id: data.sensorId },
    });
    if (sensors.length) {
      data.machineId = lodash.get(sensors, "0.machineId");
    }
  }
  if (data.machineId) {
    const { data: machineProductionOrder } = await productionOrdersService.find(
      {
        query: {
          machineId: { $in: [data.machineId, `${data.machineId}`] },
          isActive: true,
        },
      }
    );
    if (machineProductionOrder.length) {
      productionOrder = machineProductionOrder[0];
    }
  } else if (data.productionOrderId) {
    productionOrder = lodash.get(
      await productionOrdersService.find({
        query: { id: data.productionOrderId, $limit: 1 },
      }),
      "data.0"
    );
  }
  if (productionOrder) {
    mostRecentEvent = lodash.get(
      await productionOrderHistoryService.find({
        query: {
          poi: lodash.get(productionOrder, "id"),
          $mostRecentEvent: true,
        },
      }),
      "data.0"
    );
  }
  machine = await machinesService.get(
    data.machineId || lodash.get(productionOrder, "machineId")
  );
  plant = await plantsService.get(
    lodash.get(productionOrder, "plantId") || lodash.get(machine, "plantId")
  );
  return {
    plant,
    machine,
    productionOrder,
    mostRecentEvent,
    mostRecentEventType: lodash.get(
      mostRecentEvent,
      "productionOrderEventType.id"
    ),
    mostRecentActionType: lodash.get(
      mostRecentEvent,
      "productionOrderEventType.productionOrderActionTypeId"
    ),
    mostRecentTurn: lodash.get(mostRecentEvent, "tu"),
    machineId: machine.id,
  };
};
