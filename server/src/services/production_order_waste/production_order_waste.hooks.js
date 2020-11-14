const lodash = require("lodash");
const mongodb = require('mongodb');
const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const { minifyWasteData, updateWasteProduction } = require("../../hooks/production");

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [],
    get: [],
    create: [minifyWasteData()],
    update: [],
    patch: [
      async context => {
        const { data, params } = context;
        context.data = {
          cp: data.cp || 0,
          wp: data.wp || 0,
          wji: parseInt(data.wji) || null,
          ui: parseInt(lodash.get(params, "connection.payload.userId")) || null
        };
        params.query = {};
        return context;
      },
      updateWasteProduction()
    ],
    remove: [async context => {
      const { params } = context;
      lodash.forEach(params.query, (filter, key) => {
        if ((key === "_id") && !lodash.isNil(filter) && typeof filter === "object") {
          lodash.forEach(filter, (value, fKey) => {
            if (["$in"].indexOf(fKey) !== -1) {
              lodash.forEach(value, (v, i) => {
                lodash.set(params, `query.${key}.${fKey}.${i}`, new mongodb.ObjectID(v));
              });
            }
          });
        }
      });
      delete params.query.companyId;
      return context;
    }, updateWasteProduction()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [updateWasteProduction()],
    update: [],
    patch: [updateWasteProduction()],
    remove: [updateWasteProduction()]
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
