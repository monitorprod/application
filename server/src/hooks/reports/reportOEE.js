const lodash = require("lodash");
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");
const {
  acumulateEvents,
  getPercentage,
  roundDecimal,
  getHistoryStats,
  getOEEStats,
  populateHistory,
  setHistoryDataValues,
} = require("../../utils/reports");
const { getActionType, getColor } = require("../../utils/events");

module.exports = function () {
  return async (context) => {
    const { app, method, type, params, result } = context;
    const level = lodash.get(params, "payload.company.level");
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    if (
      (lodash.get(params, "$reportOEE") ||
        lodash.get(params, "query.$reportOEE")) &&
      method === "find"
    ) {
      params.$reportOEE =
        lodash.get(params, "$reportOEE") ||
        lodash.get(params, "query.$reportOEE");
      lodash.unset(params, "query.$reportOEE");
    }
    if (params.$reportOEE && type === "after") {
      await getConfigs({ app });
      const undefinedActionType = getActionType({ app, type: "undefined" });
      const machines = result.data || result;
      const machineIds = [
        ...lodash.map(machines, (m) => m.id),
        ...lodash.map(machines, (m) => `${m.id}`),
      ];
      const startD = moment(params.$reportOEE.sd);
      const endD = moment(params.$reportOEE.ed);
      const { data: summaries } = await productionOrderHistoryService.find({
        query: {
          mi: { $in: machineIds },
          $or: [{ ed: { $gte: startD.toDate() } }, { ed: -1 }],
          sd: { $lte: endD.toDate() },
          // $populateAll: true
        },
      });
      const {
        productionOrdersMap,
        productsMap,
        eventsReadingsMap,
        productionWasteMap,
      } = await populateHistory({
        app,
        summaries,
        startD,
        endD,
      });
      const eventsMap = {
        productionOrders: {},
      };
      lodash.forEach(summaries, (history) => {
        setHistoryDataValues({ history, productionOrdersMap, productsMap });
        eventsMap.productionOrders[history.poi] = {
          poi: history.productionOrder,
        };
        lodash.map(history.ev, (event) =>
          acumulateEvents({
            startD,
            endD,
            eventsMap: eventsMap.productionOrders[history.poi],
            event,
          })
        );
        const historyStats = getHistoryStats({
          app,
          startD,
          endD,
          history,
          eventsMap: eventsMap.productionOrders[history.poi],
          eventsReadings: eventsReadingsMap[history.poi],
          productionWaste: productionWasteMap[history.poi],
          level,
        });
        eventsMap.productionOrders[history.poi] = {
          ...eventsMap.productionOrders[history.poi],
          ...historyStats,
        };
      });
      const totalSelectedDuration =
        (endD.diff(startD, "minutes") + 1) * machines.length;
      getOEEStats({ totalSelectedDuration, eventsMap });
      lodash.forEach(eventsMap.productionOrders, (productionOrder) => {
        productionOrder.availability = roundDecimal({
          value: getPercentage({ value: productionOrder.availability }),
        });
        productionOrder.quality = roundDecimal({
          value: getPercentage({ value: productionOrder.quality }),
        });
        productionOrder.performance = roundDecimal({
          value: getPercentage({ value: productionOrder.performance }),
        });
        productionOrder.oee = roundDecimal({
          value: getPercentage({ value: productionOrder.oee }),
        });
        // productionOrder.producedWeight = roundDecimal({
        //   value: productionOrder.producedWeight
        // });
        productionOrder.producedWeightInEvents = roundDecimal({
          value: productionOrder.producedWeightInEvents,
        });
        productionOrder.confirmedWeightInEvents = roundDecimal({
          value: productionOrder.confirmedWeightInEvents,
        });
        productionOrder.wastedWeightInEvents = roundDecimal({
          value: productionOrder.wastedWeightInEvents,
        });
        productionOrder.totalDurationInRange = roundDecimal({
          value: productionOrder.totalDurationInRange / 60,
        });
        lodash.forEach(productionOrder.actions, (at, key) => {
          productionOrder.actions[`value${key}`] = roundDecimal({
            value: at / 60,
          });
          productionOrder.actions[`percentage${key}`] = roundDecimal({
            value: getPercentage({
              value:
                at / (productionOrder.totalDurationInRange * 60 || at || 1),
            }),
          });
        });
        productionOrder.oIdealCycle = productionOrder.idealCycle;
        productionOrder.idealCycle = roundDecimal({
          value: productionOrder.idealCycle,
        });
        productionOrder.oRealCycleInEvents = productionOrder.realCycleInEvents;
        productionOrder.realCycleInEvents = roundDecimal({
          value: productionOrder.realCycleInEvents,
        });
        productionOrder.groupTotal = {
          // totalProductionInRange: productionOrder.totalProductionInRange,
          totalProductionInEvents: productionOrder.totalProductionInEvents,
          // totalProduction: productionOrder.totalProduction,
          // confirmedProduction: productionOrder.confirmedProduction,
          confirmedProductionInEvents:
            productionOrder.confirmedProductionInEvents,
          // wastedProduction: productionOrder.wastedProduction,
          wastedProductionInEvents: productionOrder.wastedProductionInEvents,
          // producedWeight: productionOrder.producedWeight,
          // producedWeightInRange: productionOrder.producedWeightInRange,
          idealCycle: productionOrder.idealCycle,
          realCycleInEvents: productionOrder.realCycleInEvents,
          producedWeightInEvents: productionOrder.producedWeightInEvents,
          confirmedWeightInEvents: productionOrder.confirmedWeightInEvents,
          wastedWeightInEvents: productionOrder.wastedWeightInEvents,
          totalPlannedTime: productionOrder.plannedTime || 0,
          totalDurationInRange: productionOrder.totalDurationInRange,
          actions: productionOrder.actions,
        };
      });
      // console.log("reportOEE", eventsMap);
      const hasActionTypes = Object.keys(eventsMap.actions).length > 0;
      const undefinedActionTypeName = lodash.get(
        app.get(`actionType.${undefinedActionType}`),
        "name"
      );
      const undefinedActionTypeColor = getColor({
        data: app.get(`actionType.${undefinedActionType}`),
        path: "color",
      });
      context.result = {
        eventsMap,
        graphAvailability: {
          series: [
            [
              {
                value: roundDecimal({
                  value: getPercentage({ value: eventsMap.graphAvailability }),
                }),
                bgColor: "#DEEEE3",
                className: "chart-availability",
              },
            ],
          ],
        },
        graphQuality: {
          series: [
            [
              {
                value: roundDecimal({
                  value: getPercentage({ value: eventsMap.graphQuality }),
                }),
                bgColor: "#D2E1FA",
                className: "chart-quality",
              },
            ],
          ],
        },
        graphPerformance: {
          series: [
            [
              {
                value: roundDecimal({
                  value: getPercentage({ value: eventsMap.graphPerformance }),
                }),
                bgColor: "#FED0BE",
                className: "chart-performance",
              },
            ],
          ],
        },
        graphOEE: roundDecimal({
          value: getPercentage({ value: eventsMap.graphOEE }),
        }),
        graphActions: {
          labelsNames: hasActionTypes
            ? lodash.map(
                eventsMap.actions,
                (at, key) =>
                  `${
                    lodash.get(app.get(`actionType.${key}`), `name`) ||
                    undefinedActionTypeName
                  } (${roundDecimal({
                    value: getPercentage({
                      value: at / eventsMap.stats.totalSelectedDuration,
                    }),
                  })}%)`
              )
            : [undefinedActionTypeName],
          series: hasActionTypes
            ? lodash.map(eventsMap.actions, (at, key) => ({
                value: roundDecimal({
                  value: getPercentage({
                    value: at / eventsMap.stats.totalSelectedDuration,
                  }),
                }),
                bgColor:
                  getColor({
                    data: app.get(`actionType.${key}`),
                    path: "color",
                  }) || undefinedActionTypeColor,
              }))
            : [
                {
                  value: 100,
                  bgColor: undefinedActionTypeColor,
                },
              ],
        },
        graphStats: eventsMap.stats,
      };
    }
    return context;
  };
};
