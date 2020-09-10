import React, { useState, useEffect } from "react";
import { Avatar, Typography } from "@material-ui/core";
import { withStyles, lodashGet, getColor, getLastReadingCycle } from "../../../utils";

const styles = theme => ({
  container: {
    width: 50,
    height: 50,
    marginRight: theme.spacing(2),
    fontSize: "1rem"
  },
  currentCycle: {
    display: "inline-grid",
    lineHeight: "unset",
    marginTop: "2px",
    color: theme.palette.common.white
  },
  standardCycle: {
    textAlign: "center",
    color: theme.palette.common.white,
    fontSize: ".65rem",
    borderTop: `solid 1px ${theme.palette.common.white}`
  }
});
const Status = ({ classes, productionOrder, noOPEventType, size }) => {
  const [cycle, setCycleValue] = useState();
  const [productionOrderEvent, setProductionOrderEvent] = useState();
  // const [productionOrderLastReading, setProductionOrderLastReading] = useState();
  const stringProductionOrder = JSON.stringify(productionOrder || {});
  useEffect(() => {
    // setProductionOrderLastReading(
    //   lodashGet(productionOrder, "lastReading.0") || lodashGet(productionOrder, "mostRecentEvent.0")
    // );
    setProductionOrderEvent(lodashGet(JSON.parse(stringProductionOrder), "mostRecentEvent.0"));
  }, [stringProductionOrder]);
  useEffect(
    () =>
      setCycleValue(getLastReadingCycle({ data: JSON.parse(stringProductionOrder) }).toFixed(1)),
    [stringProductionOrder]
  );
  // console.log("productionOrderEvent", productionOrderEvent, productionOrderLastReading);
  return (
    <Avatar
      className={classes.container}
      style={{
        width: `${size}px` || '',
        height: `${size}px`|| '',
        background:
          getColor({
            data: productionOrderEvent,
            path: "productionOrderEventType.production_order_action_type.color"
          }) ||
          getColor({
            data: noOPEventType,
            path: "production_order_action_type.color"
          })
      }}
    >
      <div className={classes.currentCycle}>
        {productionOrderEvent ? cycle : "ND"}
        <Typography className={classes.standardCycle}>
          {productionOrderEvent &&
            (lodashGet(productionOrder, "idealCycle") ? (
              <span>{lodashGet(productionOrder, "idealCycle")}</span>
            ) : (
              "ND"
            ))}
        </Typography>
      </div>
    </Avatar>
  );
};

export default withStyles(styles, { withTheme: true })(Status);
