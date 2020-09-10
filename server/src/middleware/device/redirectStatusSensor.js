const lodash = require("lodash");

module.exports = function(app) {
  app.get("/redirect_status_sensor", async (request, response) => {
    response.writeHead(302, {
      Location: lodash.get(request, "query.url")
    });
    response.end();
  });
};
