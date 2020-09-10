const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { createAttributes, populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [{ model: "product_statuses", as: "product_status" }],
  custom: [
    { model: "measurement_units", as: "measurement_unit", key: "UM" },
    { model: "measurement_units", as: "weight_measurement_unit", key: "weightUM" }
  ]
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
    create: [createAttributes({ objectIdName: "productId", throughModel: "product_attributes" })],
    update: [],
    patch: [createAttributes({ objectIdName: "productId", throughModel: "product_attributes" })],
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
