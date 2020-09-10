const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

module.exports = function (app) {
  app.get("/list_local_machines", async (request, response) => {
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
    const companyId = lodash.get(companies, "0.id");
    const machinesSerive = app.service("machines");
    const { data: machines } = await machinesSerive.find({
      query: {
        companyId,
        machineStatusId: lodash.get(
          app.get("config.machine.status.active"),
          "value"
        ),
        $sort: { identity: 1 },
      },
    });
    const { data: machineSensors } = await sensorsSerive.find({
      query: {
        companyId,
        machineId: { $in: lodash.map(machines, (m) => m.id) },
      },
    });
    return response.send(
      lodash.map(machines, (m) => ({
        machineName: `${m.identity} - ${m.name}`,
        sensorIP: lodash.get(
          lodash.filter(machineSensors, { machineId: m.id }),
          "0.ip"
        ),
      }))
    );
  });
};
