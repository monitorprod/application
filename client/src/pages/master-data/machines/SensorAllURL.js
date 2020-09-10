import React from "react";
import { Typography } from "@material-ui/core";
import { withStyles, useSensorAllURL } from "../../../utils";

const styles = theme => ({
  deviceURL: {
    color: `${theme.palette.common.white} !important`,
    textDecoration: "underline !important",
    cursor: "pointer"
  }
});

const SensorAllURL = withStyles(styles, { withTheme: true })(({ classes }) => {
  const { sensorsURL } = useSensorAllURL();
  if (!sensorsURL) {
    return <Typography variant="body1">Sensor</Typography>;
  }
  return (
    <a className={classes.deviceURL} href={sensorsURL} rel="noopener noreferrer" target="_blank">
      <Typography variant="body1">Sensor</Typography>
    </a>
  );
});

export default SensorAllURL;
