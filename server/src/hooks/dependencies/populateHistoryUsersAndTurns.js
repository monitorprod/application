const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, type, params, method, result } = context;
    const usersService = app.service("users");
    const turnsService = app.service("turns");
    if (
      (lodash.get(params, "$populateUsers") || lodash.get(params, "query.$populateUsers")) &&
      method === "find"
    ) {
      params.$populateUsers = true;
      lodash.unset(params, "query.$populateUsers");
    }
    if (params.$populateUsers && type === "after") {
      let resultArray = result.data || result;
      if (!Array.isArray(resultArray)) {
        resultArray = [resultArray];
      }
      const { data: users } = await usersService.find();
      const usersMap = lodash.keyBy(users, "id") || {};
      const { data: turns } = await turnsService.find();
      const turnsMap = lodash.keyBy(turns, "id") || {};
      await Promise.all(
        lodash.map(resultArray, async item => {
          await Promise.all(
            lodash.map(lodash.get(item, "ev"), async ev => {
              ev.userName = lodash.get(usersMap[ev.ui], "name");
              ev.turnName = lodash.get(turnsMap[ev.tu], "name");
            })
          );
        })
      );
    }
    return context;
  };
};
