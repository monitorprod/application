const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { createDefaultHolidays, createDefaultTurns } = require("../../hooks/setup");
const { createPlantHolidays, createPlantTurns, populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [{ model: "plant_statuses", as: "plant_status" }],
  custom: [
    { searchType: "find", key: "plantId", model: "turns", as: "turns" },
    // TODO add query and sort here and remove it from the UI, add to query UI
    { searchType: "find", key: "plantId", model: "holidays", as: "holidays" }
  ]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [populateHook],
    get: [populateHook],
    create: [createDefaultTurns(), createDefaultHolidays()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [createPlantTurns(), createPlantHolidays()],
    update: [],
    patch: [createPlantTurns(), createPlantHolidays()],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
