const lodash = require("lodash");
const getConfigs = require("../../utils/getConfigs");
const { getActionType } = require("../../utils/events");

module.exports = function() {
  return async context => {
    const { app, method, type, params, service, result } = context;
    const productionOrdersService = app.service("production_orders");
    const eventTypesService = app.service("production_order_event_types");
    if (
      (lodash.get(params, "$eventsAndNavigation") ||
        lodash.get(params, "query.$eventsAndNavigation")) &&
      method === "get"
    ) {
      params.$eventsAndNavigation =
        lodash.get(params, "$eventsAndNavigation") ||
        lodash.get(params, "query.$eventsAndNavigation");
      lodash.unset(params, "query.$eventsAndNavigation");
    }
    if (params.$eventsAndNavigation && type === "after") {
      await getConfigs({ app });
      const setupActionType = getActionType({ app, type: "setup" });
      const setupAutoActionType = getActionType({ app, type: "setupAuto" });
      const scheduledStopActionType = getActionType({
        app,
        type: "scheduledStop"
      });
      const noScheduledStopActionType = getActionType({
        app,
        type: "noScheduledStop"
      });
      const noWorkDayActionType = getActionType({ app, type: "noWorkDay" });
      const closedActionType = getActionType({ app, type: "closed" });
      const activeActionType = getActionType({ app, type: "active" });
      let machineId,
        nextProductionOrder,
        prevProductionOrder,
        activeProductionOrder;
      if (lodash.get(service, "Model.tableName") === "machine") {
        const machine = result.data || result;
        machineId = lodash.get(machine, "id");
        const { data } = await productionOrdersService.find({
          query: {
            machineId,
            actualStartDate: { $ne: null },
            $sort: {
              actualStartDate: -1
            },
            $limit: 1
          }
        });
        if (data.length > 0) {
          prevProductionOrder = data[0];
        } else {
          const { data } = await productionOrdersService.find({
            query: {
              machineId,
              actualStartDate: null,
              $sort: {
                createdAt: -1
              },
              $limit: 1
            }
          });
          if (data.length > 0) {
            prevProductionOrder = data[0];
          }
        }
      } else {
        const productionOrder = result.data || result;
        machineId = lodash.get(productionOrder, "machineId");
        const actualStartDate = lodash.get(productionOrder, "actualStartDate");
        const productionOrderId = lodash.get(productionOrder, "id");
        const designedStatus = lodash.get(
          app.get("config.productionOrder.status.designed"),
          "value"
        );
        const eventsQuery = {
          companyId: lodash.get(productionOrder, "companyId"),
          $populateAll: true,
          $sort: {
            productionOrderActionTypeId: 1
          }
        };
        let eventTypes = [];
        // TODO use lodash get FOR ALL
        if (
          `${lodash.get(productionOrder, "productionOrderStatusId")}` !==
          `${designedStatus}`
        ) {
          if (!lodash.get(productionOrder, "isActive")) {
            if (
              lodash.get(
                productionOrder,
                "production_order_type.isInProduction"
              )
            ) {
              let { data } = await eventTypesService.find({
                query: {
                  ...eventsQuery,
                  productionOrderActionTypeId: {
                    $in: [
                      activeActionType,
                      setupActionType,
                      setupAutoActionType,
                      noScheduledStopActionType
                    ]
                  }
                }
              });
              eventTypes = data;
            } else {
              let { data } = await eventTypesService.find({
                query: {
                  ...eventsQuery,
                  productionOrderActionTypeId: {
                    $in: [scheduledStopActionType, noWorkDayActionType]
                  }
                }
              });
              eventTypes = data;
            }
          } else {
            if (
              lodash.get(
                productionOrder,
                "production_order_type.isInProduction"
              )
            ) {
              let { data } = await eventTypesService.find({
                query: {
                  ...eventsQuery,
                  productionOrderActionTypeId: {
                    $in: [
                      activeActionType,
                      setupActionType,
                      setupAutoActionType,
                      noScheduledStopActionType,
                      scheduledStopActionType,
                      noWorkDayActionType,
                      closedActionType
                    ]
                  }
                }
              });
              eventTypes = data;
            } else {
              let { data } = await eventTypesService.find({
                query: {
                  ...eventsQuery,
                  productionOrderActionTypeId: {
                    $in: [
                      scheduledStopActionType,
                      noWorkDayActionType,
                      closedActionType
                    ]
                  }
                }
              });
              eventTypes = data;
            }
          }
        }
        lodash.set(context.result, "eventTypes", eventTypes);
        lodash.set(context.result, "dataValues.eventTypes", eventTypes);
        if (actualStartDate) {
          const { data } = await productionOrdersService.find({
            query: {
              machineId,
              id: { $ne: productionOrderId },
              actualStartDate: {
                $ne: null,
                $gt: actualStartDate
              },
              $sort: {
                actualStartDate: 1
              },
              $limit: 1
            }
          });
          if (data.length > 0) {
            nextProductionOrder = data[0];
          } else {
            const { data } = await productionOrdersService.find({
              query: {
                machineId,
                id: { $ne: productionOrderId },
                actualStartDate: null,
                $sort: {
                  createdAt: 1
                },
                $limit: 1
              }
            });
            if (data.length > 0) {
              nextProductionOrder = data[0];
            }
          }
        } else {
          const { data } = await productionOrdersService.find({
            query: {
              machineId,
              id: { $ne: productionOrderId },
              actualStartDate: null,
              createdAt: {
                $gt: lodash.get(productionOrder, "createdAt")
              },
              $sort: {
                actualStartDate: 1
              },
              $limit: 1
            }
          });
          if (data.length > 0) {
            nextProductionOrder = data[0];
          }
        }
        if (actualStartDate) {
          const { data } = await productionOrdersService.find({
            query: {
              machineId,
              id: { $ne: productionOrderId },
              actualStartDate: {
                $ne: null,
                $lt: actualStartDate
              },
              $sort: {
                actualStartDate: -1
              },
              $limit: 1
            }
          });
          if (data.length > 0) {
            prevProductionOrder = data[0];
          }
        } else {
          const { data } = await productionOrdersService.find({
            query: {
              machineId,
              id: { $ne: productionOrderId },
              actualStartDate: null,
              createdAt: { $lt: lodash.get(productionOrder, "createdAt") },
              $sort: {
                createdAt: -1
              },
              $limit: 1
            }
          });
          if (data.length > 0) {
            prevProductionOrder = data[0];
          } else {
            const { data } = await productionOrdersService.find({
              query: {
                machineId,
                id: { $ne: productionOrderId },
                actualStartDate: {
                  $ne: null
                },
                $sort: {
                  actualStartDate: -1
                },
                $limit: 1
              }
            });
            if (data.length > 0) {
              prevProductionOrder = data[0];
            }
          }
        }
      }
      const { data } = await productionOrdersService.find({
        query: {
          machineId,
          isActive: true,
          $sort: {
            expectedStartDate: 1
          },
          $limit: 1
        }
      });
      if (data.length > 0) {
        activeProductionOrder = data[0];
      }
      lodash.set(context.result, "nextProductionOrder", nextProductionOrder);
      lodash.set(
        context.result,
        "dataValues.nextProductionOrder",
        nextProductionOrder
      );
      lodash.set(context.result, "nextProductionOrder", prevProductionOrder);
      lodash.set(
        context.result,
        "dataValues.prevProductionOrder",
        prevProductionOrder
      );
      lodash.set(
        context.result,
        "activeProductionOrder",
        activeProductionOrder
      );
      lodash.set(
        context.result,
        "dataValues.activeProductionOrder",
        activeProductionOrder
      );
    }
    return context;
  };
};
