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

const HolidayPanel = ({
  classes,
  holiday,
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
    handleSubmit({ holiday });
  };
  const handleDeleteTurn = e => {
    e.stopPropagation();
    handleDelete({ holiday });
  };
  const isExpanded = expanded === holiday.id;
  const startDate = moment(lodashGet(holiday, "startDate"));
  const endDate = moment(lodashGet(holiday, "endDate"));
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ ...holiday, id: holiday.id })}
    >
      <ExpansionPanelSummary className={classes.header} expandIcon={<Icon>expand_more_icon</Icon>}>
        <Typography>
          {lodashGet(holiday, "name")} ({startDate.format("DD/MM/YYYY")}
          {!startDate.isSame(endDate, "day")
            ? `-
          ${endDate.format("DD/MM/YYYY")}`
            : ""}{" "}
          {lodashGet(holiday, "noWorkDay") ? "Não Trabalhado" : ""}{" "}
          {lodashGet(holiday, "recurring") ? "Recorrente" : ""})
        </Typography>
        {isExpanded && (
          <React.Fragment>
            {!options.readOnly && (
              <Button text="Gravar Feriado" variants="header" onClick={handleEditTurn} />
            )}
            {!options.readOnly && !lodashGet(holiday, "isSystemHoliday") && (
              <Button text="Remover" variants="delete header" onClick={handleDeleteTurn} />
            )}
          </React.Fragment>
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: holiday.id })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(HolidayPanel);
