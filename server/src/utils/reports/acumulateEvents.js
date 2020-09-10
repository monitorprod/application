const moment = require("moment");

const addDifference = ({ eventsMap = {}, event = {}, diff }) => {
  if (!eventsMap.actions) {
    eventsMap.actions = {};
  }
  if (!eventsMap.actions[event.at]) {
    eventsMap.actions[event.at] = 0;
  }
  eventsMap.actions[event.at] += diff;
  if (!eventsMap.events) {
    eventsMap.events = {};
  }
  if (!eventsMap.events[event.ev]) {
    eventsMap.events[event.ev] = 0;
  }
  eventsMap.events[event.ev] += diff;
};

const acumulateEvents = ({ startD, endD, eventsMap = {}, event = {} }) => {
  const startEVD = moment(event.sd);
  const endEVD = moment(event.ed);
  if (
    endEVD.isSameOrBefore(startD, "minute") ||
    startEVD.isSameOrAfter(endD, "minute")
  ) {
    return false;
  }
  const durationEVD = endEVD.diff(startEVD, "minutes");
  const startOverlap = startD.diff(startEVD, "minutes");
  const endOverlap = endEVD.diff(endD, "minutes");
  let diff =
    durationEVD -
    (startOverlap > 0 ? startOverlap : 0) -
    (endOverlap > 0 ? endOverlap : 0);
  diff = diff > 0 ? diff : 0;
  addDifference({ eventsMap, event, diff });
  if (!eventsMap.readings) {
    eventsMap.readings = 0;
  }
  const reading = (parseFloat(event.tr || 0) * diff) / durationEVD || 0;
  eventsMap.readings += Math.round(reading);
  if (!eventsMap.readingsMap) {
    eventsMap.readingsMap = [];
  }
  eventsMap.readingsMap.push({
    event,
    reading,
    eventDiff: diff,
    sd: event.sd,
    ed: event.ed
  });
  return event;
};

module.exports = acumulateEvents;
