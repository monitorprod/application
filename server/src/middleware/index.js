const { getImages } = require("./files");
const { reportPDF } = require("./reports");
const {
  useStatusServer,
  useStatusSensor,
  redirectStatusSensor,
  listLocalMachines,
  getDeviceUpdateCredentials,
  syncSensor,
} = require("./device");
const useCompanyLoginName = require("./useCompanyLoginName");
const AuthenticationSimple = require("./simpleJwt/iffJWT");

module.exports = function (app) {
  app.configure(getImages);
  app.configure(reportPDF);
  app.configure(useStatusServer);
  app.configure(useStatusSensor);
  app.configure(redirectStatusSensor);
  app.configure(listLocalMachines);
  app.configure(getDeviceUpdateCredentials);
  app.configure(syncSensor);
  app.configure(useCompanyLoginName);
  app.configure(AuthenticationSimple);
};
