const lodash = require("lodash");
const uuid = require("uuid/v4");
const { BadRequest } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

const createPassword = async ({ app, user, data }) => {
  const usersService = app.service("users");
  await getConfigs({ app });
  if (`${user.userStatusId}` !== `${lodash.get(app.get("config.user.status.active"), "value")}`) {
    throw new BadRequest("Não é possível enviar email para contas bloqueadas");
  }
  const password = lodash.split(uuid(), "-").pop();
  await usersService.patch(user.id, { password });
  data.userPassword = password;
};

module.exports = function() {
  return async context => {
    const { app, data, params, type, result } = context;
    if (params.$sendEmail && type === "after") {
      await createPassword({ app, user: result, data });
    }
    if (params.$forgotPassword && type === "after") {
      const user = lodash.get(result, "0");
      if (!user) {
        throw new BadRequest("User Account not found");
      }
      await createPassword({ app, user, data });
    }
    return context;
  };
};
