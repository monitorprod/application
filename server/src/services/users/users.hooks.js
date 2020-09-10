const lodash = require("lodash");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { BadRequest } = require("@feathersjs/errors");
const {
  hashPassword,
  protect,
} = require("@feathersjs/authentication-local").hooks;
const cleanFlags = require("../../hooks/cleanFlags");
const { addCompanyIdQuery } = require("../../hooks/session");
const {
  createUserPassword,
  sendUserSetupEmail,
  updateUserPassword,
  validateCompanyLimits,
} = require("../../hooks/setup");
const { sendUserReport } = require("../../hooks/reports");
const { createUserRoles, populate } = require("../../hooks/dependencies");
const { NON_UNIQUE_EMAIL } = require("../../utils/nonUniqueEmail");
const populateHook = populate({
  include: [
    { model: "roles", as: "roles" },
    { model: "user_statuses", as: "user_status" },
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
const iffForgotPasswordHook = iff(
  (context) => {
    const { data, params, type, method } = context;
    if (type === "before" && method === "patch") {
      params.$forgotPassword =
        lodash.get(params, "$forgotPassword") ||
        lodash.get(params, "query.$forgotPassword") ||
        lodash.get(data, "$forgotPassword");
      lodash.unset(params, "query.$forgotPassword");
      return params.$forgotPassword;
    }
    return false;
  },
  [cleanFlags()]
).else([authenticate("jwt"), iffCompanyUUIDHook]);

module.exports = {
  before: {
    all: [iffForgotPasswordHook],
    find: [populateHook],
    get: [populateHook],
    create: [
      createUserPassword(),
      hashPassword(),
      validateCompanyLimits({
        service: "users",
        identity: "usersLimit",
        error:
          "Você não pode criar mais usuários. Entre em contato com um administrador",
      }),
      async (context) => {
        const { data, app } = context;
        const usersService = app.service("users");
        if (lodash.indexOf(NON_UNIQUE_EMAIL, data.email) !== -1) {
          return context;
        }
        const { data: users } = await usersService.find({
          query: { email: data.email },
        });
        if (users.length) {
          throw new BadRequest("Já existe um usuario com esse email.");
        }
        return context;
      },
    ],
    update: [],
    patch: [hashPassword(), sendUserSetupEmail(), sendUserReport()],
    remove: [],
  },
  after: {
    all: [protect("password")],
    find: [populateHook],
    get: [populateHook],
    create: [createUserRoles(), sendUserSetupEmail()],
    update: [],
    patch: [
      updateUserPassword(),
      createUserRoles(),
      sendUserSetupEmail(),
      sendUserReport(),
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
