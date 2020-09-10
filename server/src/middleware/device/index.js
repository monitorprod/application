const useStatusServer = require("./useStatusServer");
const useStatusSensor = require("./useStatusSensor");
const redirectStatusSensor = require("./redirectStatusSensor");
const listLocalMachines = require("./listLocalMachines");
const getDeviceUpdateCredentials = require("./getDeviceUpdateCredentials");
const syncSensor = require("./syncSensor");

module.exports = {
  useStatusServer,
  useStatusSensor,
  redirectStatusSensor,
  getDeviceUpdateCredentials,
  listLocalMachines,
  syncSensor
};
