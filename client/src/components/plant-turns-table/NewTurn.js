import React from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Tooltip,
  Icon
} from "@material-ui/core";
import { withStyles } from "../../utils";
import Button from "../buttons";

const styles = theme => ({
  panel: {
    margin: 0
  },
  header: {
    backgroundColor: theme.palette.primary.header
  },
  details: {
    padding: theme.spacing(2)
  }
});

const NewTurnPanel = ({ classes, expanded, handleExpand, handleSubmit, FormRef, setFormRef }) => {
  const handleEditTurn = e => {
    e.stopPropagation();
    handleSubmit();
  };
  const isExpanded = expanded === "new";
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ id: "new" })}
    >
      <ExpansionPanelSummary
        className={classes.header}
        expandIcon={
          <React.Fragment>
            <Tooltip title="Criar novo turno para o local">
              <Icon>add_icon</Icon>
            </Tooltip>
            {!isExpanded && <Typography>Criar novo turno para o local:</Typography>}
          </React.Fragment>
        }
      >
        {isExpanded && <Button text="Gravar Turno" variants="header" onClick={handleEditTurn} />}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: "new" })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(NewTurnPanel);
