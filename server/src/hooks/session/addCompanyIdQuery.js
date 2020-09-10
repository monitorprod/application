const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, params } = context;
    if (!params.provider) {
      return context;
    }
    const companyUUID = lodash.get(params, "query.companyUUID") || lodash.get(data, "companyUUID");
    if (companyUUID === "admin") {
      return context;
    }
    const user = params.user;
    const companiesSerive = app.service("companies");
    const { data: companies } = await companiesSerive.find({
      query: {
        uuid: companyUUID
      }
    });
    if (!companies.length) {
      // TODO remove specific ERRORS!!!
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
    params.query = { ...params.query, companyId: user.companyId };
    context.data = { ...data, companyId: user.companyId };
    lodash.unset(params, "query.companyUUID");
    return context;
  };
};
