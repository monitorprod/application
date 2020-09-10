const moment = require("moment");
const { authenticate } = require("@feathersjs/authentication").hooks;
const { addCompanyIdQuery } = require("../../hooks/session");
const {
  eventsAndNavigation,
  startProductionOrderHistory,
  updateProductionOrderHistory
} = require("../../hooks/production");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  include: [
    { model: "machines", as: "machine" },
    { model: "molds", as: "mold" },
    { model: "products", as: "product" },
    { model: "sensors", as: "sensor" },
    { model: "production_order_types", as: "production_order_type" },
    { model: "production_order_statuses", as: "production_order_status" },
    { model: "plants", as: "plant" }
  ],
  custom: [
    {
      searchType: "find",
      model: "production_order_history",
      key: "poi",
      as: "mostRecentEvent",
      query: { $mostRecentEvent: true }
    },
    {
      searchType: "find",
      model: "production_order_events",
      key: "poi",
      as: "lastReading",
      query: {
        $populateAll: true,
        // "r.0": { $exists: true },
        "r.t": { $ne: "0" },
        sd: {
          $gte: moment()
            .startOf("day")
            .add(6, "hours")
            .toDate()
        },
        $sort: { sd: -1 },
        $limit: 1
      }
    }
  ]
});

module.exports = {
  before: {
    all: [authenticate("jwt"), addCompanyIdQuery()],
    find: [populateHook],
    get: [eventsAndNavigation(), populateHook],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [populateHook],
    get: [eventsAndNavigation(), populateHook],
    create: [startProductionOrderHistory()],
    update: [],
    patch: [startProductionOrderHistory(), updateProductionOrderHistory()],
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
