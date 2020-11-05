const lodash = require("lodash");
const moment = require("moment");

const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

module.exports = ({ data, plant }) => {
  let turn;
  const startD = moment(data.startDate);
  // const firstStartT = moment(
  //   lodash.get(lodash.first(plant.turns), "startTime")
  // ).set({
  //   year: startD.year(),
  //   month: startD.month(),
  //   date: startD.date(),
  // });
  // const firstEndT = moment(
  //   lodash.get(lodash.first(plant.turns), "endTime")
  // ).set({
  //   year: startD.year(),
  //   month: startD.month(),
  //   date: startD.date(),
  // });
  const lastStartT = moment(
    lodash.get(lodash.last(plant.turns), "startTime")
  ).set({
    year: startD.year(),
    month: startD.month(),
    date: startD.date(),
  });
  const lastEndT = moment(lodash.get(lodash.last(plant.turns), "endTime")).set({
    year: startD.year(),
    month: startD.month(),
    date: startD.date(),
  });
  if (lastStartT.isSameOrAfter(lastEndT, "minute")) {
    lastStartT.subtract(1, "days");
  }
  lodash.forEach(plant.turns, (iTurn) => {
    let startT = moment(iTurn.startTime).set({
      year: startD.year(),
      month: startD.month(),
      date: startD.date(),
    }).subtract(2, "hours");
    const endT = moment(iTurn.endTime).set({
      year: startD.year(),
      month: startD.month(),
      date: startD.date(),
    }).subtract(2, "hours");
    if (startT.isSameOrAfter(endT, "minute")) {
      startT = moment(startT).subtract(1, "days");
    }
    const weekdayValue = startD.day();
    const weekday = weekdays[weekdayValue];
    const prevWeekdayValue = weekdayValue - 1 >= 0 ? weekdayValue - 1 : 6;
    const prevWeekday = weekdays[prevWeekdayValue];
    if (data.sensorId === 561) {
      console.log(plant.turns.length, moment(startT).toISOString(), moment(startD).toISOString(), iTurn)
    }
    if (
      !turn &&
      startD.isSameOrAfter(startT, "minute") &&
      startD.isBefore(endT, "minute") &&
      iTurn[weekday]
      // iTurn[weekday] &&
      // (!iTurn[prevWeekday] && startD.isSameOrAfter(lastEndT, "minute"))
      // TODO what happens Friday last turn
    ) {
      console.log("turn", iTurn)
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
      console.log("turn", iTurn)
      turn = iTurn;
    }
  });
  let isHoliday = false;
  lodash.forEach(plant.holidays, (iHoliday) => {
    const startT = moment(iHoliday.startDate);
    const endT = moment(iHoliday.endDate);
    if (!startT.isSame(startD, "year") || startT.isBefore(startD, "day")) {
      return;
    }
    if (
      !isHoliday &&
      startD.isSameOrAfter(startT, "minute") &&
      startD.isBefore(endT, "minute")
    ) {
      isHoliday = true;
    }
  });
  return { turn, isHoliday };
};
