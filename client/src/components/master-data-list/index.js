import React from "react";
import { Hidden } from "@material-ui/core";
import { withStyles } from "../../utils";
import Grid from "./Grid";
import Table from "./Table";

const styles = theme => ({});

const MasterDataList = ({
  classes,
  model,
  fields,
  query = {},
  options = {},
  customContent = {},
  customActions
}) => (
  <React.Fragment>
    <Hidden smDown>
      <Table
        model={model}
        fields={fields}
        query={query}
        options={options}
        customContent={customContent}
        customActions={customActions}
      />
    </Hidden>
    <Hidden mdUp>
      <Grid
        model={model}
        fields={fields}
        query={query}
        options={options}
        customContent={customContent}
        customActions={customActions}
      />
    </Hidden>
  </React.Fragment>
);

export default withStyles(styles, { withTheme: true })(MasterDataList);
