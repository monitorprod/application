const fs = require("fs");
const lodash = require("lodash");

const CONFIG_PATH = "./config/default.json";

module.exports = function(app) {
  app.get("/sync_sensor", async (request, response) => {
    const sensorID = lodash.get(request, "query.sensorUUID");
    const companyID = lodash.get(request, "query.companyUUID");
    const sensorConfig = JSON.parse(fs.readFileSync(CONFIG_PATH));
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify({
        ...sensorConfig,
        sensorID,
        companyID
      })
    );
    return response.send({
      sensorID,
      companyID,
      status: "OK"
    });
  });
};
