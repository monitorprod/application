const lodash = require("lodash");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const {
  addCompanyIdEvent,
  validateSensorUUID
} = require("../../hooks/session");
const {
  addEventToProductionOrderHistory,
  // minifyAndCopyEventData,
  minifyEventData,
  parseDateFilters,
  sendCopyEvents,
  sendEventNotifications,
  setEndDateUndefined,
  updateProductionOrder
} = require("../../hooks/production");
const { populate } = require("../../hooks/dependencies");
const populateHook = populate({
  custom: [
    {
      model: "production_order_event_types",
      as: "productionOrderEventType",
      key: "ev"
    }
  ]
});
const iffCompanyUUIDHook = iff(
  context => {
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
  [addCompanyIdEvent()]
);

module.exports = {
  before: {
    all: [],
    find: [
      authenticate("jwt"),
      iffCompanyUUIDHook,
      parseDateFilters(),
      populateHook
    ],
    get: [authenticate("jwt"), addCompanyIdEvent(), populateHook],
    create: [
      addCompanyIdEvent(),
      validateSensorUUID(),
      sendCopyEvents(),
      minifyEventData(),
      sendEventNotifications()
    ],
    // create: [minifyAndCopyEventData()],
    update: [],
    patch: [authenticate("jwt"), addCompanyIdEvent(), parseDateFilters()],
    // patch: [minifyAndCopyEventData(), addEventToProductionOrderHistory()],
    remove: [authenticate("jwt"), addCompanyIdEvent(), parseDateFilters()]
  },

  after: {
    all: [],
    find: [setEndDateUndefined({}), populateHook],
    get: [populateHook],
    create: [addEventToProductionOrderHistory(), updateProductionOrder()],
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
