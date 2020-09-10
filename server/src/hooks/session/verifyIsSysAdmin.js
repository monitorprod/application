const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");

module.exports = function() {
  return async context => {
    const { app, params } = context;
    if (!params.provider) {
      return context;
    }
    const usersSerive = app.service("users");
    const user = await usersSerive.get(lodash.get(params, "payload.userId"));
    const hasAdminRole = lodash.find(user.roles, {
      id: 1,
      name: "sysadmin"
    });
    if (!hasAdminRole) {
      lodash.unset(params, "query.companyId");
      throw new NotAuthenticated("Admin Account not found");
    }
    return context;
  };
};
