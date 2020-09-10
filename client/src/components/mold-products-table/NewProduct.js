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

const NewProductPanel = ({
  classes,
  expanded,
  handleExpand,
  handleSubmit,
  FormRef,
  setFormRef
}) => {
  const handleEditProduct = e => {
    e.stopPropagation();
    handleSubmit();
  };
  const isExpanded = expanded === "new";
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ id: "new", productId: "new" })}
    >
      <ExpansionPanelSummary
        className={classes.header}
        expandIcon={
          <React.Fragment>
            <Tooltip title="Criar novo produto para o molde">
              <Icon>add_icon</Icon>
            </Tooltip>
            {!isExpanded && <Typography>Criar novo produto para o molde:</Typography>}
          </React.Fragment>
        }
      >
        {isExpanded && (
          <Button text="Gravar Produto" variants="header" onClick={handleEditProduct} />
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: "new" })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(NewProductPanel);
