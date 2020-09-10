const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const turnsService = app.service("turns");
    if (lodash.isNil(data.turns)) {
      return context;
    }
    if (!lodash.isArray(data.turns)) {
      data.turns = [data.turns];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async plant => {
        return await Promise.all(
          lodash.map(data.turns, async turn => {
            turn.plantId = plant.id;
            turn.companyId = data.companyId;
            turn.startTime = moment(turn.startTime).set({
              year: 2019,
              month: 0,
              date: 1
            });
            turn.endTime = moment(turn.endTime).set({
              year: 2019,
              month: 0,
              date: 1
            });
            if (turn.id) {
              await turnsService.patch(turn.id, turn);
            } else {
              await turnsService.create(turn);
            }
            return context;
          })
        );
      })
    );
  };
};
