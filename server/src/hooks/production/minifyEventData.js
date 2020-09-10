const lodash = require("lodash");
const moment = require("moment");
const { BadRequest } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");
const {
  findProductionOrder,
  getTotalProduction,
  getTurn,
} = require("./minify");

module.exports = function () {
  return async (context) => {
    const { app, data, params } = context;
    // console.log(">>>>> minEV INIT", context.data);
    const eventTypesService = app.service("production_order_event_types");
    let productionOrder,
      machine,
      plant,
      mostRecentEvent,
      mostRecentTurn,
      mostRecentEventType,
      mostRecentActionType,
      machineId;
    try {
      await getConfigs({ app });
      const {
        plant: PL,
        machine: MA,
        productionOrder: PO,
        mostRecentEvent: MRE,
        mostRecentEventType: MRET,
        mostRecentActionType: MRAT,
        mostRecentTurn: MRT,
        machineId: MI,
      } = await findProductionOrder({ app, data });
      plant = PL;
      machine = MA;
      productionOrder = PO;
      mostRecentEvent = MRE;
      mostRecentTurn = MRT;
      mostRecentEventType = MRET;
      mostRecentActionType = MRAT;
      machineId = MI;
    } catch (e) {
      console.log(">>>>> minEV NO PRODUCTION ORDER");
    }
    if (!machineId) {
      console.log("!!!!! minEV ERROR DETACHED SENSOR");
      throw new BadRequest("Detached sensor!!");
    }
    const totalReadings = lodash.reduce(
      data.readings,
      (sum, r) => sum + parseFloat(r.total),
      0
    );
    const averageCycleReading =
      totalReadings / (lodash.get(data, "readings.length") || 1);
    let totalProduction = await getTotalProduction({
      app,
      data,
      productionOrder,
    });
    const { turn, isHoliday } = getTurn({ data, plant });
    const setupActionType = getActionType({ app, type: "setup" });
    const setupAutoActionType = getActionType({ app, type: "setupAuto" });
    const scheduledStopActionType = getActionType({
      app,
      type: "scheduledStop",
    });
    const noScheduledStopActionType = getActionType({
      app,
      type: "noScheduledStop",
    });
    const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
    const noJustifiedActionType = getActionType({ app, type: "noJustified" });
    const closedActionType = getActionType({ app, type: "closed" });
    const maxActionType = getActionType({ app, type: "max" });
    const minActionType = getActionType({ app, type: "min" });
    const activeActionType = getActionType({ app, type: "active" });
    const activeEventType = lodash.get(
      await eventTypesService.find({
        query: {
          companyId: data.ci,
          productionOrderActionTypeId: activeActionType,
          $limit: 1,
        },
      }),
      "data.0.id"
    );
    let originalEventTypeId;
    let eventTypeId = data.productionOrderEventTypeId;
    let currentEvent, originalEvent, userId;
    if (data.sensorId) {
      const lastReading = lodash.last(data.readings);
      // const lastReadingTotal = parseFloat(lodash.get(lastReading, "total"));
      const totalReadingsTime =
        totalReadings > 0 ? lodash.get(data, "readings.length") || 0 : 0;
      const lastReadingTotal = (totalReadingsTime * 60) / (totalReadings || 1);
      if (data.warning || lastReadingTotal === 0) {
        // console.log(">>>>> minEV NO JUSTIFIED");
        if (
          [
            `${setupActionType}`,
            `${setupAutoActionType}`,
            `${scheduledStopActionType}`,
            `${noScheduledStopActionType}`,
          ].indexOf(`${mostRecentActionType}`) !== -1 ||
          (`${noWorkDayActionType}` === `${mostRecentActionType}` &&
            `${mostRecentTurn}` !== `${lodash.get(turn, "id")}`)
        ) {
          eventTypeId = mostRecentEventType || activeEventType;
          userId = lodash.get(mostRecentEvent, "ui");
          // console.log(">>>>> minEV KEEP EVENT");
        } else if (!lodash.get(turn, "id") || isHoliday) {
          // } else if (isHoliday) {
          const noWorkDayEvent = lodash.get(
            await eventTypesService.find({
              query: {
                companyId: data.ci,
                productionOrderActionTypeId: noWorkDayActionType,
                $limit: 1,
              },
            }),
            "data.0"
          );
          eventTypeId = lodash.get(noWorkDayEvent, "id") || activeEventType;
          // console.log(">>>>> minEV NO WORKDAY");
        } else {
          const noJustifiedEvent = lodash.get(
            await eventTypesService.find({
              query: {
                companyId: data.ci,
                productionOrderActionTypeId: noJustifiedActionType,
                $limit: 1,
              },
            }),
            "data.0"
          );
          eventTypeId = lodash.get(noJustifiedEvent, "id") || activeEventType;
        }
      } else if (
        lastReading &&
        productionOrder &&
        lastReadingTotal >
          parseFloat(
            lodash.get(productionOrder, "maxCycle") ||
              lodash.get(productionOrder, "idealCycle")
          )
      ) {
        eventTypeId =
          lodash.get(
            await eventTypesService.find({
              query: {
                companyId: data.ci,
                productionOrderActionTypeId: maxActionType,
                $limit: 1,
              },
            }),
            "data.0.id"
          ) || activeEventType;
        // console.log(">>>>> minEV MAX CYCLE");
      } else if (
        lastReading &&
        productionOrder &&
        lastReadingTotal <
          parseFloat(
            lodash.get(productionOrder, "minCycle") ||
              lodash.get(productionOrder, "idealCycle")
          )
      ) {
        eventTypeId =
          lodash.get(
            await eventTypesService.find({
              query: {
                companyId: data.ci,
                productionOrderActionTypeId: minActionType,
                $limit: 1,
              },
            }),
            "data.0.id"
          ) || activeEventType;
        // console.log(">>>>> minEV MIN CYCLE");
      } else {
        eventTypeId = activeEventType;
        // console.log(">>>>> minEV NORMAL CYCLE");
      }
      originalEventTypeId = eventTypeId;
      if (
        [`${setupActionType}`, `${scheduledStopActionType}`].indexOf(
          `${mostRecentActionType}`
        ) !== -1
      ) {
        eventTypeId = mostRecentEventType || activeEventType;
        userId = lodash.get(mostRecentEvent, "ui");
        // console.log(">>>>> minEV KEEP EVENT");
      }
      currentEvent = await eventTypesService.get(eventTypeId);
      originalEvent = await eventTypesService.get(originalEventTypeId);
      // if (
      //   [`${activeActionType}`, `${maxActionType}`, `${minActionType}`].indexOf(
      //     `${currentEvent.productionOrderActionTypeId}`
      //   ) === -1
      // ) {
      //   totalProduction = 0;
      //   console.log(">>>>> minEV NO PRODUCTION");
      // }
    }
    let endDate = data.endDate === -1 ? -1 : moment(data.endDate).toDate();
    if (
      lodash.get(mostRecentEvent, "oed") === -1 &&
      `${mostRecentEvent.ev}` === `${eventTypeId}`
    ) {
      endDate = -1;
    }
    if (!currentEvent) {
      currentEvent = await eventTypesService.get(eventTypeId);
    }
    if (
      `${currentEvent.productionOrderActionTypeId}` === `${closedActionType}` ||
      (`${currentEvent.productionOrderActionTypeId}` ===
        `${activeActionType}` &&
        data.productionOrderEventTypeId)
    ) {
      endDate = moment(data.startDate).toDate();
    }
    context.$productionOrder = productionOrder;
    context.$machine = machine;
    context.$currentEvent = currentEvent;
    context.$plant = plant;
    const startDateLog = data.startDate;
    // console.log(
    //   `\n>>>>> EVENT ${moment().format(
    //     "YYYY-MM-DD HH:mm:ss"
    //   )} receive event for ${machineId} with sd ${startDateLog}`
    // );
    context.data = {
      // readings
      r: lodash.map(data.readings, (r) => ({
        t: r.total,
        m: r.minute,
      })),
      // open cavities
      cav: lodash.get(productionOrder, "openCavities"),
      // ideal cycle
      icy: lodash.get(productionOrder, "idealCycle"),
      // total production
      t: Math.round(totalProduction),
      // total readings
      tr: Math.round(totalReadings),
      // average cycle reading
      c: Math.round(averageCycleReading * 100) / 100,
      // sensor
      si: data.sensorId || lodash.get(productionOrder, "sensorId"),
      // company
      ci: data.ci,
      // machine // TODO ADD moldId and productId to reduce the populates!!!
      mi: machineId,
      // productionOrder
      poi: lodash.get(productionOrder, "id"),
      // original productionOrderEventType
      oev: originalEventTypeId || eventTypeId,
      // productionOrderEventType => events list "PARADA PROGRAMADA MANUTENÇÂO MECÂNICA"
      ev: eventTypeId,
      // productionOrderActionType => event type "PARADA PROGRAMADA"
      at: lodash.get(currentEvent, "productionOrderActionTypeId"),
      // original productionOrderActionType
      oat:
        lodash.get(originalEvent, "productionOrderActionTypeId") ||
        lodash.get(currentEvent, "productionOrderActionTypeId"),
      // currentDate
      cd: moment().toDate(),
      // startDate
      sd: moment(data.startDate).toDate(),
      // endDate
      ed: endDate,
      // warning flag
      w: data.warning,
      // restored production
      rp: data.restoredProduction,
      // noise warning
      nw: data.noiseWarning,
      // user
      ui: userId || lodash.get(params, "connection.payload.userId"),
      // turn
      tu: lodash.get(turn, "id"),
    };
    // console.log(">>>>> minEV RESULT", context.data);
    // throw new Error("!!!TEST");
    return context;
  };
};
