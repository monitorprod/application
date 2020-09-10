const uuid = require("uuid/v4");
const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { data } = context;
    const password = lodash.split(uuid(), "-").pop();
    if (!data.password) {
      data.password = password;
    }
    data.userPassword = password;
    return context;
  };
};
