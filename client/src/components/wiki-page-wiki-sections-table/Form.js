import React from "react";
import { Grid } from "@material-ui/core";
import { withStyles, lodashForEach, lodashFlattenDeep } from "../../utils";
import FieldsRow from "../master-data-form/FieldsRow";
import WikiPagesModel from "./model";

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

const WikiSectionForm = ({ classes, formItem, formErrors, handleChange, options = {} }) => {
  const fields = lodashFlattenDeep(WikiPagesModel.form);
  if (options.readOnly) {
    lodashForEach(fields, field => (field.variants = "wiki"));
  } else {
    lodashForEach(fields, field => (field.variants = ""));
  }
  return (
    <Grid container direction="column" spacing={2} className={classes.container}>
      <Grid item>
        <FieldsRow
          fields={options.readOnly ? WikiPagesModel.form[0].slice(1) : WikiPagesModel.form}
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          options={options}
        />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(WikiSectionForm);
