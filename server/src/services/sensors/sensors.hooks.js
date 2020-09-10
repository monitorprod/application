const lodash = require("lodash");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { verifyIsSysAdmin } = require("../../hooks/session");
const {
  addCompanyIdQuery,
  validateSensorAndCompanyUUID,
} = require("../../hooks/session");
const { createAttributes, populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [
    { model: "machines", as: "machine" },
    { model: "sensor_statuses", as: "sensor_status" },
    { model: "companies", as: "company" },
  ],
});
const iffCompanyUUIDHook = iff(
  (context) => {
    const { data, params } = context;
    const companyUUID =
      lodash.get(params, "query.companyUUID") ||
      lodash.get(data, "companyUUID");
    if (companyUUID === "admin") {
      lodash.unset(params, "query.companyUUID");
      return false;
    }
    return true;
  },
  [addCompanyIdQuery()]
);
const iffSensorUUIDHook = iff(
  (context) => {
    const { data, params } = context;
    const sensorUUID =
      lodash.get(params, "query.sensorUUID") || lodash.get(data, "sensorUUID");
    if (!sensorUUID) {
      return false;
    }
    return true;
  },
  [validateSensorAndCompanyUUID()]
).else([
  authenticate("jwt"),
  iffCompanyUUIDHook.else([verifyIsSysAdmin(), cleanFlags()]),
]);

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt"), iffCompanyUUIDHook, populateHook],
    get: [authenticate("jwt"), iffCompanyUUIDHook, populateHook],
    create: [authenticate("jwt"), verifyIsSysAdmin(), cleanFlags()],
    update: [],
    patch: [iffSensorUUIDHook],
    remove: [authenticate("jwt"), verifyIsSysAdmin(), cleanFlags()],
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [
      createAttributes({
        objectIdName: "sensorId",
        throughModel: "sensor_attributes",
      }),
    ],
    update: [],
    patch: [
      createAttributes({
        objectIdName: "sensorId",
        throughModel: "sensor_attributes",
      }),
    ],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
