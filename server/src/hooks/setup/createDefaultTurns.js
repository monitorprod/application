const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { data } = context;
    if (lodash.isNil(data.turns) && !data.hoursPerWeek) {
      data.hoursPerWeek = 90;
      const days = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: null
      };
      data.turns = [
        {
          name: "T-1",
          description: "Primeiro Turno",
          startTime: moment("2019-01-01T08:00:00"),
          endTime: moment("2019-01-01T16:00:00"),
          ...days
        },
        {
          name: "T-2",
          description: "Segundo Turno",
          startTime: moment("2019-01-01T16:00:00"),
          endTime: moment("2019-01-01T23:00:00"),
          ...days
        },
        {
          name: "T-3",
          description: "Segundo Turno",
          startTime: moment("2019-01-01T24:00:00"),
          endTime: moment("2019-01-01T08:00:00"),
          ...days
        }
      ];
    }
    return context;
  };
};
