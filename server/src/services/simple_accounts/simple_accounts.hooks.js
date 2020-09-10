const { BadRequest } = require("@feathersjs/errors");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const cleanFlags = require("../../hooks/cleanFlags");
const { createUserSimpleRoles } = require("../../hooks/dependencies");

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery(), cleanFlags()],
    find: [],
    get: [],
    create: [
      // TODO - Check if the user already exists
      async (context) => {
        const { app, data } = context;
        const userSimpleService = app.service("simple-accounts");
        const { data: userSimple } = await userSimpleService.find({
          query: { username: data.username },
        });
        if (userSimple.length) {
          throw new BadRequest("Já existe um usuário com este nome.");
        }
        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createUserSimpleRoles()],
    update: [],
    patch: [createUserSimpleRoles()],
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
