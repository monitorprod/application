import React from "react";
import {
  Grid,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Tooltip,
  Icon
} from "@material-ui/core";
import { withStyles, lodashGet, lodashFilter } from "../../utils";
import { ProductsModel } from "../../pages/master-data/models";
import Button from "../buttons";
import MasterDataList from "../master-data-list";

const styles = theme => ({
  panel: {
    margin: 0
  },
  header: {
    backgroundColor: theme.palette.primary.header
  },
  details: {
    padding: theme.spacing(2)
  },
  fullWidth: {
    width: "100%",
    overflowX: "auto"
  }
});

const AddProductPanel = ({
  classes,
  query = {},
  expanded,
  handleExpand,
  handleSubmit,
  FormRef,
  setFormRef
}) => {
  const handleAddProduct = ({ data }) => e => {
    e.preventDefault();
    handleSubmit({ product: data });
  };
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={expanded === "list"}
      onChange={handleExpand({ id: "list" })}
    >
      <ExpansionPanelSummary
        className={classes.header}
        expandIcon={
          <React.Fragment>
            <Tooltip title="Adicionar produto para o molde">
              <Icon>add_icon</Icon>
            </Tooltip>
            {expanded !== "list" && <Typography>Adicionar produto para o molde:</Typography>}
          </React.Fragment>
        }
      />
      <ExpansionPanelDetails className={classes.details}>
        <Grid container direction="column" spacing={2}>
          <Grid item ref={setFormRef({ id: "list" })}>
            {!FormRef.current && <Typography>Placeholder</Typography>}
          </Grid>
          <Grid item className={classes.fullWidth}>
            <MasterDataList
              model={ProductsModel.metadata}
              fields={lodashFilter(ProductsModel.list, field => {
                if (lodashGet(field, "customContent.dontFilterWhenChild")) {
                  field.customContent = {
                    ...(field.customContent || {}),
                    dontFilter: true
                  };
                }
                return !field.hidden;
              })}
              query={{ ...query, $sort: { identity: 1 } }}
              options={{
                dontEdit: true,
                dontDelete: true,
                dontCreate: true
              }}
              customActions={({ isList, data }) =>
                isList && (
                  <Button
                    text="Adicionar"
                    icon="add_icon"
                    type="icon"
                    onClick={handleAddProduct({ data })}
                  />
                )
              }
            />
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(AddProductPanel);
