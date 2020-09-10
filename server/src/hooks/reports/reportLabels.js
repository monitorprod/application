const lodash = require("lodash");
const get = lodash.get;
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");

const getDateJSON = ({ date }) => {
  const dateD = moment(date);
  return {
    year: dateD.year(),
    month: dateD.month(),
    date: dateD.date(),
    hour: dateD.hour(),
    minute: dateD.minute(),
    second: dateD.second()
  };
};

const addToWasteList = ({ wasteList, productionOrder, turn, date }) => {
  const sd = {
    ...getDateJSON({
      date
    }),
    hour: get(turn, "startTimeHours"),
    minute: get(turn, "startTimeMinutes"),
    second: get(turn, "startTimeSeconds")
  };
  const ed = {
    ...getDateJSON({
      date
    }),
    hour: get(turn, "endTimeHours"),
    minute: get(turn, "endTimeMinutes"),
    second: get(turn, "endTimeSeconds")
  };
  if (moment(ed).isBefore(moment(sd), "minute")) {
    ed.date++;
  }
  wasteList.push({
    id: `${get(productionOrder, "id")}${moment(sd).toISOString()}`,
    poi: productionOrder,
    sd,
    ed
  });
};

module.exports = function() {
  return async context => {
    const { app, method, type, params, data, result } = context;
    const plantsService = app.service("plants");
    const turnsService = app.service("turns");
    const productionOrdersService = app.service("production_orders");
    const productionOrderWasteService = app.service("production_order_waste");
    if (
      (lodash.get(params, "$reportLabels") || lodash.get(params, "query.$reportLabels")) &&
      method === "find"
    ) {
      params.$reportLabels =
        lodash.get(params, "$reportLabels") || lodash.get(params, "query.$reportLabels");
      lodash.unset(params, "query.$reportLabels");
    }
    if (params.$reportLabels && type === "after") {
      await getConfigs({ app });
      const undefinedActionType = getActionType({ app, type: "undefined" });
      const noJustifiedActionType = getActionType({ app, type: "noJustified" });
      const scheduledStopActionType = getActionType({ app, type: "scheduledStop" });
      const noScheduledStopActionType = getActionType({ app, type: "noScheduledStop" });
      const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
      const machines = result.data || result;
      const sd = get(params, "$reportLabels.sd") || {};
      const startD = moment(params.$reportLabels.sd);
      const endD = moment(params.$reportLabels.ed);
      let inactiveMachinesCounter = 0;
      if (params.$reportLabels.type === "inactiveMachines") {
        await Promise.all(
          lodash.map(machines, async ({ id }) => {
            const { data: productionOrders } = await productionOrdersService.find({
              query: {
                machineId: id,
                $populateSelect: ["mostRecentEvent"],
                isActive: true,
                $sort: {
                  actualStartDate: 1
                },
                $limit: 1
              }
            });
            // TODO optimize productionOrder populates
            const mostRecentActionTypeId = lodash.get(
              productionOrders,
              "0.mostRecentEvent.0.productionOrderEventType.productionOrderActionTypeId"
            );
            if (
              !productionOrders.length ||
              [
                `${undefinedActionType}`,
                `${noJustifiedActionType}`,
                `${scheduledStopActionType}`,
                `${noScheduledStopActionType}`,
                `${noWorkDayActionType}`
              ].indexOf(`${mostRecentActionTypeId}`) !== -1
            ) {
              inactiveMachinesCounter++;
            }
          })
        );
      }
      let pendingWasteCounter = 0;
      if (params.$reportLabels.type === "pendingWaste") {
        const { data: plants } = await plantsService.find({
          query: {
            id: { $in: Object.keys(lodash.keyBy(machines, "plantId")) },
            companyId: data.companyId
          }
        });
        const plantsMap = lodash.keyBy(plants, "id");
        const { data: turns } = await turnsService.find({
          query: {
            plantId: { $in: Object.keys(plantsMap) },
            companyId: data.companyId
          }
        });
        const plantTurnsMap = lodash.groupBy(turns, "plantId");
        const { data: productionOrders } = await productionOrdersService.find({
          query: {
            isActive: true,
            machineId: { $in: lodash.map(machines, ({ id }) => id) },
            actualStartDate: { $lte: endD.toDate() },
            $or: [{ actualEndDate: { $gte: startD.toDate() } }, { actualEndDate: null }]
          }
        });
        // const productionOrdersMap = lodash.keyBy(productionOrders, "id") ;
        const machineProductionOrdersMap = lodash.groupBy(productionOrders, "machineId");
        const { data: historyList } = await productionOrderWasteService.find({
          query: {
            poi: { $in: lodash.map(productionOrders, ({ id }) => id) },
            sdY: { $gte: sd.year },
            sdM: { $gte: sd.month },
            sdD: { $gte: sd.date },
            sdh: { $gte: sd.hour },
            sdm: { $gte: sd.minute },
            sds: { $gte: sd.second }
          }
        });
        await Promise.all(
          lodash.map(machines, async machine => {
            let wasteList = [];
            await Promise.all(
              lodash.map(get(machineProductionOrdersMap, get(machine, "id")), async itemOP => {
                const productionOrder = get(itemOP, "dataValues") || itemOP;
                const actualStartOPD = moment(get(productionOrder, "actualStartDate")).startOf(
                  "day"
                );
                const startOPD = actualStartOPD.isAfter(startD) ? actualStartOPD : startD;
                const plant =
                  get(plantsMap, get(machine, "plantId")) ||
                  get(plantsMap, get(productionOrder, "plantId"));
                if (get(plant, "qualityTrackFrequency") === "Diario") {
                  const daysDiff = moment().diff(startOPD, "days") - 1;
                  for (let i = 0; i <= daysDiff; i++) {
                    const turn = get(plantTurnsMap, `${get(plant, "id")}.0`);
                    addToWasteList({
                      wasteList,
                      productionOrder,
                      turn,
                      date: moment(startOPD)
                        .add(i, "days")
                        .startOf("day")
                    });
                  }
                } else if (get(plant, "qualityTrackFrequency") === "Turno") {
                  const daysDiff = moment().diff(startOPD, "days") - 1;
                  for (let i = 0; i <= daysDiff; i++) {
                    lodash.forEach(get(plantTurnsMap, get(plant, "id")), turn => {
                      addToWasteList({
                        wasteList,
                        productionOrder,
                        turn,
                        date: moment(startOPD)
                          .add(i, "days")
                          .startOf("day")
                      });
                    });
                  }
                }
                wasteList = lodash.filter(wasteList, item => {
                  const wItem = lodash.find(
                    historyList,
                    hItem =>
                      hItem.poi === lodash.get(item, "poi.id") &&
                      hItem.sdY === item.sd.year &&
                      hItem.sdM === item.sd.month &&
                      hItem.sdD === item.sd.date &&
                      hItem.sdh === item.sd.hour &&
                      hItem.sdm === item.sd.minute
                  );
                  return (
                    moment().isAfter(moment(item.sd), "minute") &&
                    moment(productionOrder.actualStartDate).isBefore(moment(item.ed), "minute") &&
                    moment(productionOrder.actualEndDate || moment()).isAfter(
                      moment(item.sd),
                      "minute"
                    ) &&
                    !wItem
                  );
                });
              })
            );
            pendingWasteCounter += Object.keys(lodash.keyBy(wasteList, "id")).length;
          })
        );
      }
      context.result = {
        inactiveMachines: inactiveMachinesCounter,
        pendingWaste: pendingWasteCounter
      };
    }
    return context;
  };
};
