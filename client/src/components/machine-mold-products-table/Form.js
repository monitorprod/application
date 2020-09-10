import React from "react";
import { Portal, Grid } from "@material-ui/core";
import { withStyles } from "../../utils";
import FieldsRow from "../master-data-form/FieldsRow";

const styles = theme => ({});

const MachineMoldProductForm = ({
  classes,
  fields,
  formItem,
  formErrors,
  handleChange,
  FormRef,
  options = {}
}) => (
  <Portal container={FormRef.current}>
    <Grid item container spacing={2}>
      <FieldsRow
        fields={fields}
        formItem={formItem}
        formErrors={formErrors}
        handleChange={handleChange}
        options={options}
      />
    </Grid>
  </Portal>
);

export default withStyles(styles, { withTheme: true })(MachineMoldProductForm);
