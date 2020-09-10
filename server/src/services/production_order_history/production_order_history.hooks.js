const lodash = require("lodash");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { parseDateFilters, setEndDateUndefined } = require("../../hooks/production");
const { addCompanyIdEvent } = require("../../hooks/session");
const {
  populate,
  populateHistoryMostRecentEvent,
  populateHistoryUsersAndTurns
} = require("../../hooks/dependencies");
const populateHook = populate({
  custom: [
    {
      model: "production_orders",
      key: "poi",
      as: "productionOrder",
      query: { $populateAll: true }
      // TODO optimize this populate!!
      // query: { $populateSelect: ["product"] }
    }
  ]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdEvent()],
    find: [
      parseDateFilters(),
      populateHistoryMostRecentEvent(),
      populateHistoryUsersAndTurns(),
      populateHook
    ],
    get: [populateHistoryMostRecentEvent(), populateHistoryUsersAndTurns(), populateHook],
    create: [],
    update: [],
    patch: [
      parseDateFilters(),
      async context => {
        const { app, data, params } = context;
        const productionOrderHistoryService = app.service("production_order_history");
        if (lodash.get(data, "$editEvent")) {
          const history = await productionOrderHistoryService.get(context.id);
          context.data = { poi: history.poi };
          history.ev[lodash.get(data, "$editEvent.index")].ev = lodash.get(data, "$editEvent.ev");
          history.ev[lodash.get(data, "$editEvent.index")].at = lodash.get(data, "$editEvent.at");
          history.ev[lodash.get(data, "$editEvent.index")].ui = lodash.get(
            params,
            "connection.payload.userId"
          );
          await productionOrderHistoryService.patch(history._id, {
            ev: history.ev
          });
        }
        return context;
      }
    ],
    remove: [parseDateFilters()]
  },

  after: {
    all: [],
    find: [
      setEndDateUndefined({ path: "ev" }),
      populateHistoryMostRecentEvent(),
      populateHistoryUsersAndTurns(),
      populateHook
    ],
    get: [
      setEndDateUndefined({ path: "ev" }),
      populateHistoryMostRecentEvent(),
      populateHistoryUsersAndTurns(),
      populateHook
    ],
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
