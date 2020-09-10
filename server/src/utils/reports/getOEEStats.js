const lodash = require("lodash");
const roundDecimal = require("./roundDecimal");

const getOEEStats = ({ totalSelectedDuration, eventsMap = {} }) => {
  if (!eventsMap.actions) {
    eventsMap.actions = {};
  }
  if (!eventsMap.events) {
    eventsMap.events = {};
  }
  if (!eventsMap.stats) {
    eventsMap.stats = {};
  }
  const totalDurationInRange =
    lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) => sum + productionOrder.totalDurationInRange,
      0
    ) || 1;
  lodash.forEach(eventsMap.productionOrders, (productionOrder) => {
    lodash.forEach(productionOrder.actions, (at, key) => {
      if (!eventsMap.actions[key]) {
        eventsMap.actions[key] = 0;
      }
      eventsMap.actions[key] += at;
    });
  });
  let totalUndefinedTimeInHistory = eventsMap.actions[-1] || 0;
  delete eventsMap.actions[-1];
  let totalDurationInHistory = 0;
  lodash.forEach(Object.keys(eventsMap.actions), (key) => {
    const at = eventsMap.actions[key];
    totalDurationInHistory += at;
  });
  lodash.forEach(eventsMap.productionOrders, (productionOrder) => {
    lodash.forEach(productionOrder.events, (ev, key) => {
      if (!eventsMap.events[key]) {
        eventsMap.events[key] = 0;
      }
      eventsMap.events[key] += ev;
    });
  });
  delete eventsMap.events[-1];
  let totalUndefinedTimeInRange = totalDurationInRange - totalDurationInHistory;
  totalUndefinedTimeInRange =
    totalUndefinedTimeInRange > 0 ? totalUndefinedTimeInRange : 0;
  let totalUndefinedTimeInSelectedRange =
    totalSelectedDuration - totalDurationInHistory;
  totalUndefinedTimeInSelectedRange =
    totalUndefinedTimeInSelectedRange > 0
      ? totalUndefinedTimeInSelectedRange
      : 0;
  // eventsMap.actions[-1] = totalUndefinedTimeInSelectedRange;
  // eventsMap.events[-1] = totalUndefinedTimeInSelectedRange;
  eventsMap.actions[-1] = totalUndefinedTimeInRange;
  eventsMap.events[-1] = totalUndefinedTimeInRange;
  const totalPlannedTime =
    lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) => sum + (productionOrder.plannedTime || 0),
      0
    ) || 1;
  eventsMap.graphAvailability =
    lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) =>
        sum +
        (productionOrder.availability || 0) *
          (productionOrder.plannedTime || 0),
      0
    ) / totalPlannedTime;
  eventsMap.graphQuality =
    lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) =>
        sum +
        (productionOrder.quality || 0) * (productionOrder.plannedTime || 0),
      0
    ) / totalPlannedTime;
  eventsMap.stats.idealCycle = roundDecimal({
    value:
      lodash.reduce(
        eventsMap.productionOrders,
        (sum, productionOrder) =>
          sum +
          (productionOrder.idealCycle || 0) *
            (productionOrder.plannedTime || 0),
        0
      ) / totalPlannedTime,
  });
  eventsMap.stats.realCycle = roundDecimal({
    value:
      lodash.reduce(
        eventsMap.productionOrders,
        (sum, productionOrder) =>
          sum +
          (productionOrder.realCycle || 0) * (productionOrder.plannedTime || 0),
        0
      ) / totalPlannedTime,
  });
  eventsMap.stats.realCycleInEvents = roundDecimal({
    value:
      lodash.reduce(
        eventsMap.productionOrders,
        (sum, productionOrder) =>
          sum +
          (productionOrder.realCycleInEvents || 0) *
            (productionOrder.plannedTime || 0),
        0
      ) / totalPlannedTime,
  });
  eventsMap.graphPerformance =
    (eventsMap.stats.idealCycle || 0) /
    (eventsMap.stats.realCycleInEvents || eventsMap.stats.idealCycle || 1);
  // eventsMap.graphPerformance =
  //   lodash.reduce(
  //     eventsMap.productionOrders,
  //     (sum, productionOrder) =>
  //       sum + productionOrder.performance * (productionOrder.plannedTime || 0),
  //     0
  //   ) / totalPlannedTime;
  eventsMap.graphOEE =
    eventsMap.graphAvailability *
    eventsMap.graphQuality *
    eventsMap.graphPerformance;
  eventsMap.stats.totalProductionInRange = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.totalProductionInRange,
    0
  );
  eventsMap.stats.totalProduction = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.totalProduction,
    0
  );
  eventsMap.stats.totalProductionInEvents = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.totalProductionInEvents,
    0
  );
  eventsMap.stats.confirmedProduction = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.confirmedProduction,
    0
  );
  eventsMap.stats.confirmedProductionInEvents = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.confirmedProductionInEvents,
    0
  );
  eventsMap.stats.wastedProduction = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.wastedProduction,
    0
  );
  eventsMap.stats.wastedProductionInEvents = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.wastedProductionInEvents,
    0
  );
  eventsMap.stats.producedWeight = roundDecimal({
    value: lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) => sum + productionOrder.producedWeight,
      0
    ),
  });
  eventsMap.stats.producedWeightInRange = roundDecimal({
    value: lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) => sum + productionOrder.producedWeightInRange,
      0
    ),
  });
  eventsMap.stats.producedWeightInEvents = roundDecimal({
    value: lodash.reduce(
      eventsMap.productionOrders,
      (sum, productionOrder) => sum + productionOrder.producedWeightInEvents,
      0
    ),
  });
  eventsMap.stats.readingsInEvents = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.readingsInEvents,
    0
  );
  eventsMap.stats.totalNonPlannedStoppedTime = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.nonPlannedStoppedTime,
    0
  );
  eventsMap.stats.totalSelectedDuration = totalSelectedDuration;
  eventsMap.stats.totalDurationInRange = totalDurationInRange;
  eventsMap.stats.totalDurationInHistory = totalDurationInHistory;
  eventsMap.stats.totalUndefinedTimeInSelectedRange = totalUndefinedTimeInSelectedRange;
  eventsMap.stats.totalUndefinedTimeInHistory = totalUndefinedTimeInHistory;
  eventsMap.stats.totalUndefinedTimeInRange = totalUndefinedTimeInRange;
  eventsMap.stats.productionTime = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.productionTime,
    0
  );
  eventsMap.stats.plannedDownTime = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.plannedDownTime,
    0
  );
  eventsMap.stats.nonPlannedStoppedTime = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.nonPlannedStoppedTime,
    0
  );
  eventsMap.stats.plannedTime = lodash.reduce(
    eventsMap.productionOrders,
    (sum, productionOrder) => sum + productionOrder.plannedTime,
    0
  );
};

module.exports = getOEEStats;
