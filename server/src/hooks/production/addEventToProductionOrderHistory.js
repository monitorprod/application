const lodash = require("lodash");
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");
const ReadingHandler = require("../../../src/utils/events/readingHandler");

const addTotalReadings = ({ ev, src }) =>
  (ev.tr = (parseInt(ev.tr) || 0) + (parseInt(src.tr) || 0));

module.exports = function () {
  return async context => {
    const { app, data } = context;
    const ID = context.result._id.toString();
    if (data.nw) {
      return context;
    }
    const eventTypesService = app.service("production_order_event_types");
    const productionOrderHistoryService = app.service("production_order_history");
    const productionOrderEvents = app.service("production_order_events");
    const notificationTimeMIN = lodash.get(context, "$plant.notificationTimeMIN") || 1;
    let history, summary;
    try {
      history = lodash.get(
        await productionOrderHistoryService.find({
          query: {
            poi: data.poi,
            $limit: 1
          }
        }),
        "data.0"
      );
      if (!history) {
        return context;
      }
      summary = history.ev;
      await getConfigs({ app });
      const maxActionType = getActionType({ app, type: "max" });
      const minActionType = getActionType({ app, type: "min" });
      const activeActionType = getActionType({ app, type: "active" });
      // const closedActionType = getActionType({ app, type: "closed" });
      const noJustifiedActionType = getActionType({ app, type: "noJustified" });
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
      const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
      const completeLastNoJustified = ({ lastEvent, actionTypeId }) =>
        `${lastEvent.at}` === `${noJustifiedActionType}` &&
        [
          `${setupActionType}`,
          `${setupAutoActionType}`,
          `${scheduledStopActionType}`,
          `${noScheduledStopActionType}`,
          `${noWorkDayActionType}`
        ].indexOf(`${actionTypeId}`) !== -1;
      const isSameEvent = ({ lastEvent, currentEvent }) =>
        `${lastEvent.ev || -1}` === `${currentEvent.ev || -1}` &&
        `${lastEvent.tu || ""}` === `${currentEvent.tu || ""}` &&
        `${lastEvent.ui || ""}` === `${currentEvent.ui || ""}`;
      let startD = moment(data.sd);
      const endD = data.ed === -1 ? moment() : moment(data.ed);
      const nextIndex = lodash.findIndex(summary, ev =>
        moment(ev.sd).isAfter(startD, "second")
      );
      const previousIndex = lodash.findLastIndex(summary, ev =>
        moment(ev.sd).add(1, "minute").isBefore(startD, "second")
      );
      if (startD.isAfter(endD)) { //TODO: shouldn't fix it before setting previousIndex and nextIndex
        data.sd = data.ed;
        startD = moment(endD);
      }
      /* #region  Divison of Readings */

      const ProductionContainingZerosinReadings =
        data.r &&
        [`${activeActionType}`, `${maxActionType}`, `${minActionType}`].some(item => item == `${data.at}`) &&
        lodash.find(data.r, r => `${r.t}` === `${0}`);

      // if (false) { //new mpx device send intervals with allZeros
      //   // console.log('previus', summary[previousIndex])
      //   // console.log('next', summary[nextIndex])

      //   const noJustifiedEvent = lodash.get(
      //     await eventTypesService.find({
      //       query: {
      //         companyId: data.ci,
      //         productionOrderActionTypeId: noJustifiedActionType,
      //         $limit: 1
      //       }
      //     }),
      //     "data.0"
      //   );
      //   // console.log('splitting by zero')
      //   let rh = new ReadingHandler(data);
      //   let splitByZeros = rh.splitByZeros().groupedByZeros;

      //   let eventsToAdd = rh. //already been splitedByzeros
      //     joinGroupedBasedOnInterval(notificationTimeMIN).
      //     formatIntervals(noJustifiedEvent.id, noJustifiedActionType, summary[nextIndex] && summary[nextIndex].iz, summary[previousIndex] && summary[previousIndex].fz).
      //     groupedIntervals;
      //     // console.log(eventsToAdd)
      //     // console.log('antes de processar')
      //     // console.log(summary[previousIndex], summary[nextIndex])

      //   /* #region handle previous event */
      //   if (summary[previousIndex] && summary[previousIndex].fz) {
      //     const shouldChangePreviousEvent = summary[previousIndex].fz + splitByZeros[0].length >= notificationTimeMIN;
      //     if (shouldChangePreviousEvent) {
      //       summary[previousIndex].ed = moment(summary[previousIndex].ed).subtract(summary[previousIndex].fz, 'minutes').toDate();
      //       delete summary[previousIndex].fz
      //     }
      //   }
      //   /* #endregion */

      //   /* #region handle next event */
      //   if (summary[nextIndex] && summary[nextIndex].iz) {
      //     const shouldChangeNextEvent = summary[nextIndex].iz + splitByZeros[splitByZeros - 1].length >= notificationTimeMIN;
      //     if (shouldChangeNextEvent) {
      //       summary[nextIndex].sd = moment(summary[nextIndex].sd).add(summary[nextIndex].iz, 'minutes').toDate();
      //       delete summary[nextIndex].iz
      //     }
      //   }
      //   /* #endregion */

      //   lodash.forEach(eventsToAdd, (ev, index) => //insere adiciona na posição correta.
      //     summary.splice(
      //       (nextIndex === -1 ? summary.length : nextIndex) + index,
      //       0,
      //       ev
      //     )
      //   );
      // } else {
        summary.splice(nextIndex === -1 ? summary.length : nextIndex, 0, {
          tr: data.tr || 0,
          tu: data.tu,
          ui: data.ui,
          ev: data.ev,
          at: data.at,
          oev: data.oev,
          oat: data.oat,
          sd: startD.toDate(),
          ed: data.ed === -1 ? -1 : endD.toDate()
        });
      // }
      /* #endregion */
      // console.log("!!!!!! REDUCE HISTORY", summary);
      const shouldLog = event => false;// event.tr = 86;
      let startReduce = true;
      while (startReduce) { //tratamento de exceções
        startReduce = false;
        summary = lodash.reduce(
          summary,
          (sum, ev, index) => {
            if (shouldLog(ev)) console.log("!!!ev", shouldLog(ev), ev);
            if (startReduce) {
              sum.push(ev);
              return sum;
            }
            const EVStartD = moment(ev.sd);
            const EVEndD = ev.ed === -1 ? moment() : moment(ev.ed);
            if (ev.ed === -1) {
              ev.oed = -1;
            }
            const lastEV = lodash.last(sum);
            // const nextEV = summary[index + 1];
            // const nextEVStartD = moment(nextEV.sd);
            // const nextEVEndD = moment(nextEV.ed);
            // skip short event
            if (
              ev.ed !== -1 &&
              ev.oed !== -1 &&
              EVEndD.diff(EVStartD, "minutes") < 5 &&
              [
                `${setupActionType}`,
                `${setupAutoActionType}`,
                `${scheduledStopActionType}`,
                `${noScheduledStopActionType}`,
                `${noWorkDayActionType}`
              ].indexOf(`${ev.at}`) !== -1
            ) {
              if (shouldLog(ev)) console.log("> skip short event");
              return sum;
            }
            // skip short no justified
            if (EVEndD.diff(EVStartD, "minutes") < notificationTimeMIN && `${ev.at}` === `${noJustifiedActionType}`) {
              if (shouldLog(ev)) console.log("> skip short no justified");
              return sum;
            }
            // skip short undefined
            if (EVEndD.diff(EVStartD, "minutes") < 15 && ev.at === -1) {
              if (shouldLog(ev)) console.log("> skip short undefined");
              return sum;
            }
            if (lastEV) {
              const lastEVStartD = moment(lastEV.sd);
              const lastEVEndD =
                lastEV.ed === -1 ? moment() : moment(lastEV.ed);
              const diff1 = EVStartD.diff(lastEVEndD, "minutes");
              const diff2 = EVEndD.diff(lastEVEndD, "minutes");
              // undefined between last and current
              if (lastEV.oed !== -1 && diff1 >= 15) {
                if (shouldLog(ev)) console.log("> undefined between last and current");
                sum.push({
                  ev: -1, // THIS MEANS UNDEFINED
                  at: -1,
                  tu: ev.tu,
                  sd: lastEVEndD.toDate(),
                  ed: EVStartD.toDate()
                });
              }
              // complete minutes in last event with current
              else if (lastEV.oed !== -1 && diff1 >= 0) {
                if (shouldLog(ev)) console.log("> complete minutes in last event with current");
                ev.sd = lastEV.ed;
                if (
                  completeLastNoJustified({
                    lastEvent: lastEV,
                    actionTypeId: ev.at
                  })
                ) {
                  if (shouldLog(ev)) console.log(">> last is no justified to be completed");
                  lastEV.ev = ev.ev;
                  lastEV.at = ev.at;
                }
                if (isSameEvent({ lastEvent: lastEV, currentEvent: ev })) {
                  if (shouldLog(ev)) console.log(">> merge to last because is same event");
                  lastEV.ed = ev.ed;
                  lastEV.fz = ev.fz;
                  addTotalReadings({
                    ev: lastEV,
                    src: ev
                  });
                  return sum;
                }
                // same turn for last undefined
                if (lastEV.ev === -1) {
                  lastEV.tu = ev.tu;
                  if (shouldLog(ev)) console.log(">> same turn for last undefined");
                }
              }
              // current starts before last ends
              else if (diff1 < 0) {
                // complete undefined event
                if (ev.ev !== -1 && lastEV.ev === -1) {
                  // current ends before last ends
                  if (diff2 < 0) {
                    if (shouldLog(ev)) console.log(">> current ends before last ends");
                    const temp = { ...lastEV, sd: ev.ed };
                    lastEV.ed = ev.sd;
                    sum.push({ ...ev });
                    sum.push({ ...temp });
                    startReduce = true;
                    return sum;
                  }
                  // current ends after last ends
                  else {
                    if (shouldLog(ev)) console.log(">> current ends after last ends");
                    lastEV.ed = ev.sd;
                    sum.push({ ...ev });
                    startReduce = true;
                    return sum;
                  }
                }
                // complete stopped events
                else if (
                  [
                    `${activeActionType}`,
                    `${maxActionType}`,
                    `${minActionType}`,
                    `${setupActionType}`,
                    `${scheduledStopActionType}`
                  ].indexOf(`${ev.at}`) !== -1 &&
                  (lastEV.ev === -1 ||
                    [
                      `${noJustifiedActionType}`,
                      `${setupAutoActionType}`,
                      `${noScheduledStopActionType}`
                    ].indexOf(`${lastEV.at}`) !== -1)
                ) {
                  // current ends before last ends
                  if (diff2 < 0) {
                    if (shouldLog(ev)) console.log(">> current ends before last ends");
                    const temp = { ...lastEV, sd: ev.ed };
                    lastEV.ed = ev.sd;
                    sum.push({ ...ev });
                    sum.push({ ...temp });
                    startReduce = true;
                    return sum;
                  }
                  // current ends after last ends
                  else {
                    if (shouldLog(ev)) console.log(">> current ends after last ends");
                    lastEV.ed = ev.sd;
                    sum.push({ ...ev });
                    startReduce = true;
                    return sum;
                  }
                }
                // lastEv is open
                else if (lastEV.oed === -1) {
                  if (!isSameEvent({ lastEvent: lastEV, currentEvent: ev })) {
                    lastEV.ed = ev.sd;
                    delete lastEV.oed;
                    if (shouldLog(ev)) console.log(">> lastEv is open, this is different");
                  } else {
                    if (shouldLog(ev)) console.log(">> lastEv is open, skip this");
                    return sum;
                  }
                }
                // skip non active or stopped event
                else {
                  if (shouldLog(ev)) console.log(">> skip non active or stopped event");
                  return sum;
                }
              } else if (
                lastEV.oed === -1 &&
                !isSameEvent({ lastEvent: lastEV, currentEvent: ev })
              ) {
                lastEV.ed = ev.sd;
                delete lastEV.oed;
                if (shouldLog(ev)) console.log(">> lastEv is open outer, this is different");
              } else {
                if (shouldLog(ev)) console.log(">> lastEv is open outer, skip this");
                return sum;
              }
            }
            if (shouldLog(ev)) console.log(">> push current");
            sum.push(ev);
            return sum;
          },
          []
        );
        lodash.sortBy(summary, "sd");
      }
      const firstEvent = lodash.first(summary);
      const lastEvent = lodash.last(summary);
      if (lastEvent.oed === -1) {
        lastEvent.ed = -1;
      }
      // console.log("!!!!summary", summary);
      // console.log('depois de processar')
      // console.log(summary[previousIndex], summary[nextIndex])
      await productionOrderHistoryService.patch(history._id, {
        sd: moment(firstEvent.sd).toDate(),
        ed: lastEvent.ed === -1 ? -1 : moment(lastEvent.ed).toDate(),
        ev: summary
      });
    } catch (error) {
      console.log(">>>>>> ERROR ADD EV TO HISTORY", error);
    }
    // throw new Error("!!!Test");
    return context;
  };
};