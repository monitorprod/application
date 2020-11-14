const lodash = require("lodash");
const moment = require("moment");
const getActionType = require("../events/getActionType");

const getCavitiesChanges = ({ startD, endD, history }) => {
  let initRange = false;
  let endRange = false;
  return (
    lodash.reduce(
      lodash.get(history, "cav"),
      (changes, cav, index) => {
        // const startD = moment(data.startDate);
        // const endD = data.endDate === -1 ? moment() : moment(data.endDate);
        const cavD = moment(cav.d);
        if (!endRange && !initRange) {
          if (startD.isSame(cavD, "minute")) {
            initRange = true;
          } else if (startD.isBefore(cavD, "minute")) {
            initRange = true;
            if (index > 0) {
              changes.push(lodash.get(history, `cav.${index - 1}`));
            }
          }
        }
        if (!endRange && initRange) {
          if (endD.isAfter(cavD, "minutes")) {
            changes.push(cav);
          } else {
            endRange = true;
          }
        }
        if (
          index === (lodash.get(history, "cav.length") || 0) - 1 &&
          changes.length === 0
        ) {
          changes.push(cav);
        }
        return changes;
      },
      []
    ) || []
  );
};

const getTotalProductionInRange = ({
  startD,
  endD,
  history = {},
  readingsMap
}) => {
  const cavitiesChanges = getCavitiesChanges({ startD, endD, history });
  let openCavities,
    changesIndex = 0;
  return lodash.reduce(
    readingsMap,
    (sum, { reading, eventDiff }) => {
      if (cavitiesChanges.length) {
        if (!openCavities) {
          openCavities = lodash.get(cavitiesChanges, `${changesIndex}.cav`);
        }
        // TODO take into account when cavities change in the middle of an event?
        const nextCavD = moment(
          lodash.get(cavitiesChanges, `${changesIndex + 1}.d`)
        );
        if (
          moment(startD)
            .add(eventDiff, "minutes")
            .isAfter(nextCavD)
        ) {
          changesIndex += 1;
          openCavities = lodash.get(cavitiesChanges, `${changesIndex}.cav`);
        }
      }
      if (!openCavities) {
        openCavities = lodash.get(history, "productionOrder.openCavities") || 0;
      }
      return sum + (parseInt(openCavities, "10") || 0) * parseInt(reading, 10);
    },
    0
  );
};

