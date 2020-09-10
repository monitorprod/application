const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const holidaysService = app.service("holidays");
    if (lodash.isNil(data.holidays)) {
      return context;
    }
    if (!lodash.isArray(data.holidays)) {
      data.holidays = [data.holidays];
    }
    let resultArray = result;
    if (!lodash.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async plant => {
        return await Promise.all(
          lodash.map(data.holidays, async turn => {
            turn.plantId = plant.id;
            turn.companyId = data.companyId;
            if (turn.id) {
              await holidaysService.patch(turn.id, turn);
            } else {
              await holidaysService.create(turn);
            }
            return context;
          })
        );
      })
    );
  };
};
