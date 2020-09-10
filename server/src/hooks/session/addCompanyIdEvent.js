const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const { SENSORS_TO_COPY } = require("../../utils/copySensorsData");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, method, params } = context;
    if (!params.provider) {
      if (lodash.get(data, "sensorId") && method === "create") {
        const sensorToCopy = lodash.find(SENSORS_TO_COPY, {
          sensorId: data.sensorId
        });
        if (sensorToCopy) {
          params.query = { ...params.query, ci: data.companyId };
          context.data = { ...data, ci: data.companyId };
          lodash.unset(params, "query.companyUUID");
        }
      }
      return context;
    }
    const sensorUUID = lodash.get(params, "query.sensorUUID") || lodash.get(data, "sensorUUID");
    if(sensorUUID) {
      return context;
    }
    // console.log("REQUEST HERE", params, data)
    const companyUUID = lodash.get(params, "query.companyUUID") || lodash.get(data, "companyUUID");
    if (!companyUUID) {
      throw new NotAuthenticated("Company Account not found");
    }
    const companiesSerive = app.service("companies");
    const { data: companies } = await companiesSerive.find({
      query: {
        uuid: companyUUID
      }
    });
    if (!companies.length) {
      throw new NotAuthenticated("Company Account not found");
    }
    if (
      method !== "create" &&
      lodash.get(companies, "0.id") !== lodash.get(params, "user.companyId")
    ) {
      throw new NotAuthenticated("Company Account not found");
    }
    await getConfigs({ app });
    if (
      method !== "create" &&
      `${lodash.get(companies, "0.companyStatusId")}` !==
        `${lodash.get(app.get("config.company.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Company Account not found");
    }
    const companyId = lodash.get(companies, "0.id");
    params.query = { ...params.query, ci: companyId };
    context.data = { ...data, ci: companyId };
    lodash.unset(params, "query.companyUUID");
    return context;
  };
};