const getHistoryStats = ({
  app,
  startD,
  endD,
  history = {},
  eventsMap = {},
  eventsReadings = [],
  productionWaste = [],
  level
}) => {
  try {
    const stats = {
      actions: {},
      events: {}
    };
    if (!eventsMap.actions) {
      eventsMap.actions = {};
    }
    if (!eventsMap.events) {
      eventsMap.events = {};
    }
    const activeActionType = getActionType({ app, type: "active" });
    const maxActionType = getActionType({ app, type: "max" });
    const minActionType = getActionType({ app, type: "min" });
    const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
    const scheduledStopActionType = getActionType({
      app,
      type: "scheduledStop"
    });
    const closedActionType = getActionType({ app, type: "closed" });
    const historyStartD = moment(history.sd);
    const historyEndD = moment(
      history.ed && history.ed !== -1 ? history.ed : Date.now()
    );
    const durationStartD = historyStartD.isBefore(startD, "minute")
      ? startD
      : historyStartD;
    const durationEndD = historyEndD.isAfter(endD, "minute")
      ? endD
      : historyEndD;
    let totalDurationInRange = durationEndD.diff(durationStartD, "minutes") + 1;
    totalDurationInRange = totalDurationInRange > 0 ? totalDurationInRange : 0;
    const totalSelectedDuration = endD.diff(startD, "minutes") + 1;
    let totalDurationInHistory = 0;
    let productionTime = 0;
    let plannedDownTime = 0;
    let totalUndefinedTimeInHistory = eventsMap.actions[-1] || 0;
    delete eventsMap.actions[-1];
    lodash.forEach(eventsMap.actions, (at, key) => {
      totalDurationInHistory += at;
      if (
        [`${activeActionType}`, `${maxActionType}`, `${minActionType}`].indexOf(
          `${key}`
        ) !== -1
      ) {
        productionTime += at;
      }
      if (
        [`${noWorkDayActionType}`, `${scheduledStopActionType}`].indexOf(
          `${key}`
        ) !== -1
      ) {
        plannedDownTime += at;
      }
      let atKey = key;
      if (`${key}` === `${closedActionType}`) {
        atKey = -1;
      }
      if (!stats.actions[atKey]) {
        stats.actions[atKey] = 0;
      }
      stats.actions[atKey] += at;
    });
    let totalUndefinedTimeInRange =
      totalDurationInRange - totalDurationInHistory;
    totalUndefinedTimeInRange =
      totalUndefinedTimeInRange > 0 ? totalUndefinedTimeInRange : 0;
    let totalUndefinedTimeInSelectedRange =
      totalSelectedDuration - totalDurationInHistory;
    totalUndefinedTimeInSelectedRange =
      totalUndefinedTimeInSelectedRange > 0
        ? totalUndefinedTimeInSelectedRange
        : 0;
    stats.actions[-1] = totalUndefinedTimeInRange;
    delete eventsMap.events[-1];
    lodash.forEach(eventsMap.events, (ev, key) => {
      let evKey = key;
      if (`${key}` === `${closedActionType}`) {
        evKey = -1;
      }
      if (!stats.events[evKey]) {
        stats.events[evKey] = 0;
      }
      stats.events[evKey] += ev;
    });
    stats.events[-1] = totalUndefinedTimeInRange;
    stats.totalDurationInRange = totalDurationInRange;
    stats.totalDuration = historyEndD.diff(historyStartD, "minutes") + 1;
    let nonPlannedStoppedTime =
      totalDurationInRange -
      plannedDownTime -
      totalUndefinedTimeInRange -
      productionTime;
    nonPlannedStoppedTime =
      nonPlannedStoppedTime > 0 ? nonPlannedStoppedTime : 0;
    let plannedTime =
      totalDurationInRange - plannedDownTime - totalUndefinedTimeInRange;
    plannedTime = plannedTime > 0 ? plannedTime : 0;
    stats.totalSelectedDuration = totalSelectedDuration;
    stats.totalDurationInRange = totalDurationInRange;
    stats.totalDurationInHistory = totalDurationInHistory;
    stats.totalUndefinedTimeInSelectedRange = totalUndefinedTimeInSelectedRange;
    stats.totalUndefinedTimeInHistory = totalUndefinedTimeInHistory;
    stats.totalUndefinedTimeInRange = totalUndefinedTimeInRange;
    stats.productionTime = productionTime;
    stats.plannedDownTime = plannedDownTime;
    stats.nonPlannedStoppedTime = nonPlannedStoppedTime;
    stats.plannedTime = plannedTime;
    stats.availability =
      plannedTime > 0 ? productionTime / (plannedTime || 1) : 1;
    const totalProductionInRange = getTotalProductionInRange({
      startD,
      endD,
      history,
      readingsMap: eventsMap.readingsMap
    });
    // console.log("eventsMap.readingsMap", eventsMap.readingsMap)
    const totalProduction = parseFloat(
      lodash.get(history, "productionOrder.totalProduction") || 0
    );
    // const confirmedProduction =
    //   parseFloat(lodash.get(history, "productionOrder.confirmedProduction") || 0) ||
    //   totalProduction;
    const confirmedProduction = parseFloat(
      lodash.get(history, "productionOrder.confirmedProduction") || 0
    );
    const wastedProduction = parseFloat(
      lodash.get(history, "productionOrder.wastedProduction") || 0
    );
    const producedWeight =
      ((lodash.get(history, "productionOrder.product.weight") || 0) *
        confirmedProduction) /
      1000;
    const producedWeightInRange =
      ((lodash.get(history, "productionOrder.product.weight") || 0) *
        totalProductionInRange) /
      1000;
    stats.totalProductionInRange = totalProductionInRange;
    stats.totalProduction = totalProduction;
    stats.confirmedProduction = confirmedProduction;
    stats.wastedProduction = wastedProduction;
    stats.producedWeight = producedWeight;
    stats.producedWeightInRange = producedWeightInRange;
    let readingsInEvents = 0;
    // lodash.forEach(eventsReadings, ({ r }) => {
    //   readingsInEvents += lodash.reduce(
    //     r,
    //     (sum, { t }) => (sum += parseInt(t, "10") || 0),
    //     0
    //   );
    // });
    readingsInEvents = eventsMap.readings;
    stats.readingsEvents = eventsReadings;
    stats.readingsInEvents = readingsInEvents;
    // stats.totalProductionInEvents =
    //   (parseInt(lodash.get(history, "productionOrder.openCavities"), "10") || 0) * readingsInEvents;
    let totalProductionInEvents = lodash.reduce(
      eventsReadings,
      (sum, { t }) => (sum += parseInt(t, "10") || 0),
      0
    );
    totalProductionInEvents = totalProductionInRange;
    totalProductionInEvents =
      totalProductionInEvents > 0 ? totalProductionInEvents : 0;
    stats.totalProductionInEvents = totalProductionInEvents;
    const realCycleInEvents = (productionTime * 60) / (readingsInEvents || 1);
    stats.realCycleInEvents = realCycleInEvents;
    let confirmedProductionInEvents = lodash.reduce(
      productionWaste,
      (sum, { cp }) => (sum += parseInt(cp, "10") || 0),
      0
    );
    confirmedProductionInEvents =
      confirmedProductionInEvents > 0 ? confirmedProductionInEvents : totalProductionInEvents;
    // confirmedProductionInEvents = confirmedProductionInEvents > 0 ? confirmedProductionInEvents : 0;
    let wastedProductionInEvents = lodash.reduce(
      productionWaste,
      (sum, { wp }) => (sum += parseInt(wp, "10") || 0),
      0
    );
    // wastedProductionInEvents =
    //   wastedProductionInEvents > 0
    //     ? wastedProductionInEvents
    //     : totalProductionInEvents - confirmedProductionInEvents;
    wastedProductionInEvents =
      wastedProductionInEvents > 0 ? wastedProductionInEvents : 0;
    // let confirmedProductionInEvents =
    //   totalProductionInEvents - wastedProductionInEvents;
    // confirmedProductionInEvents =
    //   confirmedProductionInEvents > 0 ? confirmedProductionInEvents : 0;
    stats.confirmedProductionInEvents = confirmedProductionInEvents;
    stats.wastedProductionInEvents = wastedProductionInEvents;
    const productWeight =
      lodash.get(history, "productionOrder.product.weight") || 0;
    const producedWeightInEvents =
      (productWeight * totalProductionInEvents) / 1000;
    const confirmedWeightInEvents =
      (productWeight * confirmedProductionInEvents) / 1000;
    const wastedWeightInEvents =
      (productWeight * wastedProductionInEvents) / 1000;
    stats.producedWeightInEvents = producedWeightInEvents;
    stats.confirmedWeightInEvents = confirmedWeightInEvents;
    stats.wastedWeightInEvents = wastedWeightInEvents;
    // stats.quality =
    //   totalProduction > 0 ? confirmedProduction / (totalProduction || confirmedProduction || 1) : 1;
    stats.quality =
      totalProductionInEvents > 0 && level === "N1"
        ? confirmedProductionInEvents /
        (totalProductionInEvents || confirmedProductionInEvents || 1)
        : 1;
    // stats.quality =
    //   totalProductionInEvents > 0 && level === "N1"
    //     ? (totalProductionInEvents - wastedProductionInEvents) /
    //       (totalProductionInEvents || 1)
    //     : 1;
    const idealCycle = parseFloat(
      lodash.get(history, "productionOrder.idealCycle") || 0
    );
    const realCycle = (productionTime * 60) / (eventsMap.readings || 1);
    stats.idealCycle = idealCycle;
    stats.realCycle = realCycle;
    // stats.performance = idealCycle / (realCycle || idealCycle || 1);
    stats.performance = idealCycle / (realCycleInEvents || idealCycle || 1);
    stats.oee = stats.availability * stats.quality * stats.performance;
    return stats;
  } catch (error) {
    console.log("!!! GET HISTORY STATS ERROR", error);
  }
};

module.exports = getHistoryStats;
