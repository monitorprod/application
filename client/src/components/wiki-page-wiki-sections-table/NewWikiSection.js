import React, { useState } from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Tooltip,
  Icon
} from "@material-ui/core";
import { withStyles, lodashIsNil, lodashToUpper } from "../../utils";
import Button from "../buttons";
import Loader from "../loader";
import Form from "./Form";

const styles = theme => ({
  panel: {
    margin: 0
  },
  header: {
    backgroundColor: theme.palette.primary.header
  },
  details: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    padding: theme.spacing(2)
  }
});

const NewWikiSection = ({
  classes,
  loading,
  expanded,
  handleExpand,
  handleSubmit,
  options = {}
}) => {
  const [formItem, setFormItem] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const resetForm = () => {
    setFormErrors({});
    setFormItem({});
    handleExpand({ id: "new" });
  };
  const handleChange = ({ target }) =>
    setFormItem(prev => {
      return {
        ...prev,
        [target.name]: !lodashIsNil(target.value)
          ? lodashToUpper(target.value)
          : target.value || null
      };
    });
  const handleEditWikiSection = e => {
    e.stopPropagation();
    handleSubmit({ wikiSection: formItem, setFormErrors, resetForm });
  };
  const isExpanded = expanded["new"];
  return (
    <React.Fragment>
      <ExpansionPanel
        className={classes.panel}
        expanded={isExpanded}
        onChange={handleExpand({ id: "new" })}
      >
        <ExpansionPanelSummary
          className={classes.header}
          expandIcon={
            <React.Fragment>
              <Tooltip title="Criar nova Seção">
                <Icon>add_icon</Icon>
              </Tooltip>
              {!isExpanded && <Typography>Criar nova Seção:</Typography>}
            </React.Fragment>
          }
        >
          {isExpanded && (
            <Button text="Gravar Seção" variants="header" onClick={handleEditWikiSection} />
          )}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          {loading["new"] && <Loader />}
          <Form
            formItem={formItem}
            formErrors={formErrors}
            handleChange={handleChange}
            options={options}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(NewWikiSection);
