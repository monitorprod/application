const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { addCompanyIdQuery } = require("../../hooks/session");

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery(), cleanFlags()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
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
