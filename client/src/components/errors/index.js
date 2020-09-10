import React from "react";
import { withStyles } from "../../utils";
import { SnackbarContent } from "@material-ui/core";

const styles = theme => ({
  error: {
    margin: `0 auto ${theme.spacing(1)}px`,
    backgroundColor: theme.palette.error.dark,
    whiteSpace: "pre-wrap",
    "&>div": {
      padding: 0
    }
  }
});

const Errors = ({ classes, errors }) => (
  <SnackbarContent className={classes.error} message={errors.message || errors} />
);

export default withStyles(styles, { withTheme: true })(Errors);
