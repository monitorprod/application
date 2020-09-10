import React, { useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import {
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  lodashIsNil,
  lodashSplit
} from "../../utils";
import FormInput from "./FormInput";

const styles = theme => ({
  nested: {
    width: "auto",
    alignItems: "center",
    flexWrap: "nowrap"
  },
  fullWidth: {
    width: "100%"
  },
  inputBootstrap: {
    width: "auto",
    alignItems: "center",
    flexWrap: "nowrap",
    "& div:first-child": {
      flexDirection: "column",
    },
    "& div:last-child": {
      height: "100% !important",
      "& div, & textarea": {
        height: "100% !important",
        padding: '0 !important'
      }
    }
  }
});

const FieldsRow = withStyles(styles, { withTheme: true })(
  ({
    classes,
    fields,
    formItem,
    formErrors,
    handleChange,
    loading,
    query = {},
    options = {},
    deep = 0
  }) => {
    return lodashMap(fields, (field, index) => {
      const isContainer = field.fields || Array.isArray(field);
      const props = {};
      if (isContainer) {
        props.spacing = 2;
      }
      const showIfThis = lodashGet(field, "show.ifThis");
      let useCustomIf = () => { };
      useCustomIf = lodashGet(field, "show.useCustomIf") || useCustomIf;
      const customIfValue = useCustomIf({ data: formItem });
      let showFieldValue = !lodashIsNil(customIfValue)
        ? customIfValue
        : !lodashIsNil(field.show)
          ? field.show
          : true;
      if (showIfThis) {
        showFieldValue = formItem[showIfThis];
      }
      const [showField, setShowField] = useState(showFieldValue);
      useEffect(() => {
        setShowField(showFieldValue);
      }, [showFieldValue]);
      return (
        <React.Fragment key={index}>
          <Grid
            item
            container={isContainer}
            className={classNames(
              {
                [classes.nested]: isContainer && deep !== 0
              },
              lodashMap(lodashSplit(field.variants, " "), key => classes[key])
            )}
            {...props}
          >
            {isContainer && (
              <FieldsRow
                fields={field.fields || field}
                formItem={formItem}
                formErrors={formErrors}
                handleChange={handleChange}
                loading={loading}
                query={query}
                options={options}
                deep={deep + 1}
              />
            )}
            {!isContainer && showField && (
              <FormInput
                field={field}
                formItem={formItem}
                formErrors={formErrors}
                handleChange={handleChange}
                query={query}
                options={options}
                loading={loading}
              />
            )}
          </Grid>
          {field.customData && <Grid item>{field.customData({ data: formItem, field })}</Grid>}
        </React.Fragment>
      );
    });
  }
);

export default FieldsRow;
