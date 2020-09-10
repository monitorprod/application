const lodash = require("lodash");
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

module.exports = function() {
  return async context => {
    const { app, data } = context;
    const productionOrdersService = app.service("production_orders");
    const eventTypesService = app.service("production_order_event_types");
    const machinesService = app.service("machines");
    const plantsService = app.service("plants");
    let totalReadings, turn, currentEvent, originalEvent;
    try {
      const productionOrder = await productionOrdersService.get(data.poi);
      const machine = await machinesService.get(data.mi);
      const plant = await plantsService.get(
        lodash.get(productionOrder, "plantId") || machine.plantId
      );
      if (!data.tr) {
        totalReadings = lodash.reduce(
          data.r,
          (sum, r) => sum + parseFloat(r.t),
          0
        );
      }
      if (!data.tu) {
        lodash.forEach(plant.turns, t => {
          const startD = moment(data.sd);
          const startT = moment(t.startTime).set({
            year: startD.year(),
            month: startD.month(),
            date: startD.date()
          });
          const endT = moment(t.endTime).set({
            year: startD.year(),
            month: startD.month(),
            date: startD.date()
          });
          if (startT.isSameOrAfter(endT, "minute")) {
            startT.subtract(1, "days");
          }
          if (
            !turn &&
            startD.isSameOrAfter(startT, "minute") &&
            startD.isSameOrBefore(endT, "minute") &&
            t[weekdays[startD.day()]]
          ) {
            turn = t;
          }
          if (!turn) {
            startT.add(1, "days");
            endT.add(1, "days");
          }
          if (
            !turn &&
            startD.isSameOrAfter(startT, "minute") &&
            startD.isSameOrBefore(endT, "minute") &&
            t[weekdays[startD.day()]]
          ) {
            turn = t;
          }
        });
      }
      if (!data.at || !data.oat) {
        currentEvent = await eventTypesService.get(data.ev);
      }
      if (!data.oat) {
        originalEvent = await eventTypesService.get(data.oev);
      }
      let userId = data.ui;
      await getConfigs({ app });
      const closedActionType = getActionType({ app, type: "closed" });
      const setupActionType = getActionType({ app, type: "setup" });
      const setupAutoActionType = getActionType({ app, type: "setupAuto" });
      const scheduledStopActionType = getActionType({
        app,
        type: "scheduledStop"
      });
      const noScheduledStopActionType = getActionType({
        app,
        type: "noScheduledStop"
      });
      if (
        !userId &&
        [
          `${setupActionType}`,
          `${setupAutoActionType}`,
          `${scheduledStopActionType}`,
          `${noScheduledStopActionType}`,
          `${closedActionType}`
        ].indexOf(
          `${lodash.get(currentEvent, "productionOrderActionTypeId")}`
        ) !== -1
      ) {
        userId = 21;
      }
      context.data = {
        ...data,
        // total readings
        tr: data.tr || Math.round(totalReadings),
        // productionOrderActionType
        at: data.at || lodash.get(currentEvent, "productionOrderActionTypeId"),
        // original productionOrderActionType
        oat:
          data.oat ||
          lodash.get(originalEvent, "productionOrderActionTypeId") ||
          lodash.get(currentEvent, "productionOrderActionTypeId"),
        // turnId
        tu: data.tu || lodash.get(turn, "id"),
        // userId
        ui: userId
      };
      // console.log(">>>>> COPY AND minEV RESULT", context.data);
    } catch (error) {}
    return context;
  };
};
