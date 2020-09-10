const lodash = require("lodash");
const moment = require("moment");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const {
  addCompanyIdQuery,
  verifyIsSysAdmin,
} = require("../../../hooks/session");

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
).else([
  verifyIsSysAdmin(),
  async (context) => {
    const { method, data, app } = context;
    if (method === "create") {
      const ticket = await app
        .service("tickets")
        .get(data.ticketId, { query: { companyUUID: "admin" } });
      context.data.companyId = ticket.companyId;
    }
    return context;
  },
]);

module.exports = {
  before: {
    all: [authenticate("jwt"), iffCompanyUUIDHook],
    find: [
      async (context) => {
        const { params } = context;
        if (lodash.get(params, "query.$markAsViewed")) {
          params.$markAsViewed = lodash.get(params, "query.$markAsViewed");
          lodash.unset(params, "query.$markAsViewed");
        }
        return context;
      },
    ],
    get: [],
    create: [
      async (context) => {
        const { params } = context;
        context.data.userId =
          parseInt(lodash.get(params, "connection.payload.userId")) || null;
        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [
      async (context) => {
        const { app, result, params } = context;
        let resultArray = result.data || result;
        if (!Array.isArray(resultArray)) {
          resultArray = [resultArray];
        }
        lodash.forEach(resultArray, (item) => {
          if (
            item.userId !== lodash.get(params, "user.id") &&
            lodash.get(params, "$markAsViewed.viewedAt") === null &&
            lodash.get(params, "query.ticketId") === item.ticketId &&
            item.viewedAt === null
          ) {
            item.viewedAt = moment();
            app.service("ticket_messages").patch(item.id, item, {
              ticketId: lodash.get(params, "query.ticketId"),
            });
          }
        });
      },
      async (context) => {
        const { app, result } = context;
        const usersService = app.service("users");
        let resultArray = result.data || result;
        if (!Array.isArray(resultArray)) {
          resultArray = [resultArray];
        }
        const { data: users } = await usersService.find();
        const usersMap = lodash.keyBy(users, "id") || {};
        lodash.forEach(resultArray, (item) => {
          item.user = lodash.get(usersMap, item.userId);
        });
        return context;
      },
    ],
    get: [],
    create: [
      async (context) => {
        const { app, result } = context;
        const usersService = app.service("users");
        let resultData = result.data || result;
        const { data: user } = await usersService.find({
          query: { id: result.userId },
        });
        resultData.user = user[0];
        return context;
      },
    ],
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
