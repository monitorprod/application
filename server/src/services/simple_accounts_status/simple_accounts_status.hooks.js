const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { verifyIsSysAdmin } = require("../../hooks/session");
const cleanFlags = require("../../hooks/cleanFlags");

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery(), cleanFlags()],
    find: [],
    get: [],
    create: [verifyIsSysAdmin()],
    update: [verifyIsSysAdmin()],
    patch: [],
    remove: [verifyIsSysAdmin()],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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
