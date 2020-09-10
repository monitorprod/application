import React from "react";
import {
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
  Icon
} from "@material-ui/core";
import { Link, withStyles, lodashGet } from "../../utils";
import { MoldsModel } from "../../pages/master-data/models";
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

const ProductPanel = ({
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
  const handleEditProduct = ({ data }) => e => {
    e.stopPropagation();
    handleSubmit({ product: data.product });
  };
  const handleDeleteProduct = ({ data }) => e => {
    e.stopPropagation();
    handleDelete({ product: data.product });
  };
  const isExpanded = expanded === data.productId;
  return (
    <ExpansionPanel
      className={classes.panel}
      expanded={isExpanded}
      onChange={handleExpand({ ...data, id: data.productId })}
    >
      <ExpansionPanelSummary className={classes.header} expandIcon={<Icon>expand_more_icon</Icon>}>
        <Typography>
          {lodashGet(data, "product.identity")} - {lodashGet(data, "product.name")} ({data.cavities}{" "}
          Cavidades)
        </Typography>
        {isExpanded && (
          <React.Fragment>
            {!options.readOnly && (
              <Button
                text="Gravar Produto"
                variants="header"
                onClick={handleEditProduct({ data })}
              />
            )}
            {!options.readOnly && (
              <Button
                text="Remover do Molde"
                variants="delete header"
                onClick={handleDeleteProduct({ data })}
              />
            )}
            <Button
              text="Setups"
              variants="submit header"
              component={Link}
              to={`${lodashGet(MoldsModel, "metadata.formPath")}/${data.moldId}/products/${
                data.productId
              }`}
            />
          </React.Fragment>
        )}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details} ref={setFormRef({ id: data.productId })}>
        {!FormRef.current && <Typography>Placeholder</Typography>}
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default withStyles(styles, { withTheme: true })(ProductPanel);
