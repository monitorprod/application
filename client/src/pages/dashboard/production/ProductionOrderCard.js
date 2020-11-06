import React, { useContext, useState, useEffect, useCallback } from "react";
import { Grid, Card, CardContent, Typography } from "@material-ui/core";
import moment from "moment";
import NumberFormat from "react-number-format";
import ApiContext from "../../../api";
import {
  Link,
  withStyles,
  lodashGet,
  lodashForEach,
  lodashDebounce,
  getColor,
  useAuth
} from "../../../utils";
import Status from "./Status";

const styles = theme => ({
  content: {
    flexWrap: "nowrap"
  },
  link: {
    textDecoration: "none"
  },
  card: {}
});

/** TODO Standard order of attrs! key / classname / rest? / events */
const ProductionOrderCard = ({
  classes,
  machine,
  productionOrder: pProductionOrder,
  lastEvent: pLastEvent,
  setShowUndefinedAlert,
  setShowStoppedAlert,
  setShowNoActiveOPAlert,
  setShowMaxProductionAlert
}) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  // const undefinedEventType = getEventType({ client, type: "undefined" });
  const [productionOrder, setProductionOrder] = useState();
  const [lastEvent, setLastEvent] = useState();
  const [background, setBackgrund] = useState();
  const noJustifiedColor = client.get(
    `actionType.${lodashGet(
      client.get("config.productionOrder.eventType.noJustified"),
      "value"
    )}`
  );
  const confirmedProduction =
    lodashGet(productionOrder, "confirmedProduction") ||
    lodashGet(productionOrder, "totalProduction");
  const missingProduction =
    lodashGet(productionOrder, "expectedProduction") - confirmedProduction;
  const findProductionOrders = useCallback(() => {
    // console.log("!!!findProductionOrders")
    const asyncFindProductionOrders = async () => {
      let productionOrders;
      const { data: find } = await client.service("production_orders").find({
        query: {
          machineId: machine.id,
          $populateAll: true,
          isActive: true,
          $sort: {
            actualStartDate: 1
          },
          $limit: 1
        }
      });
      productionOrders = find;
      if (productionOrders.length) {
        setProductionOrder(productionOrders[0]);
      } else {
        setProductionOrder({
          $withoutOP: true
        });
        const { data: sensors } = await client
          .service("sensors")
          .find({ query: { machineId: machine.id } });
        const { data: events } = await client
          .service("production_order_events")
          .find({
            query: {
              mi: machine.id,
              si: lodashGet(sensors, "0.id"),
              $populateAll: true,
              "r.0": { $exists: true },
              sd: {
                $gte: moment()
                  .startOf("day")
                  .add(6, "hours")
                  .toDate()
              },
              $sort: {
                sd: -1
              },
              $limit: 1
            }
          });
        setLastEvent(events);
      }
    };
    asyncFindProductionOrders();
  }, [client, machine.id]);
  // useEffect(() => {
  //   // console.log("!!effect Status OP Card findProductionOrders");
  //   findProductionOrders();
  // }, [findProductionOrders]);
  const stringPProductionOrder = JSON.stringify(pProductionOrder || {});
  useEffect(() => {
    const parsedPProductionOrder = JSON.parse(stringPProductionOrder);
    setProductionOrder(parsedPProductionOrder);
  }, [stringPProductionOrder]);
  const stringPLastEvent = JSON.stringify(pLastEvent || {});
  useEffect(() => {
    const parsedPLastEvent = JSON.parse(stringPLastEvent);
    setLastEvent(parsedPLastEvent);
  }, [stringPLastEvent]);
  const stringProductionOrder = JSON.stringify(productionOrder || {});
  const stringLastEvent = JSON.stringify(lastEvent || {});
  useEffect(() => {
    // console.log("!!effect Status OP Card stringProductionOrder");
    const parsedProductionOrder = JSON.parse(stringProductionOrder);
    const parsedLastEvent = JSON.parse(stringLastEvent);
    const setStatusColor = ({ noJustified, noActiveOP, undefinedEV }) => {
      let color = "";
      if (undefinedEV) {
        color = "rgba(0, 0, 0, .14)";
      }
      if (noActiveOP) {
        color = "#00BFFF";
      }
      if (noJustified) {
        color = getColor({ data: noJustifiedColor, path: "color" });
      }
      if (
        level === "N1" &&
        missingProduction <= 0 &&
        lodashGet(parsedProductionOrder, "production_order_type.isInProduction")
      ) {
        setShowMaxProductionAlert(true);
        if (!color) {
          color = "#ADFF2F";
        } else {
          color = `linear-gradient(to right bottom, ${color} 50%, #ADFF2F 50%)`;
        }
      }
      setBackgrund(color);
    };
    const findReadingAlert = async () => {
      // console.log("!!! findReadingAlert", lodashGet(parsedProductionOrder, "uuid"));
      if (lodashGet(parsedProductionOrder, "uuid")) {
        const productionOrderActionTypeId = lodashGet(
          parsedProductionOrder,
          "mostRecentEvent.0.productionOrderEventType.productionOrderActionTypeId"
        );
        const readings =
          lodashGet(parsedProductionOrder, "lastReading.0.r") || [];
        if (
          !lodashGet(
            parsedProductionOrder,
            "production_order_type.isInProduction"
          ) ||
          !lodashGet(parsedProductionOrder, "lastReading.length") ||
          !parseInt(lodashGet(readings, `${readings.length - 1}.t`), "10")
        ) {
          return setStatusColor({ noJustified: false });
        }
        let isProductionType = false;
        lodashForEach(
          [
            client.get("config.productionOrder.eventType.active"),
            client.get("config.productionOrder.eventType.noJustified"),
            client.get("config.productionOrder.eventType.max"),
            client.get("config.productionOrder.eventType.min")
          ],
          c => {
            if (
              `${lodashGet(c, "value")}` === `${productionOrderActionTypeId}`
            ) {
              isProductionType = true;
            }
          }
        );
        if (!isProductionType) {
          if (
            `${productionOrderActionTypeId}` ===
            `${lodashGet(
              client.get("config.productionOrder.eventType.undefined"),
              "value"
            )}`
          ) {
            setShowUndefinedAlert(true);
            return setStatusColor({ undefinedEV: true });
          } else {
            setShowStoppedAlert(true);
            return setStatusColor({ noJustified: true });
          }
        } else {
          return setStatusColor({ noJustified: false });
        }
      } else if (lodashGet(parsedProductionOrder, "$withoutOP")) {
        if (lodashGet(parsedLastEvent, "0.sd")) {
          setShowNoActiveOPAlert(true);
          return setStatusColor({ noActiveOP: true });
        } else {
          return setStatusColor({ noJustified: false });
        }
      }
    };
    findReadingAlert();
  }, [
    client,
    machine.id,
    setShowNoActiveOPAlert,
    setShowUndefinedAlert,
    setShowStoppedAlert,
    setShowMaxProductionAlert,
    missingProduction,
    noJustifiedColor,
    stringProductionOrder,
    stringLastEvent
  ]);
  const activeOrder = lodashGet(productionOrder, "isActive");
  const inProductionOrder = lodashGet(
    productionOrder,
    "production_order_type.isInProduction"
  );
  useEffect(() => {
    const reloadEvents = lodashDebounce(() => findProductionOrders(), 300);
    const onEventCreated = async data => {
      if (!data.poi) {
        const { data: sensors } = await client
          .service("sensors")
          .find({ query: { machineId: machine.id, id: data.si } });
        if (sensors.length) {
          reloadEvents();
        }
      }
    };
    const onProductionOrder = data => {
      if (`${data.machineId}` === `${machine.id}`) {
        reloadEvents();
      }
    };
    client.service("production_orders").on("patched", onProductionOrder);
    client.service("production_orders").on("created", onProductionOrder);
    client.service("production_order_events").on("created", onEventCreated);
    return () => {
      client
        .service("production_orders")
        .removeListener("patched", onProductionOrder);
      client
        .service("production_orders")
        .removeListener("created", onProductionOrder);
      client
        .service("production_order_events")
        .removeListener("created", onEventCreated);
    };
  }, [client, machine.id, findProductionOrders]);
  const endD =
    lodashGet(productionOrder, "mostRecentEvent.0.ed") === -1
      ? moment()
      : lodashGet(productionOrder, "mostRecentEvent.0.ed");
  return (
    <Grid
      item
      xs={12}
      md={6}
      key={machine.id}
      className={classes.link}
      component={Link}
      to={`/dashboard/production/${machine.id}/order/${
        lodashGet(productionOrder, "uuid") ? productionOrder.id : "new"
      }`}
    >
      <Card
        className={classes.card}
        style={{
          background
        }}
      >
        <CardContent>
          <Grid
            className={classes.content}
            container
            direction="row"
            alignItems="center"
            spacing={0}
          >
            <Grid item xs={4}>
              <Typography component="h6" variant="h6" noWrap>
                {machine.identity} - {machine.name}
              </Typography>
              <Typography color="textSecondary" noWrap>
                Molde: {lodashGet(productionOrder, "mold.identity")} -{" "}
                {lodashGet(productionOrder, "mold.name")}
              </Typography>
              {level === "N1" && (
                <Typography color="textSecondary" noWrap>
                  Produto: {lodashGet(productionOrder, "product.identity")} -{" "}
                  {lodashGet(productionOrder, "product.name")}
                </Typography>
              )}
            </Grid>
            <Grid item style={{ minWidth: "50px" }}>
              <Status
                productionOrder={productionOrder}
                noOPEventType={lodashGet(machine, "noOPEventType")}
              />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" noWrap>
                {!activeOrder && `${lodashGet(machine, "noOPEventType.name")}`}
                {activeOrder &&
                  `${lodashGet(
                    productionOrder,
                    "mostRecentEvent.0.productionOrderEventType.name"
                  )}`}
              </Typography>
              <Typography color="textSecondary" noWrap>
                {`${moment(endD).format("DD/MM/YYYY")}`}
              </Typography>
              <Typography color="textSecondary" noWrap>
                {`${moment(endD).format("HH:mm")}`}
              </Typography>
            </Grid>
            {level === "N1" && (
              <Grid item xs={3}>
                <Typography variant="body2" noWrap>
                  PROG: {(!activeOrder || !inProductionOrder) && "NÃO DEFINIDO"}
                  <NumberFormat
                    value={
                      activeOrder &&
                      `${lodashGet(productionOrder, "expectedProduction")}`
                    }
                    displayType={"text"}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  />
                </Typography>
                <Typography color="textSecondary" noWrap>
                  PRODUZ:{" "}
                  <NumberFormat
                    value={inProductionOrder ? `${lodashGet(productionOrder, "totalProduction")}` : ""}
                    displayType={"text"}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  />
                </Typography>
                <Typography color="textSecondary" noWrap>
                  CONFIRM:{" "}
                  <NumberFormat
                    value={inProductionOrder ? confirmedProduction : ""}
                    displayType={"text"}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  />
                </Typography>
                <Typography color="textSecondary" noWrap>
                  FALTA:{" "}
                  <NumberFormat
                    value={inProductionOrder ? missingProduction : ""}
                    displayType={"text"}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  />
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionOrderCard);
