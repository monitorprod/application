const lodash = require("lodash");
const moment = require("moment");
const formatNumber = require("format-number");
const getConfigs = require("../../utils/getConfigs");
const { getColor, getActionType } = require("../../utils/events");
const { roundDecimal, getPercentage } = require("../../utils/reports");

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const NUMBER_FORMAT = formatNumber({
  integerSeparator: ".",
  decimal: ","
});

const isSameEvent = ({ lastEvent, currentEvent }) =>
  `${lastEvent.ev || -1}` === `${currentEvent.ev || -1}` &&
  `${lastEvent.tu || ""}` === `${currentEvent.tu || ""}` &&
  `${lastEvent.ui || ""}` === `${currentEvent.ui || ""}`;

module.exports = function () {
  return async context => {
    const { app, method, data, type, params, result } = context;
    // console.time("reportHistory");
    const eventTypesService = app.service("production_order_event_types");
    const productionOrdersService = app.service("production_orders");
    const plantsService = app.service("plants");
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    if (
      (lodash.get(params, "$reportHistory") ||
        lodash.get(params, "query.$reportHistory")) &&
      method === "find"
    ) {
      params.$reportHistory =
        lodash.get(params, "$reportHistory") ||
        lodash.get(params, "query.$reportHistory");
      lodash.unset(params, "query.$reportHistory");
    }
    if (params.$reportHistory && type === "after") {
      await getConfigs({ app });
      const undefinedActionType = getActionType({ app, type: "undefined" });
      const activeActionType = getActionType({ app, type: "active" });
      const maxActionType = getActionType({ app, type: "max" });
      const minActionType = getActionType({ app, type: "min" });
      const closedActionType = getActionType({ app, type: "closed" });
      const noJustifiedActionType = getActionType({ app, type: "noJustified" });
      const scheduledStopActionType = getActionType({
        app,
        type: "scheduledStop"
      });
      const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
      const machines = result.data || result;
      const machineIds = [
        ...lodash.map(machines, m => m.id),
        ...lodash.map(machines, m => `${m.id}`)
      ];
      let { data: types } = await eventTypesService.find({
        query: {
          productionOrderActionTypeId: {
            $ne: closedActionType
          },
          companyId: data.companyId,
          $sort: { productionOrderActionTypeId: 1 }
        }
      });
      const typesMap = {};
      // TODO replace manual maps with keyBy
      lodash.forEach(types, type => (typesMap[type.id] = type));
      const noWorkDayEvent = lodash.find(
        types,
        type =>
          `${type.productionOrderActionTypeId}` === `${noWorkDayActionType}`
      );
      const machinesMap = {};
      lodash.forEach(machines, machine => (machinesMap[machine.id] = machine));
      const startD = moment(params.$reportHistory.sd);
      const endD = moment(params.$reportHistory.ed);
      const currentD = moment(params.$reportHistory.cd);
      // console.time("productionOrderHistoryService.find");
      const { data: summaries } = await productionOrderHistoryService.find({
        query: {
          mi: { $in: machineIds },
          $or: [{ ed: { $gte: startD.toDate() } }, { ed: -1 }],
          sd: { $lte: endD.toDate() },
          $sort: { poi: 1 }
          // $populateAll: true
        }
      });
      const productionOrderIds = [
        ...lodash.map(summaries, sum => sum.poi),
        ...lodash.map(summaries, sum => `${sum.poi}`)
      ];
      const { data: productionOrders } = await productionOrdersService.find({
        query: {
          id: { $in: productionOrderIds },
          isActive: 1
        }
      });
      const machineProductionOrdersMap = lodash.groupBy(
        productionOrders,
        "machineId"
      );
      const plantIds = [
        ...lodash.map(machines, m => m.plantId),
        ...lodash.map(machines, m => `${m.plantId}`)
      ];
      const { data: plants } = await plantsService.find({
        query: {
          id: { $in: plantIds },
          $populateAll: true
        }
      });
      const plantsMap = {};
      lodash.forEach(plants, plant => (plantsMap[plant.id] = plant));
      const hasTurn = ({ startD, plant }) => {
        let turn;
        const firstStartT = moment(
          lodash.get(lodash.first(plant.turns), "startTime")
        ).set({
          year: startD.year(),
          month: startD.month(),
          date: startD.date()
        });
        const firstEndT = moment(
          lodash.get(lodash.first(plant.turns), "endTime")
        ).set({
          year: startD.year(),
          month: startD.month(),
          date: startD.date()
        });
        const lastStartT = moment(
          lodash.get(lodash.last(plant.turns), "startTime")
        ).set({
          year: startD.year(),
          month: startD.month(),
          date: startD.date()
        });
        const lastEndT = moment(
          lodash.get(lodash.last(plant.turns), "endTime")
        ).set({
          year: startD.year(),
          month: startD.month(),
          date: startD.date()
        });
        if (lastStartT.isSameOrAfter(lastEndT, "minute")) {
          lastStartT.subtract(1, "days");
        }
        lodash.forEach(plant.turns, iTurn => {
          const startT = moment(iTurn.startTime).set({
            year: startD.year(),
            month: startD.month(),
            date: startD.date()
          });
          const endT = moment(iTurn.endTime).set({
            year: startD.year(),
            month: startD.month(),
            date: startD.date()
          });
          if (startT.isSameOrAfter(endT, "minute")) {
            startT.subtract(1, "days");
          }
          const weekdayValue = startD.day();
          const weekday = weekdays[weekdayValue];
          const prevWeekdayValue = weekdayValue - 1 >= 0 ? weekdayValue - 1 : 6;
          const prevWeekday = weekdays[prevWeekdayValue];
          if (
            !turn &&
            startD.isSameOrAfter(startT, "minute") &&
            startD.isBefore(endT, "minute") &&
            iTurn[weekday]
            // iTurn[weekday] &&
            // (!iTurn[prevWeekday] && startD.isSameOrAfter(lastEndT, "minute"))
            // TODO what happens Friday last turn
          ) {
            turn = iTurn;
          }
          if (!turn) {
            startT.add(1, "days");
            endT.add(1, "days");
          }
          if (
            !turn &&
            startD.isSameOrAfter(startT, "minute") &&
            startD.isBefore(endT, "minute") &&
            iTurn[weekday]
            // iTurn[weekday] &&
            // (!iTurn[prevWeekday] && startD.isSameOrAfter(lastEndT, "minute"))
          ) {
            turn = iTurn;
          }
        });
        return turn;
      };
      // console.timeEnd("productionOrderHistoryService.find");
      const addMeta = ({ ev }) => {
        // TODO replace Math.round for TOFIXED
        ev.meta = `${lodash.get(typesMap, `${ev.ev}.name`) ||
          "SISTEMA SEM COMUNICAÇÃO"} ${NUMBER_FORMAT(
            roundDecimal({
              value: ev.diff / 60
            }).toFixed(2)
          )}h${ev.poi ? `\nOP: ${ev.poi}` : ""}${
          parseInt(ev.tr) > 0 ? `\n${NUMBER_FORMAT(ev.tr)} ciclos` : ""
          }`;
        ev.bgColor =
          getColor({
            data: app.get(`actionType.${ev.at}`),
            path: "color"
          }) ||
          getColor({
            data: app.get(`actionType.${undefinedActionType}`),
            path: "color"
          });
      };
      const addDifference = ({ sum, ev, diff }) => {
        const machineId = lodash.get(sum, "mi");
        if (!lodash.get(machinesMap, `${machineId}.history`)) {
          lodash.set(machinesMap, `${machineId}.history`, []);
        }
        const hEV = {
          ...ev,
          odiff: diff,
          diff,
          poi: sum.poi,
          value: [diff],
          sd: moment(ev.sd).toDate(),
          ed: moment(ev.ed).toDate()
        };
        addMeta({ ev: hEV });
        machinesMap[machineId].history.push(hEV);
      };
      const { data: noOPEventType } = await eventTypesService.find({
        query: {
          name: "FALTA OP",
          companyId: data.companyId,
          $populateAll: true,
          $limit: 1,
        }
      });
      const { data: noJustifiedEventType } = await eventTypesService.find({
        query: {
          companyId: data.companyId,
          productionOrderActionTypeId: noJustifiedActionType,
          $populateAll: true,
          $limit: 1,
        },
      })
      // console.time("Promise.all");
      await Promise.all(
        lodash.map(summaries, async (sum = {}) => {
          await Promise.all(
            lodash.map(sum.ev, async (ev, index) => {
              ev.sum = sum._id.toString();
              ev.evIndex = index
              const startEVD = moment(ev.sd);
              const endEVD = moment(ev.ed);
              if (
                endEVD.isSameOrBefore(startD, "minute") ||
                startEVD.isSameOrAfter(endD, "minute")
              ) {
                return;
              }
              // TODO needs +1 or not?
              const durationEVD = endEVD.diff(startEVD, "minutes");
              const startOverlap = startD.diff(startEVD, "minutes");
              const endOverlap = endEVD.diff(endD, "minutes");
              const diff =
                durationEVD -
                (startOverlap > 0 ? startOverlap : 0) -
                (endOverlap > 0 ? endOverlap : 0);
              ev.sd = startEVD.isBefore(startD, "minute") ? startD : startEVD;
              ev.ed = endEVD.isAfter(endD, "minute") ? endD : endEVD;
              await addDifference({ sum, ev, diff });
            })
          );
          if (sum.w) {
            const warningD = moment(sum.w);
            if (
              warningD.isSameOrAfter(startD, "minute") &&
              warningD.isSameOrBefore(endD, "minute")
            ) {
              const ev = {
                sum: sum._id.toString(),
                at: lodash.get(
                  noJustifiedEventType,
                  "0.productionOrderActionTypeId"
                ),
                ev: lodash.get(noJustifiedEventType, "0.id"),
                sd: warningD,
                ed: params.$reportHistory.same ? moment() : moment(endD)
              }
              const diff = ev.ed.diff(ev.sd, "minutes");
              await addDifference({ sum, ev, diff });
            }
          }
        })
      );
      // console.timeEnd("Promise.all");
      const findProductionOrders = async machine => {
        const { data: productionOrders } = await app
          .service("production_orders")
          .find({
            query: {
              machineId: machine.id,
              $populateSelect: ["mostRecentEvent", "lastReading"],
              isActive: true,
              $sort: {
                actualStartDate: 1
              },
              $limit: 1
            }
          });
        // TODO always verify length > 0
        if (productionOrders.length > 0) {
          machine.productionOrder = productionOrders[0];
        }
      };
      // console.time("context.result.data");
      context.result.data = await Promise.all(
        lodash.map(context.result.data, async machine => {
          let plant = lodash.get(plantsMap, machine.plantId);
          let history = machinesMap[machine.id].history;
          const noWorkHours = [];
          if (plant) {
            let lastTurn;
            lodash.forEach(lodash.sortBy(plant.turns, "startTime"), turn => {
              if (
                lastTurn &&
                moment(turn.startTime).diff(
                  moment(lastTurn.endTime),
                  "minutes"
                ) > 15
              ) {
                const noWorkEvent = {
                  sd: moment(lastTurn.endTime).set({
                    year: startD.year(),
                    month: startD.month(),
                    date: startD.date()
                  }),
                  ed: moment(turn.startTime).set({
                    year: startD.year(),
                    month: startD.month(),
                    date: startD.date()
                  })
                };
                if (!params.$reportHistory.same) {
                  noWorkHours.push(noWorkEvent);
                } else if (
                  params.$reportHistory.same &&
                  moment(noWorkEvent.sd).isBefore(moment(), "minutes")
                ) {
                  noWorkEvent.ed = moment().isBefore(
                    moment(noWorkEvent.ed),
                    "minutes"
                  )
                    ? moment()
                    : moment(noWorkEvent.ed);
                  noWorkHours.push(noWorkEvent);
                }
              }
              lastTurn = turn;
            });
          }
          if (history) {
            lodash.forEach(noWorkHours, noWorkEvent => {
              const diff = moment(noWorkEvent.ed).diff(
                moment(noWorkEvent.sd),
                "minutes"
              );
              const hEV = {
                ev: noWorkDayEvent.id,
                at: noWorkDayActionType,
                odiff: diff,
                diff,
                value: [diff],
                sd: moment(noWorkEvent.sd).toDate(),
                ed: moment(noWorkEvent.ed).toDate()
              };
              addMeta({ ev: hEV });
              history.push(hEV);
            });
          }
          history = lodash.filter(
            lodash.sortBy(history, "sd"),
            item => item.value[0] > 0
          );
          for (let index = 0; index < history.length; index++) {
            if (index === 0) {
              history = lodash.filter(history, item => item.value[0] > 0);
            }
            const ev = history[index];
            const startEVD = moment(ev.sd);
            let endEVD = moment(ev.ed);
            // TODO move all to minutes?
            // ev.diff = endEVD.diff(startEVD, "minutes");
            // complete undefined to the left
            if (index === 0 && startEVD.isAfter(startD, "minute")) {
              // console.log(">>> has turn", startD.toDate(), hasTurn({ startD: moment(startD.toDate()), plant }))
              let diff = startEVD.diff(startD, "minutes");
              const hEV = {
                at: -1,
                ev: -1,
                diff,
                value: [diff],
                sd: startD.toDate(),
                ed: startEVD.toDate()
              };
              addMeta({ ev: hEV });
              history.splice(0, 0, hEV);
              index = -1;
              continue;
            }
            // complete undefined to the right
            if (
              index === history.length - 1 &&
              moment(endEVD).isBefore(endD, "minute")
            ) {
              // complete to current time
              if (
                index === history.length - 1 &&
                ev.at !== -1 &&
                moment(endEVD).isBefore(currentD, "minute")
              ) {
                ev.ed = currentD.toDate();
                let diff =
                  ev.value[0] + moment(currentD).diff(endEVD, "minutes");
                ev.diff = diff;
                ev.value = [diff];
                addMeta({ ev });
                endEVD = moment(ev.ed);
              }
              let diff = moment(endD).diff(endEVD, "minutes");
              // console.log(">>> has turn", endEVD.toDate(), hasTurn({ startD: moment(endEVD.toDate()), plant }))
              // let evHasTurn = hasTurn({ startD: moment(endEVD.toDate()), plant })
              const hEV = {
                // at: lodash.isNil(evHasTurn) ? noWorkDayActionType : -1,
                // ev: lodash.isNil(evHasTurn) ? noWorkDayEvent.id : -1,
                at: -1,
                ev: -1,
                diff,
                value: [diff],
                sd: endEVD.toDate(),
                ed: endD.toDate()
              };
              addMeta({ ev: hEV });
              // if (params.$reportHistory.same && !lodash.isNil(evHasTurn)) {
              if (params.$reportHistory.same) {
                hEV.bgColor = getColor({
                  data: app.get(`actionType.${closedActionType}`),
                  path: "color"
                });
              }
              history.splice(history.length, 0, hEV);
              index = -1;
              continue;
            }
            const nextEV = history[index + 1];
            if (nextEV) {
              const startNextEVD = moment(nextEV.sd);
              const endNextEVD = moment(nextEV.ed);
              // complete undefined between events
              if (endEVD.isBefore(startNextEVD, "minute")) {
                let diff = startNextEVD.diff(endEVD, "minutes");
                if (diff >= 15) {
                  // console.log(">>> has turn", endEVD.toDate(), hasTurn({ startD: moment(endEVD.toDate()), plant }))
                  const hEV = {
                    at: -1,
                    ev: -1,
                    diff,
                    value: [diff],
                    sd: endEVD.toDate(),
                    ed: startNextEVD.toDate()
                  };
                  addMeta({ ev: hEV });
                  history.splice(index + 1, 0, hEV);
                  index = -1;
                  continue;
                } else {
                  let diff = startNextEVD.diff(startEVD, "minutes");
                  ev.diff = diff;
                  ev.value = [diff];
                  ev.ed = startNextEVD.toDate();
                  addMeta({ ev });
                }
              }
              // overlaping events
              if (endEVD.isAfter(startNextEVD, "minute")) {
                if (nextEV.at === -1) {
                  // discard overlaped undefined
                  if (endEVD.isAfter(endNextEVD, "minute")) {
                    history.splice(index + 1, 1);
                    index = -1;
                    continue;
                  }
                  // discard part of undefined
                  else {
                    let diff = endNextEVD.diff(endEVD, "minutes");
                    nextEV.diff = diff;
                    nextEV.value = [diff];
                    nextEV.sd = endEVD.toDate();
                    addMeta({ ev: nextEV });
                    index = -1;
                    continue;
                  }
                } else if (
                  !isSameEvent({ lastEvent: ev, currentEvent: nextEV })
                ) {
                  if (ev.at !== -1 && `${nextEV.at}` === `${noJustifiedActionType}`) {
                    let diff = moment(endNextEVD).diff(endEVD, "minutes");
                    nextEV.sd = endEVD.toDate();
                    nextEV.diff = diff;
                    nextEV.value = [diff];
                  } else {
                    let diff = moment(startNextEVD).diff(startEVD, "minutes");
                    ev.ed = startNextEVD.toDate();
                    ev.diff = diff;
                    ev.value = [diff];
                  }
                  addMeta({ ev });
                  if (endEVD.isAfter(endNextEVD, "minute")) {
                    let diff = endEVD.diff(endNextEVD, "minutes");
                    const hEV = {
                      ...ev,
                      diff,
                      value: [diff],
                      sd: endNextEVD.toDate(),
                      ed: endEVD.toDate()
                    };
                    addMeta({ ev: hEV });
                    history.splice(index + 2, 0, hEV);
                    index = -1;
                    continue;
                  }
                }
              }
            }
            const lastEV = history[index - 1];
            // undefined change colors
            if (ev.ev === -1 && index !== history.length - 1) {
              const activeOP = lodash.find(
                lodash.get(machineProductionOrdersMap, machine.id),
                productionOrder =>
                  moment(ev.sd).isAfter(
                    moment(productionOrder.actualStartDate),
                    "minute"
                  )
              );
              if (
                !activeOP &&
                (!lastEV ||
                  !nextEV ||
                  (lastEV && nextEV && `${lastEV.poi}` !== `${nextEV.poi}`))
              ) {
                ev.at = lodash.get(
                  noOPEventType,
                  "0.productionOrderActionTypeId"
                );
                ev.ev = lodash.get(noOPEventType, "0.id");
                delete ev.poi;
                addMeta({ ev });
              }
            }
          }
          if (history.length === 0 && params.$reportHistory.same) {
            const diffEmpty = moment(currentD).diff(startD, "minutes");
            // console.log(">>> has turn diffEmpty")
            const hEV = {
              at: -1,
              ev: -1,
              diff: diffEmpty,
              value: [diffEmpty]
            };
            addMeta({ ev: hEV });
            history.push(hEV);
          }
          history = lodash.filter(history, item => item.value[0] > 0);
          const durationStartD = startD;
          const durationEndD = endD;
          const totalDurationInRange =
            durationEndD.diff(durationStartD, "minutes") + 1;
          let totalDurationInHistory = 0;
          let productionTime = 0;
          let plannedDownTime = 0;
          lodash.forEach(history, ev => {
            if (ev.at === -1) {
              return;
            }
            const value = ev.value[0];
            totalDurationInHistory += value;
            if (
              [
                `${activeActionType}`,
                `${maxActionType}`,
                `${minActionType}`
              ].indexOf(`${ev.at}`) !== -1
            ) {
              productionTime += value;
            }
            if (
              [`${noWorkDayActionType}`, `${scheduledStopActionType}`].indexOf(
                `${ev.at}`
              ) !== -1
            ) {
              plannedDownTime += value;
            }
          });
          let totalUndefinedTimeInRange =
            totalDurationInRange - totalDurationInHistory;
          totalUndefinedTimeInRange =
            totalUndefinedTimeInRange > 0 ? totalUndefinedTimeInRange : 0;
          let plannedTime =
            totalDurationInRange - plannedDownTime - totalUndefinedTimeInRange;
          plannedTime = plannedTime > 0 ? plannedTime : 0;
          const availability =
            plannedTime > 0 ? productionTime / (plannedTime || 1) : 1;
          if (params.$reportHistory.same) {
            await findProductionOrders(machine);
          }
          if (totalUndefinedTimeInRange > 0) {
            // console.log(">>> has turn totalUndefinedTimeInRange")
            const hEV = {
              at: -1,
              ev: -1,
              diff: totalUndefinedTimeInRange,
              value: [totalUndefinedTimeInRange]
            };
            addMeta({ ev: hEV });
            if (params.$reportHistory.same) {
              hEV.bgColor = getColor({
                data: app.get(`actionType.${closedActionType}`),
                path: "color"
              });
            }
            history.push(hEV);
          }
          if (
            history.length <= (params.$reportHistory.same ? 2 : 1) &&
            lodash.get(history, "0.ev") === -1
          ) {
            const activeOP = !!machine.productionOrder;
            if (!activeOP) {
              const hEV = history[0];
              hEV.at = lodash.get(
                noOPEventType,
                "0.productionOrderActionTypeId"
              );
              hEV.ev = lodash.get(noOPEventType, "0.id");
              addMeta({ ev: hEV });
            }
          }
          return {
            ...machine,
            history,
            stats: {
              oem: NUMBER_FORMAT(
                roundDecimal({
                  value: getPercentage({ value: availability })
                }).toFixed(2)
              ),
              undefinedTime: totalUndefinedTimeInRange
            }
          };
        })
      );
      context.result.noOPEventType = noOPEventType;
      // console.timeEnd("context.result.data");
    }
    // console.timeEnd("reportHistory");
    return context;
  };
};
