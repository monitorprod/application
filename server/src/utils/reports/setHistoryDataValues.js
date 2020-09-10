const lodash = require("lodash");

const setHistoryDataValues = ({
  history = {},
  productionOrdersMap = {},
  plantsMap = {},
  machinesMap = {},
  moldsMap = {},
  productsMap = {}
}) => {
  history.productionOrder = lodash.get(productionOrdersMap, history.poi, {});
  // TODO use lodash set for ALL?
  // TODO util for set populatedValues?
  lodash.set(
    history,
    "productionOrder.machine",
    lodash.get(machinesMap, history.productionOrder.machineId, {})
  );
  lodash.set(
    history,
    "productionOrder.dataValues.machine",
    lodash.get(machinesMap, history.productionOrder.machineId, {})
  );
  lodash.set(
    history,
    "productionOrder.mold",
    lodash.get(moldsMap, history.productionOrder.moldId, {})
  );
  lodash.set(
    history,
    "productionOrder.dataValues.mold",
    lodash.get(moldsMap, history.productionOrder.moldId, {})
  );
  lodash.set(
    history,
    "productionOrder.product",
    lodash.get(productsMap, history.productionOrder.productId, {})
  );
  lodash.set(
    history,
    "productionOrder.dataValues.product",
    lodash.get(productsMap, history.productionOrder.productId, {})
  );
  lodash.set(
    history,
    "productionOrder.plant",
    lodash.get(plantsMap, history.productionOrder.plantId, {})
  );
  lodash.set(
    history,
    "productionOrder.dataValues.plant",
    lodash.get(
      plantsMap,
      history.productionOrder.machine.plantId,
      lodash.get(plantsMap, history.productionOrder.plantId, {})
    )
  );
};

module.exports = setHistoryDataValues;
