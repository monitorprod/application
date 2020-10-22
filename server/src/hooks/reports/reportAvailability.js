const lodash = require("lodash");
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");
const {
  acumulateEvents,
  getPercentage,
  roundDecimal,
  getHistoryStats,
  getOEEStats,
  populateHistory,
  setHistoryDataValues,
} = require("../../utils/reports");
const { getActionType } = require("../../utils/events");

module.exports = function () {
  return async (context) => {
    const { app, method, data, type, params, result } = context;
    const level = lodash.get(params, "payload.company.level");
    const actionTypesService = app.service("production_order_action_types");
    const eventTypesService = app.service("production_order_event_types");
    const productionOrderHistoryService = app.service(
      "production_order_history"
    );
    if (
      (lodash.get(params, "$reportAvailability") ||
        lodash.get(params, "query.$reportAvailability")) &&
      method === "find"
    ) {
      params.$reportAvailability =
        lodash.get(params, "$reportAvailability") ||
        lodash.get(params, "query.$reportAvailability");
      lodash.unset(params, "query.$reportAvailability");
    }
    if (params.$reportAvailability && type === "after") {
      await getConfigs({ app });
      const closedActionType = getActionType({ app, type: "closed" });
      const undefinedActionType = getActionType({ app, type: "undefined" });
      const machines = result.data || result;
      const machineIds = [
        ...lodash.map(machines, (m) => m.id),
        ...lodash.map(machines, (m) => `${m.id}`),
      ];
      const machinesMap = lodash.keyBy(machines, "id");
      let { data: actionTypes } = await actionTypesService.find({
        query: {
          id: {
            // $nin: [closedActionType, undefinedActionType],
            $nin: [undefinedActionType],
          },
          $sort: { id: 1 },
        },
      });
      let { data: eventTypes } = await eventTypesService.find({
        query: {
          // productionOrderActionTypeId: {
          //   $ne: closedActionType,
          // },
          companyId: data.companyId,
          $sort: { productionOrderActionTypeId: 1 },
        },
      });
      const { data: noOPEventType } = await eventTypesService.find({
        query: {
          name: "FALTA OP",
          companyId: data.companyId,
          $populateAll: true,
        },
      });
      const noOPEventTypeId = lodash.get(noOPEventType, "0.id");
      const noOPActionTypeId = lodash.get(
        noOPEventType,
        "0.productionOrderActionTypeId"
      );
      const startD = moment(params.$reportAvailability.sd);
      const endD = moment(params.$reportAvailability.ed);
      const { data: summaries } = await productionOrderHistoryService.find({
        query: {
          mi: { $in: machineIds },
          $or: [{ ed: { $gte: startD.toDate() } }, { ed: -1 }],
          sd: { $lte: endD.toDate() },
          $sort: { poi: 1 },
          // $populateAll: true
        },
      });
      const {
        productionOrdersMap,
        moldsMap,
        productsMap,
        eventsReadingsMap,
        productionWasteMap,
      } = await populateHistory({
        app,
        summaries,
        startD,
        endD,
        withMolds: true,
      });
      const eventsMap = {
        productionOrders: {},
      };
      lodash.forEach(summaries, (history) => {
        setHistoryDataValues({
          history,
          productionOrdersMap,
          machinesMap,
          moldsMap,
          productsMap,
        });
        eventsMap.productionOrders[history.poi] = {
          poi: history.productionOrder,
        };
        lodash.map(history.ev, (event) =>
          acumulateEvents({
            startD,
            endD,
            eventsMap: eventsMap.productionOrders[history.poi],
            event,
          })
        );
        const historyStats = getHistoryStats({
          app,
          startD,
          endD,
          history,
          eventsMap: eventsMap.productionOrders[history.poi],
          eventsReadings: eventsReadingsMap[history.poi],
          productionWaste: productionWasteMap[history.poi],
          level,
        });
        eventsMap.productionOrders[history.poi] = {
          ...eventsMap.productionOrders[history.poi],
          ...historyStats,
        };
      });
      const totalSelectedDuration =
        (endD.diff(startD, "minutes") + 1) * machines.length;
      getOEEStats({ totalSelectedDuration, eventsMap });
      lodash.forEach(eventsMap.productionOrders, (productionOrder) => {
        productionOrder.availability = roundDecimal({
          value: getPercentage({ value: productionOrder.availability }),
        });
        productionOrder.quality = roundDecimal({
          value: getPercentage({ value: productionOrder.quality }),
        });
        productionOrder.performance = roundDecimal({
          value: getPercentage({ value: productionOrder.performance }),
        });
        productionOrder.oee = roundDecimal({
          value: getPercentage({ value: productionOrder.oee }),
        });
        // productionOrder.producedWeight = roundDecimal({
        //   value: productionOrder.producedWeight
        // });
        productionOrder.producedWeightInEvents = roundDecimal({
          value: productionOrder.producedWeightInEvents,
        });
        productionOrder.confirmedWeightInEvents = roundDecimal({
          value: productionOrder.confirmedWeightInEvents,
        });
        productionOrder.wastedWeightInEvents = roundDecimal({
          value: productionOrder.wastedWeightInEvents,
        });
        productionOrder.totalDurationInRange = roundDecimal({
          value: productionOrder.totalDurationInRange / 60,
        });
        lodash.forEach(productionOrder.actions, (at, key) => {
          productionOrder.actions[`value${key}`] = roundDecimal({
            value: at / 60,
          });
        });
        productionOrder.oIdealCycle = productionOrder.idealCycle;
        productionOrder.idealCycle = roundDecimal({
          value: productionOrder.idealCycle,
        });
        productionOrder.oRealCycleInEvents = productionOrder.realCycleInEvents;
        productionOrder.realCycleInEvents = roundDecimal({
          value: productionOrder.realCycleInEvents,
        });
        lodash.forEach(productionOrder.events, (ev, key) => {
          productionOrder.events[`value${key}`] = roundDecimal({
            value: ev / 60,
          });
        });
      });
      // console.log("!!!reportAvailability", eventsMap);
      context.result.data = lodash.map(eventsMap.productionOrders, (op) => op);
      let columns = [
        { text: "Ordem", path: "poi.id", alt: "ND" },
        { text: "Máquina", path: "poi.machine.identity" },
        { text: "Máquina Desc", path: "poi.machine.name" },
        { text: "Molde", path: "poi.mold.identity", alt: "ND" },
        { text: "Molde Desc", path: "poi.mold.name", alt: "ND" },
      ];
      if (level === "N1") {
        columns = columns.concat([
          { text: "Produto", path: "poi.product.identity", alt: "ND" },
          { text: "Produto Desc", path: "poi.product.name", alt: "ND" },
        ]);
      }
      columns = columns.concat([
        {
          text: "Data Ini",
          path: "poi.actualStartDate",
          type: "datetime",
          alt: "ND",
        },
        {
          text: "Data Fim",
          path: "poi.actualEndDate",
          type: "datetime",
          alt: "ND",
        },
      ]);
      if (level === "N1") {
        columns = columns.concat([
          {
            text: "Q Program",
            path: "poi.expectedProduction",
            type: "integer",
            alt: "ND",
            add: true,
          },
          {
            text: "Q Produz",
            path: "totalProductionInEvents",
            type: "integer",
            alt: "ND",
            add: true,
          },
          {
            text: "Q Confirm",
            path: "confirmedProductionInEvents",
            type: "integer",
            alt: "ND",
            add: true,
          },
          {
            text: "Q Refugo",
            path: "wastedProductionInEvents",
            type: "integer",
            alt: "ND",
            add: true,
          },
          {
            text: "P Produz (KG)",
            path: "producedWeightInEvents",
            type: "decimal",
            alt: "ND",
            add: true,
          },
          {
            text: "P Confirm (KG)",
            path: "confirmedWeightInEvents",
            type: "decimal",
            alt: "ND",
            add: true,
          },
          {
            text: "P Refugo (KG)",
            path: "wastedWeightInEvents",
            type: "decimal",
            alt: "ND",
            add: true,
          },
        ]);
      }
      columns = columns.concat([
        {
          text: "Ciclo Ideal",
          path: "idealCycle",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        {
          text: "Ciclo Real",
          path: "realCycleInEvents",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        {
          text: "Ciclos",
          path: "readingsInEvents",
          type: "integer",
          alt: "ND",
          add: true,
        },
        {
          text: "Horas",
          path: "totalDurationInRange",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        {
          text: "Disponibilidade (%)",
          path: "availability",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        {
          text: "Qualidade (%)",
          path: "quality",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        {
          text: "Performance (%)",
          path: "performance",
          type: "decimal",
          alt: "ND",
          add: true,
        },
        { text: "OEE (%)", path: "oee", type: "decimal", alt: "ND", add: true },
      ]);
      context.result.header = columns;
      if (params.$reportAvailability.eventsBy === "at") {
        lodash.forEach(actionTypes, ({ id, name }) => {
          context.result.header.push({
            text: name,
            path: `actions.value${id}`,
            type: "decimal",
            alt: "0,00",
            add: true,
          });
        });
      } else {
        lodash.forEach(eventTypes, ({ id, name }) => {
          context.result.header.push({
            text: name,
            path: `events.value${id}`,
            type: "decimal",
            alt: "0,00",
            add: true,
          });
        });
      }
      context.result.groupBy = lodash.groupBy(
        context.result.data,
        "poi.machineId"
      );
      lodash.forEach(machines, (machine) => {
        const selectedDuration = endD.diff(startD, "minutes") + 1;
        if (!context.result.groupBy[machine.id]) {
          context.result.data.push({
            poi: { machineId: machine.id, machine },
            actions: {
              [noOPActionTypeId]: selectedDuration,
              [`value${noOPActionTypeId}`]: selectedDuration / 60,
            },
            events: {
              [noOPEventTypeId]: selectedDuration,
              [`value${noOPEventTypeId}`]: selectedDuration / 60,
            },
            totalDurationInRange: selectedDuration / 60,
            availability: 0,
            quality: 0,
            performance: 0,
            oee: 0,
          });
        } else {
          const totalDurationInRange = roundDecimal({
            value: lodash.sumBy(
              context.result.groupBy[machine.id],
              "totalDurationInRange"
            ),
          });
          const diffDuration =
            (selectedDuration / 60 - totalDurationInRange) * 60;
          if (diffDuration > 15) {
            context.result.data.push({
              poi: { machineId: machine.id, machine },
              actions: {
                [noOPActionTypeId]: diffDuration,
                [`value${noOPActionTypeId}`]: diffDuration / 60,
              },
              events: {
                [noOPEventTypeId]: diffDuration,
                [`value${noOPEventTypeId}`]: diffDuration / 60,
              },
              totalDurationInRange: diffDuration / 60,
              availability: 0,
              quality: 0,
              performance: 0,
              oee: 0,
            });
          }
        }
      });
      context.result.groupBy = lodash.groupBy(
        context.result.data,
        "poi.machineId"
      );
      context.result.groupBy = lodash.sortBy(
        lodash.map(context.result.groupBy, (groups) => {
          const groupTotal = {
            poi: {
              machine: lodash.get(groups, "0.poi.machine"),
              expectedProduction: lodash.sumBy(
                groups,
                "poi.expectedProduction"
              ),
            },
            // totalProduction: lodash.sumBy(groups, "totalProduction"),
            totalProductionInEvents: lodash.sumBy(
              groups,
              "totalProductionInEvents"
            ),
            // confirmedProduction: lodash.sumBy(groups, "confirmedProduction"),
            confirmedProductionInEvents: lodash.sumBy(
              groups,
              "confirmedProductionInEvents"
            ),
            // wastedProduction: lodash.sumBy(groups, "wastedProduction"),
            wastedProductionInEvents: lodash.sumBy(
              groups,
              "wastedProductionInEvents"
            ),
            // producedWeight: roundDecimal({ value: lodash.sumBy(groups, "producedWeight") }),
            producedWeightInEvents: roundDecimal({
              value: lodash.sumBy(groups, "producedWeightInEvents"),
            }),
            confirmedWeightInEvents: roundDecimal({
              value: lodash.sumBy(groups, "confirmedWeightInEvents"),
            }),
            readingsInEvents: roundDecimal({
              value: lodash.sumBy(groups, "readingsInEvents"),
            }),
            wastedWeightInEvents: roundDecimal({
              value: lodash.sumBy(groups, "wastedWeightInEvents"),
            }),
            totalPlannedTime: lodash.sumBy(groups, "plannedTime") || 1,
            totalDurationInRange: roundDecimal({
              value: lodash.sumBy(groups, "totalDurationInRange"),
            }),
            actions: {},
            events: {},
          };
          lodash.forEach(
            [
              { map: "actions", src: actionTypes },
              { map: "events", src: eventTypes },
            ],
            ({ map, src }) => {
              lodash.forEach(src, ({ id }) => {
                groupTotal[map][id] = lodash.sumBy(groups, `${map}.${id}`) || 0;
                groupTotal[map][`value${id}`] = roundDecimal({
                  value: groupTotal[map][id] / 60,
                });
              });
              groupTotal[map][-1] = lodash.sumBy(groups, `${map}.${-1}`) || 0;
              groupTotal[map][`value${-1}`] = roundDecimal({
                value: groupTotal[map][-1] / 60,
              });
            }
          );
          lodash.forEach(
            [
              "availability",
              "quality",
              "idealCycle",
              "oIdealCycle",
              "realCycleInEvents",
              "oRealCycleInEvents",
              "performance",
            ],
            (kpi) => {
              groupTotal[kpi] =
                lodash.reduce(
                  groups,
                  (sum, productionOrder) =>
                    sum +
                    (productionOrder[kpi] || 0) *
                      (productionOrder.plannedTime || 0),
                  0
                ) / groupTotal.totalPlannedTime;
            }
          );
          groupTotal.performance =
            (groupTotal.oIdealCycle || 0) /
            (groupTotal.oRealCycleInEvents || groupTotal.oIdealCycle || 1);
          groupTotal.performance = roundDecimal({
            value: getPercentage({ value: groupTotal.performance }),
          });
          groupTotal.oee =
            (groupTotal.availability *
              groupTotal.quality *
              groupTotal.performance) /
            100 /
            100;
          lodash.forEach(
            [
              "availability",
              "quality",
              "idealCycle",
              "realCycleInEvents",
              "performance",
              "oee",
            ],
            (kpi) => {
              groupTotal[kpi] = roundDecimal({
                value: groupTotal[kpi],
              });
            }
          );
          const groupRow = {
            machine: lodash.get(groups, "0.poi.machine"),
            groupData: groups,
            groupTotal,
          };
          // console.log("!!!groupRow", groupRow.machine.id, groupRow);
          if (params.$reportAvailability.groupBy === "mipoi") {
            groupRow.colspan = level === "N1" ? 9 : 7;
          }
          return groupRow;
        }),
        "machine.identity"
      );
      context.result.data = lodash.sortBy(
        context.result.data,
        "machine.identity"
      );
      if (params.$reportAvailability.groupBy === "mi") {
        context.result.header.splice(3, 6);
        context.result.header.splice(0, 1);
      }
      context.result.header.push({
        text: "SISTEMA SEM COMUNICAÇÃO",
        path: `events.value${-1}`,
        type: "decimal",
        alt: "0,00",
        add: true,
      });
    }
    return context;
  };
};
