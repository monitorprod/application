const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, params } = context;
    const sensorUUID = lodash.get(params, "query.sensorUUID") || lodash.get(data, "sensorUUID");
    const companyUUID = lodash.get(params, "query.companyUUID") || lodash.get(data, "companyUUID");
    // TODO OR, validate if sensor blocked?
    if (!sensorUUID && !companyUUID) {
      throw new NotAuthenticated("Company Account not found");
    }
    const sensorsSerive = app.service("sensors");
    const { data: sensors } = await sensorsSerive.find({
      query: {
        uuid: sensorUUID
      }
    });
    if (!sensors.length) {
      throw new NotAuthenticated("Sensor not found");
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
    if (`${lodash.get(sensors, "0.companyId")}` !== `${lodash.get(companies, "0.id")}`) {
      throw new NotAuthenticated("Company Account not found");
    }
    await getConfigs({ app });
    if (
      `${lodash.get(companies, "0.companyStatusId")}` !==
      `${lodash.get(app.get("config.company.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Company Account not found");
    }
    const sensorId = lodash.get(sensors, "0.id");
    params.query = { id: sensorId };
    context.data = {
      ip: data.ip,
      mac: data.mac
    };
    return context;
  };
};
