const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  custom: [
    { model: "machines", as: "machine", key: "machineId" },
    { model: "molds", as: "mold", key: "moldId" },
    { model: "products", as: "product", key: "productId" },
    { model: "measurement_units", as: "ideal_cycle_measurement_unit", key: "idealCycleUM" }
  ]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [populateHook],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [populateHook],
    get: [],
    create: [],
    update: [],
    patch: [],
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
