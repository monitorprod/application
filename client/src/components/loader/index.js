import React from "react";
import { LinearProgress } from "@material-ui/core";
import { withStyles } from "../../utils";

const styles = theme => ({
  loader: {
    width: "100%",
    marginBottom: theme.spacing(1)
  }
});

const Loader = ({ classes }) => <LinearProgress className={classes.loader} variant="query" />;

export default withStyles(styles, { withTheme: true })(Loader);
