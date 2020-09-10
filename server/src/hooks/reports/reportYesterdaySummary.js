const lodash = require("lodash");
const moment = require("moment");
const formatNumber = require("format-number");
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

const NUMBER_FORMAT = formatNumber({
  integerSeparator: ".",
  decimal: ",",
});

module.exports = function () {
  return async (context) => {
    const { app, method, type, params, result } = context;
    const level = lodash.get(params, "payload.company.level");
    const productionOrdersService = app.service("production_orders");
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    if (
      (lodash.get(params, "$reportYesterdaySummary") ||
        lodash.get(params, "query.$reportYesterdaySummary")) &&
      method === "find"
    ) {
      params.$reportYesterdaySummary =
        lodash.get(params, "$reportYesterdaySummary") ||
        lodash.get(params, "query.$reportYesterdaySummary");
      lodash.unset(params, "query.$reportYesterdaySummary");
    }
    if (params.$reportYesterdaySummary && type === "after") {
      await getConfigs({ app });
      const undefinedActionType = getActionType({ app, type: "undefined" });
      const machines = result.data || result;
      const machineIds = [
        ...lodash.map(machines, (m) => m.id),
        ...lodash.map(machines, (m) => `${m.id}`),
      ];
      const startD = moment(params.$reportYesterdaySummary.sd);
      const endD = moment(params.$reportYesterdaySummary.ed);
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
      getOEEStats({ totalSelectedDuration, eventsMap: eventsMap });
      // console.log("reportYesterdaySummary", eventsMap);
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
        graphOEE: roundDecimal({
          value: getPercentage({ value: eventsMap.graphOEE }),
        }),
        graphInactivity: {
          labelsNames: hasActionTypes
            ? lodash.map(
                eventsMap.actions,
                (at, key) =>
                  `${
                    lodash.get(app.get(`actionType.${key}`), `name`) ||
                    undefinedActionTypeName
                  } (${NUMBER_FORMAT(
                    roundDecimal({
                      value: getPercentage({
                        value: at / eventsMap.stats.totalSelectedDuration,
                      }),
                    }).toFixed(2)
                  )}%)`
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
        graphStats: {
          ...eventsMap.stats,
          graphTotalNonPlannedStoppedTime: roundDecimal({
            value: eventsMap.stats.totalNonPlannedStoppedTime / 60,
          }),
        },
      };
    }
    return context;
  };
};
