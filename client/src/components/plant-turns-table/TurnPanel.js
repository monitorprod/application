import React from "react";
import moment from "moment";
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

const TurnPanel = ({
  classes,
  turn,
  expanded,
  handleExpand,
  handleSubmit,
  handleDelete,
  FormRef,
  setFormRef,
  options = {}
}) => {
  const handleEditTurn = e => {
    e.stopPropagation();
    handleSubmit({ turn });
  };
  const handleDeleteTurn = e => {
    e.stopPropagation();
    handleDelete({ turn });
  };
  const isExpanded = expanded === turn.id;
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ ...turn, id: turn.id })}
    >
      <ExpansionPanelSummary className={classes.header} expandIcon={<Icon>expand_more_icon</Icon>}>
        <Typography>
          {lodashGet(turn, "name")} ({moment(lodashGet(turn, "startTime")).format("HH:mm")}-
          {moment(lodashGet(turn, "endTime")).format("HH:mm")}{" "}
          {lodashGet(turn, "monday") ? "Seg" : ""} {lodashGet(turn, "tuesday") ? "Ter" : ""}{" "}
          {lodashGet(turn, "wednesday") ? "Qua" : ""} {lodashGet(turn, "thursday") ? "Qui" : ""}{" "}
          {lodashGet(turn, "friday") ? "Sex" : ""} {lodashGet(turn, "saturday") ? "Sab" : ""}{" "}
          {lodashGet(turn, "sunday") ? "Dom" : ""})
        </Typography>
        {isExpanded && (
          <React.Fragment>
            {!options.readOnly && (
              <Button text="Gravar Turno" variants="header" onClick={handleEditTurn} />
            )}
            {!options.readOnly && (
              <Button text="Remover" variants="delete header" onClick={handleDeleteTurn} />
            )}
          </React.Fragment>
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: turn.id })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(TurnPanel);
