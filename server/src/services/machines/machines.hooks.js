const lodash = require("lodash");
const moment = require("moment");
const { iff } = require("feathers-hooks-common");
const { authenticate } = require("@feathersjs/authentication").hooks;
const getConfigs = require("../../utils/getConfigs");
const {
  createAttributes,
  createMachineMoldProducts,
  populate
} = require("../../hooks/dependencies");
const { addCompanyIdQuery, verifyIsSysAdmin } = require("../../hooks/session");
const { eventsAndNavigation } = require("../../hooks/production");
const { validateCompanyLimits } = require("../../hooks/setup");
const {
  pendingWaste,
  reportOEE,
  productionOrders,
  reportLabels,
  reportIndicators,
  reportYesterdaySummary,
  reportAvailability,
  reportHistory
} = require("../../hooks/reports");
const populateHook = populate({
  include: [
    { model: "machine_types", as: "machine_type" },
    { model: "machine_statuses", as: "machine_status" },
    { model: "plants", as: "plant" }
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
  [addCompanyIdQuery()]
);
const iffAdminQueryCompanyIdHook = iff(
  context => {
    const { data, params } = context;
    params.$adminQueryCompanyId =
      lodash.get(params, "query.$adminQueryCompanyId") ||
      lodash.get(data, "$adminQueryCompanyId");
    if (params.$adminQueryCompanyId) {
      lodash.unset(params, "query.$adminQueryCompanyId");
      params.query = {
        ...params.query,
        companyId: params.$adminQueryCompanyId
      };
      context.data = { ...data, companyId: params.$adminQueryCompanyId };
      return true;
    }
    return false;
  },
  [verifyIsSysAdmin()]
);

module.exports = {
  before: {
    // TODO restrict iff just to admin operations
    all: [authenticate("jwt"), iffCompanyUUIDHook],
    find: [
      iffAdminQueryCompanyIdHook,
      pendingWaste(),
      productionOrders(),
      reportLabels(),
      reportIndicators(),
      reportYesterdaySummary(),
      reportAvailability(),
      reportHistory(),
      reportOEE(),
      populateHook
    ],
    get: [eventsAndNavigation(), populateHook],
    create: [
      validateCompanyLimits({
        service: "machines",
        identity: "machinesLimit",
        error:
          "Você não pode criar mais máquinas. Entre em contato com um administrador"
      })
    ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      pendingWaste(),
      productionOrders(),
      reportLabels(),
      reportIndicators(),
      reportYesterdaySummary(),
      reportAvailability(),
      reportHistory(),
      reportOEE(),
      populateHook
    ],
    get: [eventsAndNavigation(), populateHook],
    create: [
      createMachineMoldProducts(),
      createAttributes({
        objectIdName: "machineId",
        throughModel: "machine_attributes"
      }),
      async context => {
        const { app, params, result } = context;
        const level = lodash.get(params, "payload.company.level");
        const companyId = lodash.get(params, "payload.company.id");
        await getConfigs({ app });
        if (level === "N6") {
          const mold = await app.service("molds").create({
            companyId,
            identity: result.identity,
            name: result.name,
            idealCycle: result.idealCycle,
            idealCycleUM: result.idealCycleUM,
            moldStatusId: lodash.get(
              app.get("config.mold.status.active"),
              "value"
            )
          });
          const { data: productionOrderTypes } = await app
            .service("production_order_types")
            .find({
              query: {
                companyId,
                isInProduction: true
              }
            });
          const productionOrder = await app
            .service("production_orders")
            .create({
              companyId,
              machineId: result.id,
              moldId: mold.id,
              plantId: result.plantId,
              idealCycle: result.idealCycle,
              idealCycleUM: result.idealCycleUM,
              productionOrderTypeId: lodash.get(productionOrderTypes, "0.id"),
              productionOrderStatusId: lodash.get(
                app.get("config.productionOrder.status.init"),
                "value"
              ),
              isContinuos: true
            });
          const { data: eventTypes } = await app
            .service("production_order_event_types")
            .find({
              companyId,
              productionOrderActionTypeId: lodash.get(
                app.get("config.productionOrder.eventType.active"),
                "value"
              )
            });
          await app.service("production_order_events").create({
            productionOrderId: productionOrder.id,
            startDate: moment().toISOString(),
            endDate: -1,
            productionOrderEventTypeId: lodash.get(eventTypes, "0.id")
          });
        }
        return context;
      }
    ],
    update: [],
    patch: [
      createMachineMoldProducts(),
      createAttributes({
        objectIdName: "machineId",
        throughModel: "machine_attributes"
      })
    ],
    remove: [
      async context => {
        const { app, params, result } = context;
        const companyId = lodash.get(params, "payload.company.id");
        const level = lodash.get(params, "payload.company.level");
        await getConfigs({ app });
        if (level === "N6" && result.identity) {
          try {
            await app.service("molds").remove(null, {
              query: { companyId, identity: result.identity }
            });
          } catch (error) {}
        }
        return context;
      }
    ]
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
