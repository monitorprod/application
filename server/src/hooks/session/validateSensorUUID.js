const lodash = require("lodash");
const { NotAuthenticated } = require("@feathersjs/errors");
const { SENSORS_TO_COPY } = require("../../utils/copySensorsData");
const getConfigs = require("../../utils/getConfigs");

module.exports = function() {
  return async context => {
    const { app, data, method, params } = context;
    if (data.sensorId && method === "create") {
      const sensorToCopy = lodash.find(SENSORS_TO_COPY, {
        sensorId: data.sensorId
      });
      if (sensorToCopy) {
        return context;
      }
    }
    const sensorUUID = lodash.get(params, "query.sensorUUID") || lodash.get(data, "sensorUUID");
    const productionOrderId =
      lodash.get(params, "query.productionOrderId") || lodash.get(data, "productionOrderId");
    if (!sensorUUID && productionOrderId) {
      return context;
    }
    if (!sensorUUID && !productionOrderId) {
      throw new NotAuthenticated("Sensor not found");
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
    // if (`${lodash.get(sensors, "0.companyId")}` !== `${data.ci}`) {
    //   throw new NotAuthenticated("Company Account not found");
    // }
    await getConfigs({ app });
    if (
      `${lodash.get(sensors, "0.sensorStatusId")}` !==
      `${lodash.get(app.get("config.sensor.status.active"), "value")}`
    ) {
      throw new NotAuthenticated("Sensor not found");
    }
    const sensorId = lodash.get(sensors, "0.id");
    companyId = lodash.get(sensors, "0.companyId");
    params.query = { ...params.query, sensorId, ci: companyId };
    context.data = { ...data, sensorId, ci: companyId };
    return context;
  };
};
