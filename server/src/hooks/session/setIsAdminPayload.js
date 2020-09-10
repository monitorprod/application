const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");

module.exports = function() {
  return async context => {
    const { app, data, params } = context;
    if (data.companyUUID !== "admin") {
      return context;
    }
    const usersSerive = app.service("users");
    const user = await usersSerive.get(lodash.get(params, "payload.userId"));
    const hasAdminRole = lodash.find(user.roles, { id: 1, name: "sysadmin" });
    if (!hasAdminRole) {
      throw new NotAuthenticated("Admin Account not found");
    }
    params.payload = { ...params.payload, isAdmin: true };
    return context;
  };
};
