/* eslint-disable no-console */
const logger = require("./logger");
const app = require("./app");
const port = process.env.PORT || app.get("port");
const server = app.listen(port);

// const fs = require("fs");
// const https  = require('https');
// const privateKey = fs.readFileSync("./src/https/privatekey.pem").toString();
// const certificate = fs.readFileSync("./src/https/certificate.pem").toString();

// const server = https.createServer({
//   key: privateKey,
//   cert: certificate
// }, app).listen(port);
// app.setup(server);

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

server.on("listening", () => {
  logger.info("Environment ", process.env.NODE_ENV);
  logger.info("Feathers application started on https://%s:%d", app.get("host"), port);
});
