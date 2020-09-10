const lodash = require("lodash");
const uuid = require("uuid/v4");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, params, type, result } = context;
    if (params.$sendEmail && type === "after") {
      const usersService = app.service("users");
      const password = lodash.split(uuid(), "-").pop();
      const user = lodash.get(
        await usersService.find({
          query: {
            companyId: result.id,
            email: result.adminEmail
          }
        }),
        "data.0"
      );
      await getConfigs({ app });
      if (!user) {
        await usersService.create({
          name: result.adminContact,
          email: result.adminEmail,
          password,
          companyId: result.id,
          userStatusId: lodash.get(app.get("config.user.status.active"), "value"),
          roles: [{ id: 2 }],
          $companyUser: true
        });
        data.companyUserPassword = password;
      } else {
        await usersService.patch(user.id, {
          password,
          status: lodash.get(app.get("config.user.status.active"), "value")
        });
      }
      data.companyUserPassword = password;
    }
    return context;
  };
};
