const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
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
