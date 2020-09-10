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
  setHistoryDataValues
} = require("../../utils/reports");

module.exports = function() {
  return async context => {
    const { app, method, type, params, result } = context;
    const level = lodash.get(params, "payload.company.level");
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    if (
      (lodash.get(params, "$reportIndicators") ||
        lodash.get(params, "query.$reportIndicators")) &&
      method === "find"
    ) {
      params.$reportIndicators =
        lodash.get(params, "$reportIndicators") ||
        lodash.get(params, "query.$reportIndicators");
      lodash.unset(params, "query.$reportIndicators");
    }
    if (params.$reportIndicators && type === "after") {
      await getConfigs({ app });
      const machines = result.data || result;
      const machineIds = [
        ...lodash.map(machines, m => m.id),
        ...lodash.map(machines, m => `${m.id}`)
      ];
      const pStartD = moment(params.$reportIndicators.sd);
      const pEndD = moment(params.$reportIndicators.ed);
      const { data: summaries } = await productionOrderHistoryService.find({
        query: {
          mi: { $in: machineIds },
          $or: [{ ed: { $gte: pStartD.toDate() } }, { ed: -1 }],
          sd: { $lte: pEndD.toDate() }
          // $populateAll: true
        }
      });
      const daysMap = {};
      const dates = params.$reportIndicators.dates;
      await Promise.all(
        lodash.map(dates, async (date, index) => {
          daysMap[index] = {
            productionOrders: {}
          };
          const startD = moment(date.sd);
          const endD = moment(date.ed);
          const {
            productionOrdersMap,
            productsMap,
            eventsReadingsMap,
            productionWasteMap
          } = await populateHistory({
            app,
            summaries,
            startD,
            endD
          });
          lodash.forEach(summaries, history => {
            setHistoryDataValues({ history, productionOrdersMap, productsMap });
            daysMap[index].productionOrders[history.poi] = {
              poi: history.productionOrder
            };
            lodash.map(history.ev, event =>
              acumulateEvents({
                startD,
                endD,
                eventsMap: daysMap[index].productionOrders[history.poi],
                event
              })
            );
            const historyStats = getHistoryStats({
              app,
              startD,
              endD,
              history,
              eventsMap: daysMap[index].productionOrders[history.poi],
              eventsReadings: eventsReadingsMap[history.poi],
              productionWaste: productionWasteMap[history.poi],
              level
            });
            daysMap[index].productionOrders[history.poi] = {
              ...daysMap[index].productionOrders[history.poi],
              ...historyStats
            };
          });
          const totalSelectedDuration =
            (endD.diff(startD, "minutes") + 1) * machines.length;
          getOEEStats({ totalSelectedDuration, eventsMap: daysMap[index] });
          // console.log("reportIndicators", index, daysMap[index]);
        })
      );
      context.result = {
        graphIndicators: {
          labels: lodash.map(dates, date => moment(date.sd).format("DD/MMM")),
          series: [
            {
              value: lodash.map(daysMap, data =>
                roundDecimal({
                  value: getPercentage({ value: data.graphAvailability })
                })
              ),
              bgColor: "#DEEEE3",
              className: "chart-availability"
            },
            {
              value: lodash.map(daysMap, data =>
                roundDecimal({
                  value: getPercentage({ value: data.graphQuality })
                })
              ),
              bgColor: "#D2E1FA",
              className: "chart-quality"
            },
            {
              value: lodash.map(daysMap, data =>
                roundDecimal({
                  value: getPercentage({ value: data.graphPerformance })
                })
              ),
              bgColor: "#FED0BE",
              className: "chart-performance"
            },
            {
              value: lodash.map(daysMap, data =>
                roundDecimal({ value: getPercentage({ value: data.graphOEE }) })
              ),
              bgColor: "rgba(0, 0, 0, .14)",
              className: "chart-oee",
              name: "OEE"
            }
          ]
        }
      };
    }
    return context;
  };
};
