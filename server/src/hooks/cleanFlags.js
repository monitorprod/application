const lodash = require("lodash");

module.exports = function() {
  return context => {
    const { params } = context;
    lodash.unset(params, "query.$populateAll");
    lodash.unset(params, "query.companyUUID");
    return context;
  };
};
