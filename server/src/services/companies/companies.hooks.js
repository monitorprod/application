const { authenticate } = require("@feathersjs/authentication").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { verifyIsSysAdmin } = require("../../hooks/session");
const {
  createCompanyInitialData,
  createCompanyLoginName,
  createCompanyUser,
  sendCompanySetupEmail,
  updateCompanyUser,
  validateCompanyAdminEmail,
} = require("../../hooks/setup");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [{ model: "company_statuses", as: "company_status" }],
});

module.exports = {
  before: {
    all: [authenticate("jwt"), verifyIsSysAdmin()],
    find: [populateHook, cleanFlags()],
    get: [populateHook, cleanFlags()],
    create: [
      validateCompanyAdminEmail(),
      createCompanyLoginName(),
      cleanFlags(),
    ],
    update: [],
    patch: [createCompanyLoginName(), sendCompanySetupEmail(), cleanFlags()],
    remove: [cleanFlags()],
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [
      createCompanyUser(),
      sendCompanySetupEmail(),
      createCompanyInitialData(),
    ],
    update: [],
    patch: [updateCompanyUser(), sendCompanySetupEmail()],
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
