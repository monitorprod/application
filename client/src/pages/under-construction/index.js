import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { withStyles } from "../../utils";

const styles = theme => ({
  grid: {
    height: "100%"
  }
});

const UnderConstructionPage = ({ classes }) => (
  <Grid container direction="column" justify="center" alignItems="center" className={classes.grid}>
    <Typography variant="h2">Em Construção</Typography>
  </Grid>
);

export default withStyles(styles, { withTheme: true })(UnderConstructionPage);
