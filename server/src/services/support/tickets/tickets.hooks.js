const lodash = require("lodash");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery, verifyIsSysAdmin } = require("../../../hooks/session");
const { populate } = require("../../../hooks/dependencies");

const populateHook = populate({
  include: [{ model: "ticket_statuses", as: "ticket_status" }]
})

const iffCompanyUUIDHook = iff(
  context => {
    const { data, params } = context;
    const companyUUID = lodash.get(params, "query.companyUUID") || lodash.get(data, "companyUUID");
    if (companyUUID === "admin") {
      lodash.unset(params, "query.companyUUID");
      return false;
    }
    return true;
  },
  [
    addCompanyIdQuery(),
    async context => {
      const { params } = context;
      params.query.userId =
        parseInt(lodash.get(params, "connection.payload.userId")) || params.query.userId || null;
      return context;
    }
  ]
).else([verifyIsSysAdmin()]);

module.exports = {
  before: {
    all: [authenticate("jwt")],
    find: [iffCompanyUUIDHook, populateHook],
    get: [iffCompanyUUIDHook, populateHook],
    create: [
      addCompanyIdQuery(),
      async context => {
        const { params } = context;
        context.data.userId = parseInt(lodash.get(params, "connection.payload.userId")) || null;
        return context;
      }
    ],
    update: [],
    patch: [iffCompanyUUIDHook],
    remove: []
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
