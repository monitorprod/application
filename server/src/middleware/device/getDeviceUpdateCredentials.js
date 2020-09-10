const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

module.exports = function (app) {
  app.get("/get_git_data", async (request, response) => {
    const sensorUUID = lodash.get(request, "query.sensorUUID");
    const companyUUID = lodash.get(request, "query.companyUUID");
    if (!sensorUUID || !companyUUID) {
      throw new NotAuthenticated("Company Account not found");
    }
    const sensorsSerive = app.service("sensors");
    const { data: sensors } = await sensorsSerive.find({
      query: {
        uuid: sensorUUID,
      },
    });
    if (!sensors.length) {
      throw new NotAuthenticated("Sensor not found");
    }
    const companiesSerive = app.service("companies");
    const { data: companies } = await companiesSerive.find({
      query: {
        uuid: companyUUID,
      },
    });
    if (!companies.length) {
      throw new NotAuthenticated("Company Account not found");
    }
    if (
      `${lodash.get(sensors, "0.companyId")}` !==
      `${lodash.get(companies, "0.id")}`
    ) {
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
      `${lodash.get(sensors, "0.sensorStatusId")}` !==
      `${lodash.get(app.get("config.sensor.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Sensor not found");
    }
    return response.send({
      user: "gitlab+deploy-token-92040",
      pass: "75aukvs1vcK7-yHJYy9s",
      server: "gitlab.com/watchprod/device.git",
      url:
        "https://gitlab+deploy-token-92040:75aukvs1vcK7-yHJYy9s@gitlab.com/watchprod/device.git",
    });
  });
};
