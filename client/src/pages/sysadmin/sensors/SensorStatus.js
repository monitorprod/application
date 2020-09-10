import React from "react";
import { withStyles, useStatusSensor } from "../../../utils";

const styles = theme => ({
  status: {
    marginLeft: 20,
    height: 30,
    width: 30,
    borderRadius: "50%"
  }
});

const SensorStatus = withStyles(styles, { withTheme: true })(({ classes, data = {} }) => {
  const { status } = useStatusSensor({ ip: data.ip });
  return (
    <div
      className={classes.status}
      style={{
        background: status
      }}
    />
  );
});

export default SensorStatus;
