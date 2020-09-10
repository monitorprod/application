import React, { useState } from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Icon
} from "@material-ui/core";
import { withStyles, lodashGet, lodashIsNil, lodashToUpper } from "../../utils";
import Button from "../buttons";
import Loader from "../loader";
import Form from "./Form";

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
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    padding: theme.spacing(2)
  }
});

const WikiSectionPanel = ({
  classes,
  wikiSection,
  loading,
  expanded,
  handleExpand,
  handleSubmit,
  handleDelete,
  options = {}
}) => {
  const [formItem, setFormItem] = useState({ ...wikiSection });
  const [formErrors, setFormErrors] = useState({});
  const resetForm = () => {
    setFormErrors({});
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
  const handleDeleteWikiSection = e => {
    e.stopPropagation();
    handleDelete({ wikiSection });
  };
  const isExpanded = expanded[wikiSection.id];
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ id: wikiSection.id })}
    >
      <ExpansionPanelSummary className={classes.header} expandIcon={<Icon>expand_more_icon</Icon>}>
        <Typography>{lodashGet(wikiSection, "name")}</Typography>
        {isExpanded && (
          <React.Fragment>
            {!options.readOnly && (
              <Button text="Gravar Seção" variants="header" onClick={handleEditWikiSection} />
            )}
            {!options.readOnly && (
              <Button
                text="Remover da Página"
                variants="delete header"
                onClick={handleDeleteWikiSection}
              />
            )}
          </React.Fragment>
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
        {loading[wikiSection.id] && <Loader />}
        <Form
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          options={options}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(WikiSectionPanel);
