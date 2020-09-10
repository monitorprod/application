const PDFPrinter = require("./pdfmake");
var path = require("path");
const co = require("co");
const generate = require("./node-chartist");
const lodash = require("lodash");
const moment = require("moment");
const formatNumber = require("format-number");
const getConfigs = require("../../utils/getConfigs");
const toArray = require("../../utils/toArray");
const {
  acumulateEvents,
  getPercentage,
  roundDecimal,
  getHistoryStats,
  getOEEStats,
  populateHistory,
  setHistoryDataValues,
} = require("../../utils/reports");
const { getActionType, getColor } = require("../../utils/events");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "/fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "/fonts/Roboto-Medium.ttf"),
    italics: path.join(__dirname, "/fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "/fonts/Roboto-MediumItalic.ttf"),
  },
};
const NUMBER_FORMAT = formatNumber({
  integerSeparator: ".",
  decimal: ",",
});

const createPDF = async ({ app, startD, endD, company, stream }) => {
  const level = lodash.get(company, "level");
  const machinesService = app.service("machines");
  const eventTypesService = app.service("production_order_event_types");
  const actionTypesService = app.service("production_order_action_types");
  const productionOrderHistoryService = app.service("production_order_history");
  const closedActionType = getActionType({ app, type: "closed" });
  const undefinedActionType = getActionType({ app, type: "undefined" });
  let PDFDefinition;
  try {
    await getConfigs({ app });
    const { data: machines } = await machinesService.find({
      query: {
        companyId: company.id,
        machineStatusId: lodash.get(
          app.get("config.machine.status.active"),
          "value"
        ),
        // $populateAll: true
      },
    });
    const machineIds = [
      ...lodash.map(machines, (m) => m.id),
      ...lodash.map(machines, (m) => `${m.id}`),
    ];
    const machinesMap = lodash.keyBy(machines, "id");
    let { data: actionTypes } = await actionTypesService.find({
      query: {
        id: {
          $nin: [closedActionType, undefinedActionType],
        },
        $sort: { id: 1 },
      },
    });
    const { data: noOPEventType } = await eventTypesService.find({
      query: {
        name: "FALTA OP",
        companyId: company.id,
        $populateAll: true,
      },
    });
    const noOPEventTypeId = lodash.get(noOPEventType, "0.id");
    const noOPActionTypeId = lodash.get(
      noOPEventType,
      "0.productionOrderActionTypeId"
    );
    // console.log("!!!createPDF", startD.toDate(), endD.toDate())
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
      plantsMap,
      moldsMap,
      productsMap,
      eventsReadingsMap,
      productionWasteMap,
    } = await populateHistory({
      app,
      summaries,
      startD,
      endD,
      machinesMap,
      withMolds: true,
      withPlants: true,
    });
    const eventsMap = {
      productionOrders: {},
    };
    lodash.forEach(summaries, (history) => {
      setHistoryDataValues({
        history,
        productionOrdersMap,
        plantsMap,
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
        productionOrder.actions[`percentage${key}`] = roundDecimal({
          value: getPercentage({
            value: at / (productionOrder.totalDurationInRange * 60 || at || 1),
          }),
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
      productionOrder.groupTotal = {
        // totalProductionInRange: productionOrder.totalProductionInRange,
        totalProductionInEvents: productionOrder.totalProductionInEvents,
        // totalProduction: productionOrder.totalProduction,
        // confirmedProduction: productionOrder.confirmedProduction,
        confirmedProductionInEvents:
          productionOrder.confirmedProductionInEvents,
        // wastedProduction: productionOrder.wastedProduction,
        wastedProductionInEvents: productionOrder.wastedProductionInEvents,
        // producedWeight: productionOrder.producedWeight,
        // producedWeightInRange: productionOrder.producedWeightInRange,
        idealCycle: productionOrder.idealCycle,
        realCycleInEvents: productionOrder.realCycleInEvents,
        producedWeightInEvents: productionOrder.producedWeightInEvents,
        confirmedWeightInEvents: productionOrder.confirmedWeightInEvents,
        wastedWeightInEvents: productionOrder.wastedWeightInEvents,
        totalPlannedTime: productionOrder.plannedTime || 0,
        totalDurationInRange: productionOrder.totalDurationInRange,
        actions: productionOrder.actions,
      };
    });
    let mapResult = lodash.map(eventsMap.productionOrders, (op) => op);
    let groupBy = lodash.groupBy(mapResult, "poi.machineId");
    lodash.forEach(machines, (machine) => {
      const selectedDuration = endD.diff(startD, "minutes") + 1;
      if (!groupBy[machine.id]) {
        mapResult.push({
          poi: {
            machineId: machine.id,
            plantId: machine.plantId,
            machine,
          },
          actions: {
            [noOPActionTypeId]: selectedDuration,
            [`value${noOPActionTypeId}`]: selectedDuration / 60,
            [`percentage${noOPActionTypeId}`]: 100,
          },
          events: { [noOPEventTypeId]: selectedDuration },
          groupTotal: {
            totalDurationInRange: selectedDuration / 60,
            actions: {
              [noOPActionTypeId]: selectedDuration,
              [`value${noOPActionTypeId}`]: selectedDuration / 60,
              [`percentage${noOPActionTypeId}`]: 100,
            },
          },
          availability: 0,
          quality: 0,
          performance: 0,
          oee: 0,
        });
      } else {
        const totalDurationInRange = roundDecimal({
          value: lodash.sumBy(groupBy[machine.id], "totalDurationInRange"),
        });
        const diffDuration =
          (selectedDuration / 60 - totalDurationInRange) * 60;
        if (diffDuration > 15) {
          mapResult.push({
            poi: {
              machineId: machine.id,
              plantId: machine.plantId,
              machine,
            },
            actions: {
              [noOPActionTypeId]: diffDuration,
              [`value${noOPActionTypeId}`]: diffDuration / 60,
              [`percentage${noOPActionTypeId}`]: 100,
            },
            events: { [noOPEventTypeId]: diffDuration },
            groupTotal: {
              totalDurationInRange: diffDuration / 60,
              actions: {
                [noOPActionTypeId]: diffDuration,
                [`value${noOPActionTypeId}`]: diffDuration / 60,
                [`percentage${noOPActionTypeId}`]: 100,
              },
            },
            availability: 0,
            quality: 0,
            performance: 0,
            oee: 0,
          });
        }
      }
    });
    groupBy = lodash.groupBy(mapResult, "poi.machineId");
    groupBy = lodash.sortBy(
      lodash.map(groupBy, (groups) => {
        let groupData = lodash.sortBy(groups, "id");
        const groupTotal = {
          // totalProductionInRange: lodash.sumBy(groupData, "groupTotal.totalProductionInRange"),
          // totalProduction: lodash.sumBy(groupData, "groupTotal.totalProduction"),
          totalProductionInEvents: lodash.sumBy(
            groupData,
            "groupTotal.totalProductionInEvents"
          ),
          // confirmedProduction: lodash.sumBy(groupData, "groupTotal.confirmedProduction"),
          confirmedProductionInEvents: lodash.sumBy(
            groupData,
            "groupTotal.confirmedProductionInEvents"
          ),
          // wastedProduction: lodash.sumBy(groupData, "groupTotal.wastedProduction"),
          wastedProductionInEvents: lodash.sumBy(
            groupData,
            "groupTotal.wastedProductionInEvents"
          ),
          // producedWeight: roundDecimal({
          //   value: lodash.sumBy(groupData, "groupTotal.producedWeight")
          // }),
          // producedWeightInRange: roundDecimal({
          //   value: lodash.sumBy(groupData, "groupTotal.producedWeightInRange")
          // }),
          producedWeightInEvents: roundDecimal({
            value: lodash.sumBy(groupData, "groupTotal.producedWeightInEvents"),
          }),
          confirmedWeightInEvents: roundDecimal({
            value: lodash.sumBy(
              groupData,
              "groupTotal.confirmedWeightInEvents"
            ),
          }),
          wastedWeightInEvents: roundDecimal({
            value: lodash.sumBy(groupData, "groupTotal.wastedWeightInEvents"),
          }),
          totalPlannedTime:
            lodash.sumBy(groupData, "groupTotal.totalPlannedTime") || 0,
          totalDurationInRange: roundDecimal({
            value: lodash.sumBy(groupData, "groupTotal.totalDurationInRange"),
          }),
          actions: {},
        };
        lodash.forEach(actionTypes, ({ id }) => {
          groupTotal.actions[id] =
            lodash.sumBy(groupData, `groupTotal.actions.${id}`) || 0;
          groupTotal.actions[`value${id}`] = roundDecimal({
            value: groupTotal.actions[id] / 60,
          });
          groupTotal.actions[`percentage${id}`] = roundDecimal({
            value: getPercentage({
              value:
                groupTotal.actions[id] /
                (groupTotal.totalDurationInRange * 60 || 1),
            }),
          });
        });
        groupTotal.actions[-1] =
          lodash.sumBy(groupData, `groupTotal.actions.${-1}`) || 0;
        groupTotal.actions[`value${-1}`] = roundDecimal({
          value: groupTotal.actions[-1] / 60,
        });
        groupTotal.actions[`percentage${-1}`] = roundDecimal({
          value: getPercentage({
            value:
              groupTotal.actions[-1] /
              (groupTotal.totalDurationInRange * 60 || 1),
          }),
        });
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
                groupData,
                (sum, productionOrder) =>
                  sum +
                  (productionOrder[kpi] || 0) *
                    (productionOrder.plannedTime || 0),
                0
              ) / (groupTotal.totalPlannedTime || 1);
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
        // console.log("!!!groupBy Machine", groupTotal, groupData);
        const machine = lodash.get(groupData, "0.poi.machine");
        return {
          machine,
          plant: plantsMap[lodash.get(machine, "plantId")],
          groupData,
          groupTotal,
        };
      }),
      "machine.identity"
    );
    groupBy = lodash.groupBy(groupBy, "machine.plantId");
    groupBy = lodash.sortBy(
      lodash.map(groupBy, (groups) => {
        const groupTotal = {
          totalProductionInEvents: lodash.sumBy(
            groups,
            "groupTotal.totalProductionInEvents"
          ),
          // totalProductionInRange: lodash.sumBy(groups, "groupTotal.totalProductionInRange"),
          // totalProduction: lodash.sumBy(groups, "groupTotal.totalProduction"),
          confirmedProductionInEvents: lodash.sumBy(
            groups,
            "groupTotal.confirmedProductionInEvents"
          ),
          // confirmedProduction: lodash.sumBy(groups, "groupTotal.confirmedProduction"),
          wastedProductionInEvents: lodash.sumBy(
            groups,
            "groupTotal.wastedProductionInEvents"
          ),
          // wastedProduction: lodash.sumBy(groups, "groupTotal.wastedProduction"),
          // producedWeight: roundDecimal({
          //   value: lodash.sumBy(groups, "groupTotal.producedWeight")
          // }),
          // producedWeightInRange: roundDecimal({
          //   value: lodash.sumBy(groups, "groupTotal.producedWeightInRange")
          // }),
          producedWeightInEvents: roundDecimal({
            value: lodash.sumBy(groups, "groupTotal.producedWeightInEvents"),
          }),
          confirmedWeightInEvents: roundDecimal({
            value: lodash.sumBy(groups, "groupTotal.confirmedWeightInEvents"),
          }),
          wastedWeightInEvents: roundDecimal({
            value: lodash.sumBy(groups, "groupTotal.wastedWeightInEvents"),
          }),
          totalPlannedTime:
            lodash.sumBy(groups, "groupTotal.totalPlannedTime") || 0,
          totalDurationInRange: roundDecimal({
            value: lodash.sumBy(groups, "groupTotal.totalDurationInRange"),
          }),
          actions: {},
        };
        lodash.forEach(actionTypes, ({ id }) => {
          groupTotal.actions[id] =
            lodash.sumBy(groups, `groupTotal.actions.${id}`) || 0;
          groupTotal.actions[`value${id}`] = roundDecimal({
            value: groupTotal.actions[id] / 60,
          });
          groupTotal.actions[`percentage${id}`] = roundDecimal({
            value: getPercentage({
              value:
                groupTotal.actions[id] /
                (groupTotal.totalDurationInRange * 60 || 1),
            }),
          });
        });
        groupTotal.actions[-1] =
          lodash.sumBy(groups, `groupTotal.actions.${-1}`) || 0;
        groupTotal.actions[`value${-1}`] = roundDecimal({
          value: groupTotal.actions[-1] / 60,
        });
        groupTotal.actions[`percentage${-1}`] = roundDecimal({
          value: getPercentage({
            value:
              groupTotal.actions[-1] /
              (groupTotal.totalDurationInRange * 60 || 1),
          }),
        });
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
                (sum, machine) =>
                  sum +
                  lodash.reduce(
                    machine.groupData,
                    (sum, productionOrder) =>
                      sum +
                      (productionOrder[kpi] || 0) *
                        (productionOrder.plannedTime || 0),
                    0
                  ),
                0
              ) / (groupTotal.totalPlannedTime || 1);
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
        // console.log("!!!groupBy Plant", groupTotal, groups);
        return {
          plant: lodash.get(groups, "0.plant"),
          groupData: groups,
          groupTotal,
        };
      }),
      "plant.name"
    );

    const PRODUCT_COLUMNS = [
      {
        label: "",
      },
      {
        label: "",
      },
      ...(level === "N1"
        ? [
            {
              text: "Q PRODUZ",
              // path: "groupTotal.totalProductionInRange",
              path: "groupTotal.totalProductionInEvents",
              type: "integer",
              alt: "ND",
            },
            {
              text: "Q CONFIRM",
              path: "groupTotal.confirmedProductionInEvents",
              type: "integer",
              alt: "ND",
            },
            {
              text: "Q REFUGO",
              path: "groupTotal.wastedProductionInEvents",
              type: "integer",
              alt: "ND",
            },
            {
              text: "P PROD (KG)",
              // path: "groupTotal.producedWeightInRange",
              path: "groupTotal.producedWeightInEvents",
              type: "decimal",
              alt: "ND",
            },
            {
              text: "P CONF (KG)",
              path: "groupTotal.confirmedWeightInEvents",
              type: "decimal",
              alt: "ND",
            },
            {
              text: "P REF (KG)",
              path: "groupTotal.wastedWeightInEvents",
              type: "decimal",
              alt: "ND",
            },
          ]
        : []),
      {
        text: "CICLO IDEAL",
        path: "idealCycle",
        type: "decimal",
        alt: "ND",
      },
      {
        text: "CICLO REAL",
        path: "realCycleInEvents",
        type: "decimal",
        alt: "ND",
      },
      {
        label: "",
      },
      {
        label: "",
      },
      ...(level === "N1"
        ? []
        : [
            {
              label: "",
            },
            {
              label: "",
            },
            {
              label: "",
            },
            {
              label: "",
            },
            {
              label: "",
            },
            {
              label: "",
            },
          ]),
    ];
    let columns = [];
    columns.push({
      text: "MÁQUINA/OEE\n- DISP.\n- QUALID.\n- PERFORM.",
      path: [
        {
          path: [
            {
              path: "poi.machine.identity",
              sufix: " / ",
            },
            {
              path: "groupTotal.oee",
              type: "decimal",
              sufix: "%",
            },
          ],
        },
        {
          path: "groupTotal.availability",
          type: "decimal",
          prefix: "- ",
          sufix: "%",
        },
        {
          path: "groupTotal.quality",
          type: "decimal",
          prefix: "- ",
          sufix: "%",
        },
        {
          path: "groupTotal.performance",
          type: "decimal",
          prefix: "- ",
          sufix: "%",
        },
      ],
      alt: "ND",
    });
    columns.push({
      text: `- MOLDE${level === "N1" ? "\n- PRODUTO" : ""}\n- OP${
        level === "N1" ? "\nCAV/ABERTAS/PESO (G)" : ""
      }`,
      path: [
        {
          prefix: "- ",
          path: "poi.mold.identity",
        },
        ...(level === "N1"
          ? [
              {
                prefix: "- ",
                path: "poi.product.name",
              },
            ]
          : []),
        {
          prefix: "- ",
          path: "poi.id",
        },
        ...(level === "N1"
          ? [
              {
                path: [
                  {
                    path: "poi.mold.cavities",
                    type: "integer",
                    sufix: " / ",
                  },
                  {
                    path: "poi.openCavities",
                    type: "integer",
                    sufix: " / ",
                  },
                  {
                    path: "poi.product.weight",
                    type: "decimal",
                  },
                ],
              },
            ]
          : []),
      ],
      alt: "ND",
    });
    lodash.forEach(actionTypes, ({ id, name }) => {
      columns.push({
        text: name,
        actionTypeId: id,
        path: [
          {
            path: `groupTotal.actions.percentage${id}`,
            type: "decimal",
            sufix: "%",
          },
          {
            path: `groupTotal.actions.value${id}`,
            type: "decimal",
            sufix: " h",
          },
        ],
        alt: "0",
      });
    });
    columns.push({
      text: "SIST. SEM COMUNIC.",
      actionTypeId: -1,
      path: [
        {
          path: `groupTotal.actions.percentage${-1}`,
          type: "decimal",
          sufix: "%",
        },
        {
          path: `groupTotal.actions.value${-1}`,
          type: "decimal",
          sufix: " h",
        },
      ],
      alt: "0",
    });
    columns.push({
      text: "TOTAL",
      actionTypeId: "total",
      path: [
        ,
        {
          label: 100,
          type: "decimal",
          sufix: "%",
        },
        {
          path: `groupTotal.totalDurationInRange`,
          type: "decimal",
          sufix: " h",
        },
      ],
      alt: "0",
    });
    const pageBreakBeforeFlag = {};
    PDFDefinition = {
      info: {
        title: `Relatório de Produção ${moment(startD)
          .subtract(3, "hours")
          .format("YYYY-MMM-DD")} ${moment(endD)
          .subtract(3, "hours")
          .format("YYYY-MMM-DD")}`,
        author: "MonitorProd",
        subject: company.fantasyName,
      },
      pageSize: "LETTER",
      pageOrientation: "landscape",
      pageMargins: [10, 50, 10, 30],
      header: {
        columns: [
          {
            width: 60,
            image: path.join(__dirname, "/logo-dark.jpeg"),
            style: "pageNote",
            margin: [10, 10, 10, 10],
          },
          {
            text: `Relatório de Produção - ${company.fantasyName}`,
            alignment: "left",
            style: "pageNote",
            margin: [20, 25, 10, 10],
          },
          {
            text: `Período: ${moment(startD)
              .subtract(3, "hours")
              .format("ddd, DD [de] MMM HH:mm")} até ${moment(endD)
              .subtract(3, "hours")
              .format("ddd, DD [de] MMM HH:mm")}`,
            alignment: "right",
            style: "pageNote",
            margin: [10, 25, 10, 10],
          },
        ],
      },
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            {
              text: `${moment().format("DD/MM/YYYY - HH:mm")}`,
              alignment: "left",
              style: "pageNote",
              margin: [10, 10, 10, 10],
            },
            "",
            {
              text: `${currentPage.toString() + " of " + pageCount}`,
              alignment: "right",
              style: "pageNote",
              margin: [10, 10, 10, 10],
            },
          ],
        };
      },
      content: [],
      styles: {
        pageNote: {
          fontSize: 10,
        },
        plantHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 0, 0, 0],
        },
        plantTable: {
          margin: [0, 0, 0, 0],
        },
      },
      pageBreakBefore: (currentNode, followingNodesOnPage) => {
        if (currentNode.id && pageBreakBeforeFlag[currentNode.id]) {
          delete pageBreakBeforeFlag[currentNode.id];
          return true;
        }
        if (currentNode.id && currentNode.pageNumbers.length > 1) {
          lodash.forEach(
            followingNodesOnPage,
            (node) => (pageBreakBeforeFlag[node.id] = true)
          );
          return true;
        }
        return false;
      },
      defaultStyle: {
        fontSize: 8,
      },
    };
    const columnsWidth = [80, 90];
    const calcWidth = (660 - 170) / (columns.length - 2);
    lodash.forEach(columns, () => columnsWidth.push(calcWidth));
    const undefinedActionTypeName = lodash.get(
      app.get(`actionType.${undefinedActionType}`),
      "name"
    );
    const undefinedActionTypeColor = getColor({
      data: app.get(`actionType.${undefinedActionType}`),
      path: "color",
    });
    const svgRegExp = new RegExp("<svg.*>.*</svg>");
    const getSVG = ({ value }) => lodash.get(svgRegExp.exec(value), "0");
    const getSVGPattern = ({ index, color }) => {
      const id = `-${index}-${color.substring(1)}`;
      const svgPatterns = [
        {
          id: `zigzag${id}`,
          pattern: `<pattern id="zigzag${id}" patternUnits="userSpaceOnUse" width="20" height="12"><path fill="${color}" d="M9.8 12L0 2.2V.8l10 10 10-10v1.4L10.2 12h-.4zm-4 0L0 6.2V4.8L7.2 12H5.8zm8.4 0L20 6.2V4.8L12.8 12h1.4zM9.8 0l.2.2.2-.2h-.4zm-4 0L10 4.2 14.2 0h-1.4L10 2.8 7.2 0H5.8z"/></pattern>`,
        },
        {
          id: `squarecircles${id}`,
          pattern: `<pattern id="squarecircles${id}" patternUnits="userSpaceOnUse" width="40" height="40"><path fill="${color}" d="M0,0 L20,0 L20,20 L0,20 L0,0 L0,0 Z M10,17 C13.8659932,17 17,13.8659932 17,10 C17,6.13400675 13.8659932,3 10,3 C6.13400675,3 3,6.13400675 3,10 C3,13.8659932 6.13400675,17 10,17 L10,17 Z M30,17 C33.8659932,17 37,13.8659932 37,10 C37,6.13400675 33.8659932,3 30,3 C26.1340068,3 23,6.13400675 23,10 C23,13.8659932 26.1340068,17 30,17 L30,17 Z M10,37 C13.8659932,37 17,33.8659932 17,30 C17,26.1340068 13.8659932,23 10,23 C6.13400675,23 3,26.1340068 3,30 C3,33.8659932 6.13400675,37 10,37 L10,37 Z M20,20 L40,20 L40,40 L20,40 L20,20 L20,20 Z M30,37 C33.8659932,37 37,33.8659932 37,30 C37,26.1340068 33.8659932,23 30,23 C26.1340068,23 23,26.1340068 23,30 C23,33.8659932 26.1340068,37 30,37 L30,37 Z"/></pattern>`,
        },
        {
          id: `aztec${id}`,
          pattern: `<pattern id="aztec${id}" patternUnits="userSpaceOnUse" width="32" height="64"><path fill="${color}" d="M0,28 L20,28 L20,16 L16,16 L16,24 L4,24 L4,4 L32,4 L32,32 L28,32 L28,8 L8,8 L8,20 L12,20 L12,12 L24,12 L24,32 L0,32 L0,28 Z M12,36 L32,36 L32,40 L16,40 L16,64 L0,64 L0,60 L12,60 L12,36 Z M28,48 L24,48 L24,60 L32,60 L32,64 L20,64 L20,44 L32,44 L32,56 L28,56 L28,48 Z M0,36 L8,36 L8,56 L0,56 L0,52 L4,52 L4,40 L0,40 L0,36 Z"/></pattern>`,
        },
        {
          id: `wall${id}`,
          pattern: `<pattern id="wall${id}" patternUnits="userSpaceOnUse" width="8" height="8"><path fill="${color}" d="M0 0h4v4H0V0zm4 4h4v4H4V4z"/></pattern>`,
        },
        {
          id: `wave${id}`,
          pattern: `<pattern id="wave${id}" patternUnits="userSpaceOnUse" width="100" height="18"><path fill="${color}" d="M61.82 18c3.47-1.45 6.86-3.78 11.3-7.34C78 6.76 80.34 5.1 83.87 3.42 88.56 1.16 93.75 0 100 0v6.16C98.76 6.05 97.43 6 96 6c-9.59 0-14.23 2.23-23.13 9.34-1.28 1.03-2.39 1.9-3.4 2.66h-7.65zm-23.64 0H22.52c-1-.76-2.1-1.63-3.4-2.66C11.57 9.3 7.08 6.78 0 6.16V0c6.25 0 11.44 1.16 16.14 3.42 3.53 1.7 5.87 3.35 10.73 7.24 4.45 3.56 7.84 5.9 11.31 7.34zM61.82 0h7.66a39.57 39.57 0 0 1-7.34 4.58C57.44 6.84 52.25 8 46 8S34.56 6.84 29.86 4.58A39.57 39.57 0 0 1 22.52 0h15.66C41.65 1.44 45.21 2 50 2c4.8 0 8.35-.56 11.82-2z"/></pattern>`,
        },
        {
          id: `diamond${id}`,
          pattern: `<pattern id="diamond${id}" patternUnits="userSpaceOnUse" width="16" height="32"><path fill="${color}" d="M0 24h4v2H0v-2zm0 4h6v2H0v-2zm0-8h2v2H0v-2zM0 0h4v2H0V0zm0 4h2v2H0V4zm16 20h-6v2h6v-2zm0 4H8v2h8v-2zm0-8h-4v2h4v-2zm0-20h-6v2h6V0zm0 4h-4v2h4V4zm-2 12h2v2h-2v-2zm0-8h2v2h-2V8zM2 8h10v2H2V8zm0 8h10v2H2v-2zm-2-4h14v2H0v-2zm4-8h6v2H4V4zm0 16h6v2H4v-2zM6 0h2v2H6V0zm0 24h2v2H6v-2z"/></pattern>`,
        },
        {
          id: `cell${id}`,
          pattern: `<pattern id="cell${id}" patternUnits="userSpaceOnUse" width="32" height="26"><path fill="${color}" d="M14,0 L14,3.99368918 C14,7.8631678 10.8581267,11 7,11 C3.13400675,11 0,7.86241913 0,3.99368918 L0,0 L2,0 L2,4.00474662 C2,6.76396204 4.23857625,9 7,9 C9.75580481,9 12,6.76354888 12,4.00474662 L12,0 L14,0 Z M14,26 L14,20.0063108 C14,16.1375809 10.8659932,13 7,13 C3.14187327,13 0,16.1368322 0,20.0063108 L0,26 L2,26 L2,19.9952534 C2,17.2364511 4.24419519,15 7,15 C9.76142375,15 12,17.236038 12,19.9952534 L12,26 L14,26 L14,26 Z M16,7.00631082 C16,3.1368322 19.1418733,0 23,0 C26.8659932,0 30,3.13758087 30,7.00631082 L30,16.9936892 C30,20.8631678 26.8581267,24 23,24 C19.1340068,24 16,20.8624191 16,16.9936892 L16,7.00631082 Z M18,6.99525338 C18,4.23645112 20.2441952,2 23,2 C25.7614237,2 28,4.23603796 28,6.99525338 L28,17.0047466 C28,19.7635489 25.7558048,22 23,22 C20.2385763,22 18,19.763962 18,17.0047466 L18,6.99525338 Z"/></pattern>`,
        },
        {
          id: `jupiter${id}`,
          pattern: `<pattern id="jupiter${id}" patternUnits="userSpaceOnUse" width="52" height="52"><path fill="${color}" d="M0 17.83V0h17.83a3 3 0 0 1-5.66 2H5.9A5 5 0 0 1 2 5.9v6.27a3 3 0 0 1-2 5.66zm0 18.34a3 3 0 0 1 2 5.66v6.27A5 5 0 0 1 5.9 52h6.27a3 3 0 0 1 5.66 0H0V36.17zM36.17 52a3 3 0 0 1 5.66 0h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 0 1 0-5.66V52H36.17zM0 31.93v-9.78a5 5 0 0 1 3.8.72l4.43-4.43a3 3 0 1 1 1.42 1.41L5.2 24.28a5 5 0 0 1 0 5.52l4.44 4.43a3 3 0 1 1-1.42 1.42L3.8 31.2a5 5 0 0 1-3.8.72zm52-14.1a3 3 0 0 1 0-5.66V5.9A5 5 0 0 1 48.1 2h-6.27a3 3 0 0 1-5.66-2H52v17.83zm0 14.1a4.97 4.97 0 0 1-1.72-.72l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1 0-5.52l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43c.53-.35 1.12-.6 1.72-.72v9.78zM22.15 0h9.78a5 5 0 0 1-.72 3.8l4.44 4.43a3 3 0 1 1-1.42 1.42L29.8 5.2a5 5 0 0 1-5.52 0l-4.43 4.44a3 3 0 1 1-1.41-1.42l4.43-4.43a5 5 0 0 1-.72-3.8zm0 52c.13-.6.37-1.19.72-1.72l-4.43-4.43a3 3 0 1 1 1.41-1.41l4.43 4.43a5 5 0 0 1 5.52 0l4.43-4.43a3 3 0 1 1 1.42 1.41l-4.44 4.43c.36.53.6 1.12.72 1.72h-9.78zm9.75-24a5 5 0 0 1-3.9 3.9v6.27a3 3 0 1 1-2 0V31.9a5 5 0 0 1-3.9-3.9h-6.27a3 3 0 1 1 0-2h6.27a5 5 0 0 1 3.9-3.9v-6.27a3 3 0 1 1 2 0v6.27a5 5 0 0 1 3.9 3.9h6.27a3 3 0 1 1 0 2H31.9z"/></pattern>`,
        },
        {
          id: `hexagons${id}`,
          pattern: `<pattern id="hexagons${id}" patternUnits="userSpaceOnUse" width="28" height="49"><path fill="${color}" d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"/></pattern>`,
        },
        {
          id: `polygon${id}`,
          pattern: `<pattern id="polygon${id}" patternUnits="userSpaceOnUse" width="20" height="20"><polygon fill="${color}" points="0 0 20 0 0 20"/></pattern>`,
        },
      ];
      return svgPatterns[index % 10];
    };
    const getColumnValue = ({
      data,
      label: gLabel,
      path: gPath,
      alt: gAlt,
      prefix: gPrefix,
      sufix: gSufix,
      type: gType,
    }) => {
      const dataArray = toArray({ value: data });
      const pathArray = toArray({ value: gPath, propName: "path" });
      let value = "";
      const getPathValue = ({ path: iPath, alt: iAlt, type: iType }) => {
        let value = "";
        const pathArray = toArray({ value: iPath, propName: "path" });
        lodash.forEach(
          pathArray,
          ({ label, path, alt, prefix, sufix, type }) => {
            let pathValue = label;
            if (lodash.isNil(pathValue)) {
              lodash.forEach(
                dataArray,
                (dataSrc) =>
                  (pathValue = !lodash.isNil(pathValue)
                    ? pathValue
                    : lodash.get(dataSrc, path))
              );
            }
            if (lodash.isNil(pathValue)) {
              pathValue = alt || iAlt || gAlt || "";
            }
            if (
              (type === "decimal" ||
                iType === "decimal" ||
                gType === "decimal") &&
              !isNaN(parseFloat(pathValue))
            ) {
              pathValue = NUMBER_FORMAT(parseFloat(pathValue).toFixed(2));
            }
            if (
              (type === "integer" ||
                iType === "integer" ||
                gType === "integer") &&
              !isNaN(parseInt(pathValue))
            ) {
              pathValue = NUMBER_FORMAT(parseInt(pathValue));
            }
            if (pathValue) {
              value += `${!lodash.isNil(prefix) ? prefix : ""}${pathValue}${
                !lodash.isNil(sufix) ? sufix : ""
              }`;
            }
          }
        );
        return value;
      };
      lodash.forEach(
        pathArray,
        ({ label, path, alt, prefix, sufix, type } = {}) => {
          let pathValue = label || gLabel || getPathValue({ path, alt, type });
          if (lodash.isNil(pathValue)) {
            pathValue = alt || gAlt || "";
          }
          // if ((type === "decimal" || gType === "decimal") && !isNaN(parseFloat(pathValue))) {
          //   pathValue = NUMBER_FORMAT(parseFloat(pathValue).toFixed(2));
          // }
          // if ((type === "integer" || gType === "integer") && !isNaN(parseInt(pathValue))) {
          //   pathValue = NUMBER_FORMAT(parseInt(pathValue));
          // }
          if (pathValue) {
            value += `${
              !lodash.isNil(prefix)
                ? prefix
                : !lodash.isNil(gPrefix)
                ? gPrefix
                : ""
            }${pathValue}${
              !lodash.isNil(sufix) ? sufix : !lodash.isNil(gSufix) ? gSufix : ""
            }\n`;
          }
        }
      );
      if (!value) {
        value = gLabel;
      }
      return value;
    };
    const svgPatternsMap = {};
    const actionTypesColorsLine = [];
    lodash.forEach(columns, ({ actionTypeId }, index) => {
      const column = {
        margin: [-5, -5, -5, -5],
        border: [false, false, false, false],
      };
      if (actionTypeId && typeof actionTypeId !== "string") {
        const color =
          getColor({
            data: app.get(`actionType.${actionTypeId}`),
            path: "color",
          }) || undefinedActionTypeColor;
        const svgPattern = getSVGPattern({
          index,
          color,
        });
        svgPatternsMap[actionTypeId] = svgPattern;
        column.svg = `<svg>${svgPattern.pattern}<rect width="${
          calcWidth + 30
        }" height="20" fill="url(#${
          svgPattern.id
        })" stroke="${color}" stroke-width="2" /></svg>`;
      } else {
        column.text = "";
      }
      actionTypesColorsLine.push(column);
    });
    const whiteSpace = [];
    lodash.forEach(columns, (column, columnIndex) => {
      whiteSpace.push({
        text: "",
        margin: [0, 0, -3, 0],
        border: [false, false, columnIndex !== columns.length - 1, true],
      });
    });
    await Promise.all(
      lodash.map(groupBy, async (plantData, plantIndex) => {
        // console.log("!!!plantData", plantData);
        const plantDefinition = [];
        const plantHeader = {
          text: `LOCAL: ${company.fantasyName} - ${lodash.get(
            plantData,
            "plant.name"
          )}`,
          style: "plantHeader",
        };
        if (plantIndex !== 0) {
          plantHeader.pageBreak = "before";
        }
        const plantSummary = [];
        const plantAvailability = lodash.get(
          plantData,
          "groupTotal.availability"
        );
        const plantQuality = lodash.get(plantData, "groupTotal.quality");
        const plantPerformance = lodash.get(
          plantData,
          "groupTotal.performance"
        );
        const plantOEE = lodash.get(plantData, "groupTotal.oee");
        // const plantProducedQuantity = lodash.get(plantData, "groupTotal.totalProductionInRange");
        // const plantProducedQuantity = lodash.get(plantData, "groupTotal.totalProductionInEvents");
        const plantProducedQuantity = lodash.get(
          plantData,
          "groupTotal.confirmedProductionInEvents"
        );
        // const plantProducedWeight = lodash.get(plantData, "groupTotal.producedWeightInRange");
        // const plantProducedWeight = lodash.get(plantData, "groupTotal.producedWeightInEvents");
        const plantProducedWeight = lodash.get(
          plantData,
          "groupTotal.confirmedWeightInEvents"
        );
        const plantActions = {};
        lodash.forEach(actionTypes, ({ id }) => {
          const value = parseFloat(
            lodash.get(plantData, `groupTotal.actions.value${id}`)
          );
          if (value > 0) {
            plantActions[id] = value;
          }
        });
        const undefinedTimeValue = parseFloat(
          lodash.get(plantData, `groupTotal.actions.value${-1}`)
        );
        if (undefinedTimeValue > 0) {
          plantActions[-1] = undefinedTimeValue;
        }
        const hasActionTypes = Object.keys(plantActions).length > 0;
        const totalDurationInRange = lodash.get(
          plantData,
          "groupTotal.totalDurationInRange"
        );
        const gaugeChart = await co(function* () {
          return yield generate(
            "pie",
            {
              width: 275,
              height: 200,
              chartPadding: 20,
              startAngle: 270,
              total: 200,
              showLabel: false,
              listeners: {
                draw: (context) => {
                  // console.log("!!!gauge context", context);
                  if (context.series) {
                    const nodes = Array.prototype.slice.call(
                      lodash.get(
                        context,
                        "element._node.parentElement.parentElement.children"
                      ) || []
                    );
                    const index = nodes.indexOf(
                      lodash.get(context, "element._node.parentElement")
                    );
                    const color =
                      lodash.get(context, "series.bgColor") ||
                      undefinedActionTypeColor;
                    const svgPattern = getSVGPattern({
                      index,
                      color,
                    });
                    context.element.attr({
                      style: `fill: url(#${svgPattern.id}); stroke: ${color}; stroke-width: 2;`,
                    });
                    const parentInnerHTML = lodash.get(
                      context,
                      "element._node.parentElement.innerHTML"
                    );
                    lodash.set(
                      context,
                      "element._node.parentElement.innerHTML",
                      `${svgPattern.pattern}${parentInnerHTML}`
                    );
                  }
                },
                created: (context) => {
                  const centerX =
                    (context.chartRect.x1 + context.chartRect.x2) / 2;
                  const centerY =
                    (context.chartRect.y1 + context.chartRect.y2) / 2;
                  const needleLength = 85;
                  const needleRadius = 5;
                  const percentToDegree = (p) => p * 360;
                  const degreeToRadian = (d) => (d * Math.PI) / 180;
                  const percentToRadian = (p) =>
                    degreeToRadian(percentToDegree(p));
                  const relativePercentage = parseFloat(plantOEE);
                  const thetaRad = percentToRadian(
                    (relativePercentage > 105 ? 105 : relativePercentage) /
                      100 /
                      2
                  );
                  const topX = centerX - needleLength * Math.cos(thetaRad);
                  const topY = centerY - needleLength * Math.sin(thetaRad);
                  const leftX =
                    centerX - needleRadius * Math.cos(thetaRad - Math.PI / 2);
                  const leftY =
                    centerY - needleRadius * Math.sin(thetaRad - Math.PI / 2);
                  const rightX =
                    centerX - needleRadius * Math.cos(thetaRad + Math.PI / 2);
                  const rightY =
                    centerY - needleRadius * Math.sin(thetaRad + Math.PI / 2);
                  context.svg.elem("circle", {
                    cx: centerX,
                    cy: centerY,
                    r: needleRadius,
                    style: "fill:#555555; stroke:#555555;",
                  });
                  context.svg.elem("path", {
                    d: `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`,
                    style: "fill:#555555; stroke:#555555;",
                  });
                  const text = context.svg.elem("text", {
                    x: topX,
                    y: topY - 5,
                    style: "font-size: 12px; fill:#555555;",
                  });
                  text._node.innerHTML = `${NUMBER_FORMAT(
                    parseFloat(plantOEE).toFixed(2)
                  )}%`;
                },
              },
            },
            {
              series: [
                { value: 50, offset: 50, bgColor: "#FDBFC3" },
                { value: 30, offset: 80, bgColor: "#FFFFBF" },
                { value: 20, offset: 100, bgColor: "#DEEEE3" },
              ],
            }
          );
        });
        // console.log("!!gaugeChart", gaugeChart);
        const pieCharData = {
          labelsNames: hasActionTypes
            ? lodash.map(
                plantActions,
                (at, key) =>
                  `${
                    lodash.get(app.get(`actionType.${key}`), `name`) ||
                    undefinedActionTypeName
                  }`
              )
            : [undefinedActionTypeName],
          series: hasActionTypes
            ? lodash.map(plantActions, (at, key) => ({
                actionTypeId: key,
                value: roundDecimal({
                  value: getPercentage({
                    value:
                      parseFloat(at) /
                      (totalDurationInRange || parseFloat(at) || 1),
                  }),
                }).toFixed(2),
                bgColor:
                  getColor({
                    data: app.get(`actionType.${key}`),
                    path: "color",
                  }) || undefinedActionTypeColor,
              }))
            : [
                {
                  value: 100,
                  bgColor: undefinedActionTypeColor,
                },
              ],
        };
        const pieChart = await co(function* () {
          return yield generate(
            "pie",
            {
              width: 275,
              height: 200,
              chartPadding: 20,
              labelOffset: 50,
              labelDirection: "explode",
              labelInterpolationFnc: (value) =>
                `${NUMBER_FORMAT(parseFloat(value).toFixed(2))}%`,
              listeners: {
                draw: (context) => {
                  // console.log("!!!pie context", context);
                  if (context.type === "label") {
                    const nodes = Array.prototype.slice.call(
                      lodash.get(
                        context,
                        "element._node.parentElement.children"
                      ) || []
                    );
                    const index = nodes.indexOf(
                      lodash.get(context, "element._node")
                    );
                    const color =
                      lodash.get(context, "series.bgColor") ||
                      lodash.get(pieCharData, `series.${index}.bgColor`) ||
                      undefinedActionTypeColor;
                    context.element.attr({
                      style: `font-size: 12px; fill: ${color};`,
                    });
                  } else if (context.series) {
                    const nodes = Array.prototype.slice.call(
                      lodash.get(
                        context,
                        "element._node.parentElement.parentElement.children"
                      ) || []
                    );
                    const index = nodes.indexOf(
                      lodash.get(context, "element._node.parentElement")
                    );
                    const color =
                      lodash.get(context, "series.bgColor") ||
                      lodash.get(pieCharData, `series.${index}.bgColor`) ||
                      undefinedActionTypeColor;
                    const svgPattern =
                      svgPatternsMap[
                        lodash.get(context, "series.actionTypeId") ||
                          lodash.get(
                            pieCharData,
                            `series.${index}.actionTypeId`
                          )
                      ];
                    context.element.attr({
                      style: `font-size: 12px; fill: url(#${svgPattern.id}); stroke: ${color}; stroke-width: 2;`,
                    });
                    const parentInnerHTML = lodash.get(
                      context,
                      "element._node.parentElement.innerHTML"
                    );
                    lodash.set(
                      context,
                      "element._node.parentElement.innerHTML",
                      `${svgPattern.pattern}${parentInnerHTML}`
                    );
                  }
                },
              },
            },
            pieCharData
          );
        });
        // console.log("!!pieChart", pieChart);
        plantSummary.push([
          {
            text: `DISPONIBILIDADE: ${
              !lodash.isNil(plantAvailability)
                ? `${NUMBER_FORMAT(plantAvailability.toFixed(2))}%`
                : "ND"
            }\nQUALIDADE: ${
              !lodash.isNil(plantQuality)
                ? `${NUMBER_FORMAT(plantQuality.toFixed(2))}%`
                : "ND"
            }\nPERFORMANCE: ${
              !lodash.isNil(plantPerformance)
                ? `${NUMBER_FORMAT(plantPerformance.toFixed(2))}%`
                : "ND"
            }\nOEE: ${
              plantOEE ? `${NUMBER_FORMAT(plantOEE.toFixed(2))}%` : "ND"
            }\n${
              level === "N1"
                ? `Q CONFIRMADA: ${
                    !lodash.isNil(plantProducedQuantity)
                      ? `${NUMBER_FORMAT(plantProducedQuantity)}`
                      : "ND"
                  }\nP CONFIRMADO (KG): ${
                    !lodash.isNil(plantProducedWeight)
                      ? `${NUMBER_FORMAT(plantProducedWeight.toFixed(2))}`
                      : "ND"
                  }\n`
                : ""
            }`,
            fontSize: 12,
            margin: [0, 20, 0, 0],
            border: [false, false, false, false],
          },
          {
            svg: getSVG({ value: gaugeChart }),
            alignment: "center",
            margin: [-5, -5, -5, -5],
            border: [false, false, false, false],
          },
          {
            svg: getSVG({ value: pieChart }),
            alignment: "center",
            margin: [-5, -5, -5, -5],
            border: [false, false, false, false],
          },
        ]);
        const plantTable = [];
        // plantTable.push(actionTypesColorsLine);
        const plantTableHeaders = [];
        const hourHeaders = [];
        lodash.forEach(
          columns,
          (
            { text, label, path, alt, prefix, sufix, type, actionTypeId },
            columnIndex
          ) => {
            let value = getColumnValue({
              data: plantData,
              label,
              path,
              alt,
              prefix,
              sufix,
              type,
            });
            if (!actionTypeId) {
              value = "";
            }
            plantTableHeaders.push({
              text,
              fillColor: !value ? "" : "#D2D2D2",
              bold: true,
              fontSize: 7,
              margin: [0, 0, 0, 0],
              rowSpan: !value ? 2 : 1,
              border: [false, false, columnIndex !== columns.length - 1, false],
            });
            hourHeaders.push({
              customDontRepeat: true,
              text: value || "",
              fillColor: "#D2D2D2",
              margin: [0, 0, 0, 0],
              border: [false, false, columnIndex !== columns.length - 1, false],
            });
          }
        );
        plantTable.push(plantTableHeaders);
        // plantTable.push(actionTypesColorsLine);
        plantTable.push(hourHeaders);
        plantTable.push(whiteSpace);
        plantTable.push(whiteSpace);
        lodash.forEach(plantData.groupData, (machineData) => {
          // console.log("!!!machineData", machineData);
          lodash.forEach(
            machineData.groupData,
            (productionOrderData, productionOrderIndex) => {
              // console.log("!!!productionOrderData", productionOrderData);
              let productLine = [];
              lodash.forEach(
                columns,
                (
                  { label, path, alt, prefix, sufix, type, actionTypeId },
                  columnIndex
                ) => {
                  let value = getColumnValue({
                    data:
                      columnIndex === 0
                        ? [machineData, productionOrderData]
                        : productionOrderData,
                    label,
                    path,
                    alt,
                    prefix,
                    sufix,
                    type,
                  });
                  const column = {
                    id: `${
                      lodash.get(productionOrderData, "poi.id") ||
                      `${Date.now()}${Math.random()}`
                    }${columnIndex}`,
                    customNoBreak: true,
                    rowSpan:
                      columnIndex === 0
                        ? machineData.groupData.length * 2
                        : columnIndex === 1
                        ? 2
                        : 1,
                    text: value,
                    fillColor: !actionTypeId ? "" : "#D2D2D2",
                    border: [
                      false,
                      false,
                      columnIndex !== columns.length - 1,
                      false,
                    ],
                    margin: [0, 10, 0, 0],
                  };
                  if (columnIndex === 0 && productionOrderIndex !== 0) {
                    column.text = "";
                  } else if (columnIndex === 0) {
                    delete column.text;
                    const valueArray = lodash.split(value, "\n");
                    column.stack = [
                      { text: valueArray[0], fontSize: 8.75, bold: true },
                      valueArray.slice(1).join("\n"),
                    ];
                  } else if (actionTypeId) {
                    //   delete column.text;
                    //   column.stack = [{ text: value, fillColor: "#D2D2D2", margin: [0, 0, 0, 0] }];
                  }
                  productLine.push(column);
                }
              );
              plantTable.push(productLine);
              productLine = [];
              lodash.map(
                PRODUCT_COLUMNS,
                (
                  { text = "", label, path, alt, prefix, sufix, type },
                  columnIndex
                ) => {
                  let value = getColumnValue({
                    data: productionOrderData,
                    label,
                    path,
                    alt,
                    prefix,
                    sufix,
                    type,
                  });
                  productLine.push({
                    customNoBreak: true,
                    stack: [{ text, bold: true }, value],
                    border: [
                      false,
                      false,
                      columnIndex !== columns.length - 1,
                      false,
                    ],
                    margin: [0, 0, 0, 0],
                  });
                }
              );
              plantTable.push(productLine);
              if (productionOrderIndex === machineData.groupData.length - 1) {
                plantTable.push(whiteSpace);
              }
            }
          );
        });
        plantDefinition.push(plantHeader);
        plantDefinition.push({
          style: "plantTable",
          table: {
            heights: [200],
            widths: [200, 275, 275],
            body: plantSummary,
          },
        });
        plantDefinition.push({
          margin: [0, -50, 0, 0],
          table: {
            heights: [10],
            widths: columnsWidth,
            body: [actionTypesColorsLine],
          },
        });
        plantDefinition.push({
          style: "plantTable",
          table: {
            headerRows: 4,
            widths: columnsWidth,
            body: plantTable,
          },
        });
        PDFDefinition.content.push(plantDefinition);
      })
    );
    // console.log("!!PDFDefinition", JSON.parse(JSON.stringify(PDFDefinition)));
    // const printer = new PDFPrinter(fonts);
    // const PDFDocument = printer.createPdfKitDocument(PDFDefinition);
    // PDFDocument.pipe(stream);
    PDFPrinter.setFonts(fonts);
    const PDFDocument = PDFPrinter.createPdf(PDFDefinition).pdfDocument;
    PDFDocument.pipe(stream);
    PDFDocument.end();
  } catch (error) {
    console.log("!!!PDF REPORT ERROR", error);
  }
};

module.exports = createPDF;
