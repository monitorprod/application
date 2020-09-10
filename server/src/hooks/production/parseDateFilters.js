const lodash = require("lodash");
const moment = require("moment");

module.exports = function() {
  return async context => {
    const { params } = context;
    lodash.forEach(params.query, (filter, key) => {
      if ((key === "sd" || key === "ed") && !lodash.isNil(filter) && typeof filter === "object") {
        lodash.forEach(filter, (value, fKey) => {
          if (["$gt", "$gte", "$lt", "$lte"].indexOf(fKey) !== -1) {
            lodash.set(params, `query.${key}.${fKey}`, moment(value).toDate());
          }
        });
      }
    });
    return context;
  };
};
