const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { verifyIsSysAdmin } = require("../../hooks/session");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [{ model: "role_statuses", as: "role_status" }]
});

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [populateHook, cleanFlags()],
    get: [populateHook, cleanFlags()],
    create: [verifyIsSysAdmin(), cleanFlags()],
    update: [],
    patch: [verifyIsSysAdmin(), cleanFlags()],
    remove: [verifyIsSysAdmin(), cleanFlags()]
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
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
