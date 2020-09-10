const createAttributes = require("./createAttributes");
const createMachineMoldProducts = require("./createMachineMoldProducts");
const createMoldProducts = require("./createMoldProducts");
const createPlantHolidays = require("./createPlantHolidays");
const createPlantTurns = require("./createPlantTurns");
const createUserRoles = require("./createUserRoles");
const createUserSimpleRoles = require("./createUserSimpleRoles");
const populate = require("./populate");
const populateHistoryMostRecentEvent = require("./populateHistoryMostRecentEvent");
const populateHistoryUsersAndTurns = require("./populateHistoryUsersAndTurns");

module.exports = {
  createAttributes,
  createMachineMoldProducts,
  createMoldProducts,
  createPlantHolidays,
  createPlantTurns,
  createUserRoles,
  createUserSimpleRoles,
  populate,
  populateHistoryMostRecentEvent,
  populateHistoryUsersAndTurns,
};
