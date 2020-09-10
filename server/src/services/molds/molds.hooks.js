const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { createAttributes, createMoldProducts, populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [
    { model: "mold_statuses", as: "mold_status" },
    { method: "get", model: "products", as: "products" }
  ],
  custom: [{ model: "measurement_units", as: "ideal_cycle_measurement_unit", key: "idealCycleUM" }]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [populateHook],
    get: [populateHook],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [
      createMoldProducts(),
      createAttributes({ objectIdName: "moldId", throughModel: "mold_attributes" })
    ],
    update: [],
    patch: [
      createMoldProducts(),
      createAttributes({ objectIdName: "moldId", throughModel: "mold_attributes" })
    ],
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
