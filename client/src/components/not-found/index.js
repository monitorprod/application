import React from "react";
import { Typography } from "@material-ui/core";
import { withStyles } from "../../utils";

const styles = theme => ({
  notFound: {
    width: "100%",
    textAlign: "center"
  }
});

const NotFound = ({ classes }) => (
  <Typography className={classes.notFound} variant="body1">
    Nenhum item encontrado.
  </Typography>
);

export default withStyles(styles, { withTheme: true })(NotFound);
