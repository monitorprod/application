import React from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  Typography,
  Tooltip,
  Icon
} from "@material-ui/core";
import { withStyles, lodashGet, lodashFilter } from "../../utils";
import { MachinesModel } from "../../pages/master-data/models";
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

const AddMachine = ({
  classes,
  query = {},
  expanded,
  handleExpand,
  handleSubmit,
  FormRef,
  setFormRef
}) => {
  const handleAddMachine = ({ data }) => e => {
    e.preventDefault();
    handleSubmit({ machine: data });
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
            <Tooltip title="Adicionar máquina setup">
              <Icon>add_icon</Icon>
            </Tooltip>
            {expanded !== "list" && <Typography>Adicionar máquina setup:</Typography>}
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
              model={MachinesModel.metadata}
              fields={lodashFilter(MachinesModel.list, field => {
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
                    onClick={handleAddMachine({ data })}
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

export default withStyles(styles, { withTheme: true })(AddMachine);
