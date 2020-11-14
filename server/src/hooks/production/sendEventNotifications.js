const lodash = require("lodash");
const moment = require("moment");
const { getActionType } = require("../../utils/events");

module.exports = function () {
  return async (context) => {
    const {
      app,
      data,
      $productionOrder: productionOrder,
      $machine: machine,
      $plant: plant,
      $currentEvent: currentEvent,
    } = context;
    const notificationsService = app.service("notifications");
    const productionOrderHistoryService = app.service("production_order_history");
    if (
      machine &&
      productionOrder &&
      (parseFloat(lodash.get(productionOrder, "totalProduction")) || 0) +
      parseFloat(data.t) >
      parseFloat(lodash.get(productionOrder, "expectedProduction"))
    ) {
      const sendProductionExceededNotification = ({ data: notifications }) => {
        if (!notifications.length) {
          notificationsService
            .create({
              type: "production_exceeded",
              title: `PRODUÇÃO EXCEDIDA: OP ${productionOrder.id} / ${machine.identity} - ${machine.name}`,
              machineId: data.mi,
              companyId: data.ci,
              productionOrderId: data.poi,
            })
            .catch(
              (error) => { }
              // console.log(">>>> ERROR NOTIFICATION PRODUCTION EXCEEDED", error)
            );
        }
      };
      notificationsService
        .find({
          query: {
            type: "production_exceeded",
            machineId: data.mi,
            companyId: data.ci,
            productionOrderId: data.poi,
            $limit: 1,
          },
        })
        .then(sendProductionExceededNotification)
        .catch(
          (error) => { }
          // console.log(">>>> ERROR NOTIFICATION PRODUCTION EXCEEDED", error)
        );
    }
    const notificationTimeMIN = lodash.get(plant, "notificationTimeMIN") || 1;
    const noJustifiedActionType = getActionType({ app, type: "noJustified" });
    if (
      machine &&
      productionOrder &&
      data.w
    ) {
      app.set(
        `${data.mi}-stop`,
        setTimeout(
          () => {
            const sendNoJustifiedNotification = () => {
              notificationsService
                .create({
                  type: "stop",
                  title: `${currentEvent.name}: ${machine.identity} - ${machine.name}`,
                  machineId: data.mi,
                  companyId: data.ci,
                  productionOrderId: data.poi,
                })
                .catch(
                  (error) => { }
                  // console.log(">>>> ERROR NOTIFICATION NO JUSTIFIED", error)
                );
            };
            notificationsService
              .remove(null, {
                query: {
                  type: "stop",
                  machineId: data.mi,
                  companyId: data.ci,
                },
              })
              .then(sendNoJustifiedNotification)
              .catch(sendNoJustifiedNotification);
          },
          data.w ? (notificationTimeMIN - 1) * 1000 * 60 : 0
        )
      );
    }
    if (data.nw) {
      const sendNoiseWarningNotification = () => {
        notificationsService
          .create({
            type: "noise",
            title: `Ruido na leitura de ciclo: ${machine.identity} - ${machine.name}`,
            machineId: data.mi,
            companyId: data.ci,
            productionOrderId: data.poi,
          })
          .catch(
            (error) => { }
            // console.log(">>>> ERROR NOTIFICATION NOISE WARNING", error)
          );
      };
      const trySendNoiseWarningNotification = ({ data: notifications }) => {
        if (
          moment(data.sd).diff(
            moment(lodash.get(notifications, "0.createdAt")),
            "minutes"
          ) > 5
        ) {
          notificationsService
            .remove(null, {
              query: {
                type: "noise",
                machineId: data.mi,
                companyId: data.ci,
              },
            })
            .then(sendNoiseWarningNotification)
            .catch(sendNoiseWarningNotification);
        }
      };
      notificationsService
        .find({
          query: {
            type: "noise",
            machineId: data.mi,
            companyId: data.ci,
            productionOrderId: data.poi,
            $sort: { createdAt: -1 },
            $limit: 1,
          },
        })
        .then(trySendNoiseWarningNotification)
        .catch(
          (error) => { }
          // console.log(">>>> ERROR NOTIFICATION NOISE WARNING", error)
        );
    }
    if (data.rp || data.t > 0) {
      clearTimeout(app.get(`${data.mi}-stop`));
      clearTimeout(app.get(`${data.mi}-noise`));
    }
    const history = lodash.get(
      await productionOrderHistoryService.find({
        query: {
          poi: data.poi,
          $limit: 1
        }
      }),
      "data.0"
    );
    if (data.w) {
      await productionOrderHistoryService.patch(history._id, {
        w: moment(data.sd).toDate()
      });
    } else if ((data.rp || data.t > 0) && moment(data.ed).isSameOrAfter(moment(history.w), "minutes")) {
      await productionOrderHistoryService.patch(history._id, {
        w: null
      });
    }
    if (data.rp || data.w || data.nw) {
      throw new Error("Notification Created!");
    }
    return context;
  };
};
