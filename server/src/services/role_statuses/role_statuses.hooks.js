const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { verifyIsSysAdmin } = require("../../hooks/session");

module.exports = {
  before: {
    all: [authenticate("jwt"), cleanFlags()],
    find: [],
    get: [],
    create: [verifyIsSysAdmin()],
    update: [],
    patch: [verifyIsSysAdmin()],
    remove: [verifyIsSysAdmin()]
  },

  after: {
    all: [],
    find: [],
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
