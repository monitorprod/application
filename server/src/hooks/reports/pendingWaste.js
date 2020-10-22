const lodash = require("lodash");
const get = lodash.get;
const moment = require("moment");
const getConfigs = require("../../utils/getConfigs");

const getDateJSON = ({ date }) => {
  const dateD = moment(date);
  return {
    year: dateD.year(),
    month: dateD.month(),
    date: dateD.date(),
    hour: dateD.hour(),
    minute: dateD.minute(),
    second: dateD.second()
  };
};

const addToWasteList = ({ wasteList, productionOrder, getProduction, plant, turn, date }) => {
  const sd = {
    ...getDateJSON({
      date
    }),
    hour: get(turn, "startTimeHours"),
    minute: get(turn, "startTimeMinutes"),
    second: get(turn, "startTimeSeconds")
  };
  const ed = {
    ...getDateJSON({
      date
    }),
    hour: get(turn, "endTimeHours"),
    minute: get(turn, "endTimeMinutes"),
    second: get(turn, "endTimeSeconds")
  };
  if (moment(ed).isBefore(moment(sd), "minute")) {
    ed.date++;
  }
  wasteList.push({
    id: `${get(productionOrder, "id")}${moment(sd).toISOString()}`,
    poi: productionOrder,
    plant,
    turn,
    getProduction,
    turnName: `${turn.name} ${moment(sd).format("DD/MM/YYYY")}`,
    sd,
    ed
  });
};

