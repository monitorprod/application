import React from "react";
import { withStyles, getColor } from "../../../utils";

const styles = theme => ({
  color: {
    marginLeft: 20,
    height: 30,
    width: 30,
    borderRadius: "50%"
  }
});

const Color = withStyles(styles, { withTheme: true })(({ classes, data = {} }) => (
  <div
    className={classes.color}
    style={{
      background: getColor({
        data: { data },
        path: "data"
      })
    }}
  />
));

export default Color;
