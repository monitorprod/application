import React from "react";
import { Portal, Grid } from "@material-ui/core";
import { withStyles } from "../../utils";
import FieldsRow from "../master-data-form/FieldsRow";

const styles = theme => ({
  container: {
    flexWrap: "nowrap",
    "& .form-container": {
      margin: 0,
      width: "100%",
      "&>div": {
        padding: 0
      }
    },
    "& .form-wrapper>div": {
      overflowY: "hidden"
    }
  }
});

const TurnForm = ({
  classes,
  fields,
  formItem,
  formErrors,
  handleChange,
  FormRef,
  options = {}
}) => (
  <Portal container={FormRef.current}>
    <Grid container direction="column" spacing={2} className={classes.container}>
      <Grid item>
        <FieldsRow
          fields={fields}
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          options={options}
        />
      </Grid>
    </Grid>
  </Portal>
);

export default withStyles(styles, { withTheme: true })(TurnForm);
