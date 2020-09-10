const fs = require("fs");
const lodash = require("lodash");
const { BadRequest } = require("@feathersjs/errors");

module.exports = function(app) {
  app.get("/documents/*", async (request, response) => {
    fs.readFile(`./public/images/${lodash.get(request, "params.0")}`, function(
      err,
      data
    ) {
      if (err) {
        response.status(400);
        return response.send(new BadRequest("Image not found"));
      }
      response.writeHead(200, { "Content-Type": "image/jpeg" });
      response.end(data);
    });
  });
};