module.exports = function() {
  return async context => {
    const { app, method, data, type, params, result } = context;
    const usersService = app.service("users");
    const plantsService = app.service("plants");
    const turnsService = app.service("turns");
    const moldsService = app.service("molds");
    const productsService = app.service("products");
    const productionOrdersService = app.service("production_orders");
    const productionOrderStatusesService = app.service("production_order_statuses");
    const productionOrderEventsService = app.service("production_order_events");
    const productionOrderWasteService = app.service("production_order_waste");
    if ((get(params, "$pendingWaste") || get(params, "query.$pendingWaste")) && method === "find") {
      params.$pendingWaste = get(params, "$pendingWaste") || get(params, "query.$pendingWaste");
      lodash.unset(params, "query.$pendingWaste");
    }
    if (params.$pendingWaste && type === "after") {
      await getConfigs({ app });
      const machines = result.data || result;
      const sd = get(params, "$pendingWaste.sd") || {};
      const startD = moment(params.$pendingWaste.sd);
      const endD = moment(params.$pendingWaste.ed);
      const { data: plants } = await plantsService.find({
        query: {
          id: { $in: Object.keys(lodash.keyBy(machines, "plantId")) },
          companyId: data.companyId
        }
      });
      const plantsMap = lodash.keyBy(plants, "id");
      const { data: turns } = await turnsService.find({
        query: {
          plantId: { $in: Object.keys(plantsMap) },
          companyId: data.companyId
        }
      });
      const plantTurnsMap = lodash.groupBy(turns, "plantId");
      const { data: users } = await usersService.find({
        query: {
          companyId: data.companyId
        }
      });
      const usersMap = lodash.keyBy(users, "id");
      const showHistory = params.$pendingWaste.historyBy === "history";
      let wasteMap = {};
      const typesByQuery = {};
      if (params.$pendingWaste.typesBy === "active") {
        typesByQuery.isActive = true;
      }
      if (params.$pendingWaste.typesBy === "closed") {
        typesByQuery.isClosed = true;
      }
      const { data: productionOrders } = await productionOrdersService.find({
        query: {
          ...typesByQuery,
          machineId: { $in: lodash.map(machines, ({ id }) => id) },
          actualStartDate: { $lte: endD.toDate() },
          $or: [{ actualEndDate: { $gte: startD.toDate() } }, { actualEndDate: null }]
        }
      });
      // const productionOrdersMap = lodash.keyBy(productionOrders, "id") ;
      const machineProductionOrdersMap = lodash.groupBy(productionOrders, "machineId");
      const { data: molds } = await moldsService.find({
        query: {
          id: { $in: lodash.map(productionOrders, ({ moldId }) => moldId) }
        }
      });
      moldsMap = lodash.keyBy(molds, "id");
      const { data: products } = await productsService.find({
        query: {
          id: { $in: lodash.map(productionOrders, ({ productId }) => productId) }
        }
      });
      const productsMap = lodash.keyBy(products, "id");
      const { data: productionOrderStatuses } = await productionOrderStatusesService.find({
        query: {
          id: {
            $in: lodash.map(
              productionOrders,
              ({ productionOrderStatusId }) => productionOrderStatusId
            )
          }
        }
      });
      const productionOrderStatusesMap = lodash.keyBy(productionOrderStatuses, "id");
      const { data: historyList } = await productionOrderWasteService.find({
        query: {
          poi: { $in: lodash.map(productionOrders, ({ id }) => id) },
          sd: { $lte: moment(endD).toDate() },
          $or: [{ ed: { $gte: moment(startD).toDate() } }, { ed: -1 }]
        }
      });
      await Promise.all(
        lodash.map(machines, async machine => {
          let wasteList = [];
          await Promise.all(
            lodash.map(get(machineProductionOrdersMap, get(machine, "id")), async itemOP => {
              const productionOrder = get(itemOP, "dataValues") || itemOP;
              productionOrder.machine = machine;
              productionOrder.mold = get(moldsMap, get(productionOrder, "moldId"));
              productionOrder.product = get(productsMap, get(productionOrder, "productId"));
              productionOrder.production_order_status = get(
                productionOrderStatusesMap,
                get(productionOrder, "productionOrderStatusId")
              );
              const actualStartOPD = moment(get(productionOrder, "actualStartDate")).startOf("day");
              const startOPD = actualStartOPD.isAfter(startD) ? actualStartOPD : startD;
              const plant =
                get(plantsMap, get(machine, "plantId")) ||
                get(plantsMap, get(productionOrder, "plantId"));
              const hoursDiff = moment(endD).diff(startOPD, "hours");
              const daysDiff = Math.ceil(hoursDiff/24) - 1;
              if (get(plant, "qualityTrackFrequency") === "Diario") {
                for (let i = 0; i <= daysDiff; i++) {
                  const turn = get(plantTurnsMap, `${get(plant, "id")}.0`);
                  addToWasteList({
                    wasteList,
                    productionOrder,
                    plant,
                    turn,
                    getProduction: true,
                    date: moment(startOPD)
                      .add(i, "days")
                      .startOf("day")
                  });
                }
              } else if (get(plant, "qualityTrackFrequency") === "Turno") {
                for (let i = 0; i <= daysDiff; i++) {
                  lodash.forEach(get(plantTurnsMap, get(plant, "id")), turn => {
                    addToWasteList({
                      wasteList,
                      productionOrder,
                      plant,
                      turn,
                      getProduction: true,
                      date: moment(startOPD)
                        .add(i, "days")
                        .startOf("day")
                    });
                  });
                }
              } else if (
                get(plant, "qualityTrackFrequency") === "Encerramento" &&
                productionOrder.isClosed &&
                (params.$pendingWaste.typesBy === "closed" ||
                  params.$pendingWaste.typesBy === "all")
              ) {
                getProduction = false;
                const actualEndOPD = moment(get(productionOrder, "actualEndDate")).startOf("day");
                const sd = {
                  ...getDateJSON({
                    date: moment(actualEndOPD)
                  })
                };
                const ed = {
                  ...getDateJSON({
                    date: actualEndOPD
                  })
                };
                wasteList.push({
                  id: `${get(productionOrder, "id")}${moment(sd).toISOString()}`,
                  poi: productionOrder,
                  plant,
                  turnName: `${moment(ed).format("DD/MM/YYYY")}`,
                  sd,
                  ed
                });
              }
              wasteList = lodash.filter(wasteList, item => {
                const wItem = lodash.find(
                  historyList,
                  hItem =>
                    hItem.poi === get(item, "poi.id") &&
                    hItem.sdY === item.sd.year &&
                    hItem.sdM === item.sd.month &&
                    hItem.sdD === item.sd.date &&
                    hItem.sdh === item.sd.hour &&
                    hItem.sdm === item.sd.minute
                );
                if (showHistory && wItem) {
                  // TODO format values as in PDF for tables
                  const weight = parseFloat(get(item, "poi.product.weight")) || 0;
                  item._id = wItem._id;
                  if (item.getProduction) {
                    item.tp = wItem.tp;
                  } else {
                    item.tp = lodash.get(item, "poi.totalProduction");
                  }
                  item.cp = wItem.cp;
                  item.cpw = Math.round(wItem.cp * weight * 100) / 100;
                  item.wp = wItem.wp;
                  item.wpw = Math.round(wItem.wp * weight * 100) / 100;
                  item.wji = wItem.wji;
                  item.userName = get(usersMap, `${get(wItem, "ui")}.name`);
                  item.cd = moment(wItem.cd).toDate();
                }
                return (
                  moment(endD).isAfter(moment(item.sd), "minute") &&
                  moment(productionOrder.actualStartDate).isBefore(moment(item.ed), "minute") &&
                  moment(productionOrder.actualEndDate || moment(endD)).isAfter(
                    moment(item.sd),
                    "minute"
                  ) &&
                  ((!showHistory && !wItem) || (showHistory && wItem))
                );
              });
            })
          );
          if (!showHistory) {
            await Promise.all(
              lodash.map(wasteList, async item => {
                if (item.getProduction) {
                  const { data: readings } = await productionOrderEventsService.find({
                    query: {
                      poi: get(item, "poi.id"),
                      nw: null,
                      w: null,
                      rp: null,
                      tr: { $gt: 0 },
                      $or: [{ ed: { $gte: moment(item.sd).toDate() } }, { ed: -1 }],
                      sd: { $lte: moment(item.ed).toDate() }
                    }
                  });
                  item.tp = lodash.reduce(
                    readings,
                    (sum, { t }) => (sum += parseInt(t, "10") || 0),
                    0
                  );
                } else {
                  item.tp = lodash.get(item, "poi.totalProduction");
                }
              })
            );
          }
          wasteMap = { ...wasteMap, ...lodash.keyBy(wasteList, "id") };
        })
      );
      // console.log("!!!pendingWaste", wasteMap);
      // TODO change poi for productionOrder object
      context.result.data = wasteMap;
      context.result.header = [
        { text: "Ordem", path: "poi.id", alt: "ND" },
        { text: "Status", path: "poi.production_order_status.name", alt: "ND" },
        { text: "Molde", path: "poi.mold.identity", alt: "ND" },
        { text: "Produto", path: "poi.product.identity", alt: "ND" },
        { text: "Turno", path: "turnName", alt: "ND" },
        // { text: "", path: "sd", type: "datetime", alt: "ND" },
        { text: "Q Produz", path: "tp", type: "integer", alt: "ND" },
        {
          text: "Q Confirm",
          path: "cp",
          // readOnly: "Q Refugo",
          type: "integer",
          input: true
        },
        // {
        //   text: "P Confirm (KG)",
        //   path: "cpw",
        //   readOnly: "Q Refugo",
        //   type: "decimal",
        //   input: true
        // },
        {
          text: "Q Refugo",
          path: "wp",
          // readOnly: "Q Confirmada",
          type: "integer",
          input: true
        },
        {
          text: "P Refugo (KG)",
          path: "wpw",
          // readOnly: "Q Confirmada",
          type: "decimal",
          input: true
        },
        {
          text: "Motivo Refugo",
          path: "wji",
          model: "waste_justifications",
          input: true
        }
      ];
      if (showHistory) {
        context.result.header.push({
          text: "Usuario",
          path: "userName"
        });
        context.result.header.push({
          text: "Data",
          path: "cd",
          type: "datetime"
        });
      }
      context.result.groupBy = lodash.groupBy(context.result.data, "poi.machine.id");
      lodash.forEach(machines, machine => {
        if (!context.result.groupBy[machine.id]) {
          context.result.groupBy[machine.id] = [{ poi: { machine } }];
        }
      });
      context.result.groupBy = lodash.sortBy(
        lodash.map(context.result.groupBy, groups => {
          const groupRow = {
            machine: get(groups, "0.poi.machine"),
            groupData: lodash.filter(groups, group => group.id)
          };
          // console.log("!!!groupRow", groupRow.machine.id, groupRow);
          groupRow.colspan = showHistory ? 12 : 10;
          return groupRow;
        }),
        "machine.identity"
      );
    }
    return context;
  };
};
