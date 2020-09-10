import React from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Icon
} from "@material-ui/core";
import { withStyles, lodashGet } from "../../utils";
import Button from "../buttons";

const styles = theme => ({
  panel: {
    margin: 0
  },
  header: {
    backgroundColor: theme.palette.primary.header,
    "&>div": {
      alignItems: "center"
    }
  },
  details: {
    padding: theme.spacing(2)
  }
});

const MachinePanel = ({
  classes,
  data,
  expanded,
  handleExpand,
  handleSubmit,
  handleDelete,
  FormRef,
  setFormRef,
  options = {}
}) => {
  const handleEditMachine = ({ data }) => e => {
    e.stopPropagation();
    handleSubmit({ machine: data.machine });
  };
  const handleDeleteMachine = ({ data }) => e => {
    e.stopPropagation();
    handleDelete({ machine: data.machine });
  };
  const isExpanded = expanded === data.machineId;
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ ...data, id: data.machineId })}
    >
      <ExpansionPanelSummary className={classes.header} expandIcon={<Icon>expand_more_icon</Icon>}>
        <Typography>
          {lodashGet(data, "machine.identity")} - {lodashGet(data, "machine.name")}
        </Typography>
        {isExpanded && (
          <React.Fragment>
            {!options.readOnly && (
              <Button
                text="Gravar SetUps"
                variants="header"
                onClick={handleEditMachine({ data })}
              />
            )}
            {!options.readOnly && (
              <Button
                text="Deletar"
                variants="delete header"
                onClick={handleDeleteMachine({ data })}
              />
            )}
          </React.Fragment>
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: data.machineId })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(MachinePanel);
