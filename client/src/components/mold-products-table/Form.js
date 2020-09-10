import React from "react";
import { Portal, Grid } from "@material-ui/core";
import { withStyles, lodashGet, useGetService } from "../../utils";
import { ProductsModel } from "../../pages/master-data/models";
import MasterDataForm from "../master-data-form";
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

const ProductForm = ({
  classes,
  fields,
  mold,
  formItem,
  formErrors,
  handleChange,
  afterChange,
  FormRef,
  options = {}
}) => {
  const { item: productItem, loading: productLoading, errors: productErrors } = useGetService({
    model: lodashGet(ProductsModel, "metadata.name"),
    id: formItem.productId
  });
  return (
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
        {formItem.productId && (
          <Grid item>
            <MasterDataForm
              model={ProductsModel.metadata}
              fields={ProductsModel.form}
              data={productItem}
              formErrors={formErrors}
              loading={productLoading}
              errors={productErrors}
              hooks={{
                afterChange
              }}
              options={{
                ...ProductsModel.options,
                noRedirect: true,
                dontSave: true,
                dontCreate: true,
                dontDelete: true,
                dontShowTree: true
              }}
            />
          </Grid>
        )}
      </Grid>
    </Portal>
  );
};

export default withStyles(styles, { withTheme: true })(ProductForm);
