const lodash = require("lodash");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [{ model: "attributes", as: "attributes" }],
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [populateHook],
    get: [populateHook],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [populateHook],
    get: [populateHook],
    create: [
      // TODO refactor this!!
      async (context) => {
        const { app, data, result } = context;
        if (lodash.isNil(data.attributes)) {
          return context;
        }
        if (!lodash.isArray(data.attributes)) {
          data.attributes = [data.attributes];
        }
        let resultArray = result;
        if (!lodash.isArray(resultArray)) {
          resultArray = [resultArray];
        }
        await Promise.all(
          lodash.map(resultArray, async (item) => {
            return await Promise.all(
              lodash.map(data.attributes, async (attribute) => {
                await app.service("attributes").create(
                  lodash.assign(attribute, {
                    companyId: data.companyId,
                    attributeGroupId: item.id,
                  })
                );
                return context;
              })
            );
          })
        );
      },
    ],
    update: [],
    patch: [
      async (context) => {
        const { app, data, result } = context;
        if (lodash.isNil(data.attributes)) {
          return context;
        }
        if (!lodash.isArray(data.attributes)) {
          data.attributes = [data.attributes];
        }
        let resultArray = result;
        if (!lodash.isArray(resultArray)) {
          resultArray = [resultArray];
        }
        await Promise.all(
          lodash.map(resultArray, async (item) => {
            return await Promise.all(
              lodash.map(data.attributes, async (attribute) => {
                await app.service("attributes").create(
                  lodash.assign(attribute, {
                    companyId: data.companyId,
                    attributeGroupId: item.id,
                  })
                );
                return context;
              })
            );
          })
        );
      },
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
