const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { data } = context;
    if (!data.loginName) {
      data.loginName = lodash.split(lodash.lowerCase(data.fantasyName), " ").join("");
    }
    return context;
  };
};
