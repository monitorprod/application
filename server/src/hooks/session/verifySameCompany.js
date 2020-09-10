const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, params } = context;
    const companyUUID = lodash.get(params, "query.companyUUID") || lodash.get(data, "companyUUID");
    if (companyUUID === "admin") {
      return context;
    }
    const usersSerive = app.service("users");
    const companiesSerive = app.service("companies");
    const user = await usersSerive.get(lodash.get(params, "payload.userId"));
    const { data: companies } = await companiesSerive.find({
      query: {
        uuid: companyUUID
      }
    });
    if (!companies.length) {
      throw new NotAuthenticated("Company Account not found");
    }
    if (lodash.get(companies, "0.id") !== user.companyId) {
      throw new NotAuthenticated("Company Account not found");
    }
    await getConfigs({ app });
    if (
      `${lodash.get(companies, "0.companyStatusId")}` !==
      `${lodash.get(app.get("config.company.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Company Account not found");
    }
    if (
      `${lodash.get(user, "userStatusId")}` !==
      `${lodash.get(app.get("config.user.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Company Account not found");
    }
    params.payload = {
      ...params.payload,
      roles: user.roles,
      company: companies[0],
      user: user
    };
    return context;
  };
};
