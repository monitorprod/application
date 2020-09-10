const lodash = require("lodash");

const populateHistory = async ({
  app,
  summaries = [],
  machinesMap = {},
  startD,
  endD,
  withMolds = false,
  withPlants = false
}) => {
  const moldsService = app.service("molds");
  const productsService = app.service("products");
  const plantsService = app.service("plants");
  const productionOrdersService = app.service("production_orders");
  const productionOrderEventsService = app.service("production_order_events");
  const productionOrderWasteService = app.service("production_order_waste");
  const productionOrderIds = [
    ...lodash.map(summaries, sum => sum.poi),
    ...lodash.map(summaries, sum => `${sum.poi}`)
  ];
  const { data: productionOrders } = await productionOrdersService.find({
    query: {
      id: { $in: productionOrderIds }
    }
  });
  const productionOrdersMap = lodash.keyBy(productionOrders, "id");
  let moldsMap = {};
  if (withMolds) {
    const moldIds = lodash.map(productionOrders, p => p.moldId);
    const { data: molds } = await moldsService.find({
      query: {
        id: { $in: moldIds }
      }
    });
    moldsMap = lodash.keyBy(molds, "id");
  }
  let plantsMap = {};
  if (withPlants) {
    const plantIds = [
      ...lodash.map(productionOrders, p => p.plantId),
      ...lodash.map(machinesMap, m => m.plantId)
    ];
    const { data: plants } = await plantsService.find({
      query: {
        id: { $in: plantIds }
      }
    });
    plantsMap = lodash.keyBy(plants, "id");
  }
  const productIds = lodash.map(productionOrders, p => p.productId);
  const { data: products } = await productsService.find({
    query: {
      id: { $in: productIds }
    }
  });
  const productsMap = lodash.keyBy(products, "id");
  const { data: eventsReadings } = await productionOrderEventsService.find({
    query: {
      poi: { $in: productionOrderIds },
      nw: null,
      w: null,
      rp: null,
      tr: { $gt: 0 },
      $or: [{ ed: { $gte: startD.toDate() } }, { ed: -1 }],
      sd: { $lte: endD.toDate() }
    }
  });
  const eventsReadingsMap = lodash.groupBy(eventsReadings, "poi");
  const { data: productionWaste } = await productionOrderWasteService.find({
    query: {
      poi: { $in: productionOrderIds },
      $or: [{ ed: { $gte: startD.toDate() } }, { ed: -1 }],
      sd: { $lte: endD.toDate() }
    }
  });
  const productionWasteMap = lodash.groupBy(productionWaste, "poi");
  return {
    productionOrdersMap,
    plantsMap,
    moldsMap,
    productsMap,
    eventsReadingsMap,
    productionWasteMap
  };
};

module.exports = populateHistory;
