const uuid = require("uuid/v4");
const lodash = require("lodash");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, result, data } = context;
    const usersService = app.service("users");
    const password = lodash.split(uuid(), "-").pop();
    await getConfigs({ app });
    const newUser = {
      name: result.adminContact,
      email: result.adminEmail,
      password,
      companyId: result.id,
      userStatusId: lodash.get(app.get("config.user.status.active"), "value"),
      roles: [{ id: 2 }],
      $companyUser: true
    };
    await usersService.create(newUser);
    data.companyUserPassword = password;
    return context;
  };
};
