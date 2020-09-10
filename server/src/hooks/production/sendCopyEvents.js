const lodash = require("lodash");
const request = require("request");
const { SENSORS_TO_COPY } = require("../../utils/copySensorsData");

module.exports = function() {
  return async context => {
    const { data } = context;
    return context;
    if (!data.machineId) {
      const sensorToCopy = lodash.find(SENSORS_TO_COPY, {
        sensorUUID: data.sensorUUID
      });
      if (sensorToCopy) {
        lodash.forEach(sensorToCopy.machines, ({ host, sensorUUID, companyUUID }) => {
          // console.log("!!!copy event");
          request.post({
            url: `${host}/production_order_events`,
            form: {
              ...data,
              sensorUUID,
              companyUUID
            }
          });
        });
      }
    }
    return context;
  };
};
