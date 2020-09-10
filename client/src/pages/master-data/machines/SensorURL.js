import React from "react";
import { withStyles, lodashGet, useFindService } from "../../../utils";

const styles = theme => ({
  deviceURL: {
    textDecoration: "underline",
    cursor: "pointer"
  }
});

const SensorURL = withStyles(styles, { withTheme: true })(({ classes, data = {} }) => {
  const { list } = useFindService({
    model: "sensors",
    query: { machineId: data.id }
  });
  const sensor = lodashGet(list, "0") || {};
  const machineName = `${data.identity} - ${data.name}`;
  const machineURL = `http://${sensor.ip}:3030/?name=${window.escape(machineName)}`;
  return (
    <span
      className={classes.deviceURL}
      onClick={() =>
        window.open(
          machineURL,
          machineName,
          "width=650,height=350,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,directories=no,status=no"
        )
      }
    >
      {sensor.identity ? `${sensor.identity} - ` : ""}
      {sensor.name || ""}
    </span>
  );
});

export default SensorURL;
