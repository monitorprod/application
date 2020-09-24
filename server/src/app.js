const path = require("path");
const favicon = require("serve-favicon");
const compress = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const feathers = require("@feathersjs/feathers");
const configuration = require("@feathersjs/configuration");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");

const logger = require("./logger");
const middleware = require("./middleware");
const services = require("./services");
const schedule = require("./schedule");
const appHooks = require("./app.hooks");
const channels = require("./channels");
const sequelize = require("./sequelize");
const authentication = require("./authentication");
const mongodb = require("./mongodb");

const app = express(feathers());
// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(helmet());
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get("public"), "favicon.ico")));
// Host the public folder
app.use("/", express.static(app.get("public")));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(
  socketio({
    origins:
      "http://localhost:* https://monitorprod.com.br:* http://monitorprod.com.br:* https://www.monitorprod.com.br:* http://www.monitorprod.com.br:*",
  })
);
app.configure(sequelize);
app.configure(mongodb);

// Set up Middlewares and Services
app.configure(middleware);
app.configure(authentication);
app.configure(services);
app.configure(schedule);
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use("*", express.static(app.get("public")));
app.use(express.notFound());
// app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
