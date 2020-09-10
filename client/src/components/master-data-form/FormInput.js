import React, { useRef, useState, useEffect } from "react";
import {
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  InputBase
} from "@material-ui/core";
import { DatePicker, DateTimePicker, TimePicker } from "@material-ui/pickers";
import {
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  lodashSplit,
  lodashIsNil,
  lodashToLower
} from "../../utils";
import useDEFAULT from "./useDEFAULT";
import AutoComplete from "./AutoComplete";
import IntegerInput from "./IntegerInput";
import CheckList from "./CheckList";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const styles = theme => ({
  textField: {
    margin: 0,
    minWidth: 250,
    //backgroundColor: theme.palette.common.white,
    '& input,& div[aria-haspopup="true"]': {
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
    },
    '& label[data-shrink="false"]': {
      top: -12
    },
    [theme.breakpoints.down("md")]: {
      minWidth: 200
    },
    [theme.breakpoints.down("xs")]: {
      minWidth: 170
    }
  },
  inputBootstrap: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.common.white,
    border: "1px solid #ced4da",
    fontSize: 14,
    width: "auto",
    "& div": {
      padding: "0 !important"
    },
    "& ::before": {
      display: "none"
    },
    "& ::after": {
      display: "none"
    }
  },
  checkboxLabel: {
    marginLeft: `-${theme.spacing(1)}px`
  },
  checkbox: {
    padding: theme.spacing(1),
    minWidth: "unset"
  },
  editor: {
    backgroundColor: theme.palette.common.white
  },
  readOnly: {
    backgroundColor: theme.palette.primary.form,
    pointerEvents: "none"
  },
  disabled: {
    backgroundColor: theme.palette.primary.form,
    pointerEvents: "none"
  },
  fullWidth: {
    width: "100%",
    minWidth: "100%"
  },
  short: {
    width: 80,
    minWidth: "unset"
  },
  setup: {
    width: 225,
    minWidth: "unset",
    [theme.breakpoints.down("md")]: {
      width: 150
    }
  },
  wiki: {
    background: "none",
    "& label, & :before": {
      display: "none"
    },
    "& > div": {
      margin: 0
    },
    "& input": {
      padding: 0
    }
  },
  display: {
    width: "100%",
    // background: "none",
    "& fieldset": {
      border: "none"
    }
  },
  error: {
    color: "#f44336",
    margin: 0,
    fontSize: "0.75rem",
    // textAlign: "left",
    marginTop: theme.spacing(1)
  },
  contact: {
    backgroundColor: "transparent !important"
  }
});

const getInputType = ({ type }) => {
  switch (type) {
    case "integer":
    case "decimal":
    case "year":
      return "number";
    case "date":
    case "datetime":
    case "string":
    default:
      return "text";
  }
};

const getInputValue = ({ formItem, field }) => {
  let value = lodashGet(formItem, field.identity);
  value = !lodashIsNil(value) ? value : "";
  switch (field.type) {
    case "date":
    case "datetime":
    case "time":
      return new Date(value || Date.now());
    default:
      return value;
  }
};

const getInputComponent = ({ field }) => {
  switch (field.type) {
    case "date":
      return DatePicker;
    case "datetime":
      return DateTimePicker;
    case "time":
      return TimePicker;
    default:
      return TextField;
  }
};

const getInputFormat = ({ field }) => {
  switch (field.type) {
    case "date":
      return "DD/MM/YYYY";
    case "datetime":
      return "DD/MM/YYYY HH:mm";
    case "time":
      return "HH:mm";
    default:
      return "";
  }
};

const FormInput = ({
  classes,
  field,
  formItem,
  formErrors,
  loading,
  query = {},
  options = {},
  handleChange = () => { }
}) => {
  const inputRef = useRef();
  const type = getInputType(field);
  const value = getInputValue({ formItem, field });
  // TODO requiredIf
  const required =
    typeof field.required === "boolean"
      ? field.required
      : !!lodashGet(formItem, field.required);
  const InputProps = {};
  if (field.type === "integer") {
    InputProps.inputComponent = IntegerInput;
  }
  if (field.autoFocus) {
    InputProps.autoFocus = true;
  }
  const disabled = !lodashIsNil(field.disabled)
    ? field.disabled
    : !lodashIsNil(options.disabled)
      ? options.disabled
      : false;
  const readOnlyIfThis = lodashGet(field, "readOnly.ifThis");
  const readOnlyUntil = lodashGet(field, "readOnly.until");
  const readOnlyCustomIf = lodashGet(field, "readOnly.customIf");
  const variantsCustomIf = lodashGet(field, "variants.useVariantIf");
  let useCustomIf = () => { };
  let useVariantIf = () => { };
  useCustomIf = lodashGet(field, "readOnly.useCustomIf") || useCustomIf;
  useVariantIf = lodashGet(field, "variants.useVariantIf") || useVariantIf;
  const customIfValue = useCustomIf({ data: formItem });
  const variantIfValue = useVariantIf({ data: formItem })
  let readOnlyValue = !lodashIsNil(customIfValue)
    ? customIfValue
    : !lodashIsNil(field.readOnly)
      ? field.readOnly
      : !lodashIsNil(options.readOnly)
        ? options.readOnly
        : false;
  let variantsValue = !lodashIsNil(variantIfValue)
    ? variantIfValue
    : !lodashIsNil(field.variants)
      ? field.variants
      : false;
  if (readOnlyUntil) {
    readOnlyValue = !lodashGet(formItem, readOnlyUntil);
  }
  if (readOnlyIfThis) {
    readOnlyValue = !!lodashGet(formItem, readOnlyIfThis);
  }
  if (readOnlyCustomIf) {
    readOnlyValue = readOnlyCustomIf({ data: formItem });
  }
  if (variantsCustomIf) {
    variantsValue = variantsCustomIf({ data: formItem })
  }
  const [readOnly, setReadOnly] = useState(readOnlyValue);
  const [variants, setVariants] = useState(variantsValue);
  useEffect(() => {
    // console.log("!!!readOnly", readOnlyValue);
    setReadOnly(readOnlyValue);
  }, [readOnlyValue]);
  useEffect(() => {
    // console.log('!!!variants', variantsValue)
    setVariants(variantsValue);
  }, [variantsValue])
  if (readOnly) {
    InputProps.readOnly = true;
  }
  useEffect(() => {
    if (field.max && inputRef.current) {
      inputRef.current.maxLength = field.max;
    }
  }, [field.max]);
  useEffect(() => {
    if (!lodashIsNil(field.maxValue) && inputRef.current) {
      inputRef.current.max = field.maxValue;
    }
  }, [field.maxValue]);
  useEffect(() => {
    if (!lodashIsNil(field.minValue) && inputRef.current) {
      inputRef.current.min = field.minValue;
    }
  }, [field.minValue]);
  useDEFAULT({ field, formItem, value, loading, handleChange });
  const Component = getInputComponent({ field });
  const format = getInputFormat({ field });
  const handleInputChange = data => {
    if (field.type === "boolean") {
      return handleChange({
        target: {
          name: field.identity,
          value: lodashGet(data, "target.checked")
        },
        field
      });
    }
    if (data.target) {
      return handleChange({ target: data.target, field });
    }
    return handleChange({
      target: { name: field.identity, value: data.toISOString() },
      field
    });
  };
  const error = lodashGet(formErrors, field.identity);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  useEffect(() => {
    if (field.type === "content") {
      const contentBlock = htmlToDraft(value);
      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      if (
        lodashToLower(
          draftToHtml(convertToRaw(editorState.getCurrentContent()))
        ) !== lodashToLower(value)
      ) {
        // console.log(
        //   "!!!effect editorState",
        //   value,
        //   draftToHtml(convertToRaw(editorState.getCurrentContent()))
        // );
        setEditorState(EditorState.createWithContent(contentState));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const TextFieldProps = {
    error: !!error,
    helperText: !!error
      ? typeof error === "string"
        ? error
        : "Campo obrigatório."
      : "",
    disabled: !!disabled,
    required: required,
    name: field.identity,
    label: field.text,
    margin: "normal",
    // variant: "outlined",
    className: classNames(
      classes.textField,
      {
        [classes.readOnly]: readOnly,
        [classes.disabled]: disabled
      },
      lodashMap(lodashSplit(variants, " "), key => classes[key]),
      lodashMap(lodashSplit(field.variants, " "), key => classes[key])
    )
  };
  if (field.type === "time") {
    TextFieldProps.ampm = false;
    TextFieldProps.disableOpenOnEnter = true;
    TextFieldProps.keyboard = true;
  }
  if (field.type === "datetime") {
    TextFieldProps.ampm = false;
  }
  if (field.type === "checklist") {
    return (
      <CheckList
        field={field}
        query={query}
        formItem={formItem}
        formErrors={formErrors}
        handleChange={handleChange}
      />
    );
  }
  if (!!field.model || !!field.enum) {
    // TODO dont sent formItem nor handleChange, use dispatch
    return (
      <AutoComplete
        field={field}
        query={query}
        formItem={formItem}
        value={value}
        handleChange={handleChange}
        TextFieldProps={TextFieldProps}
        InputProps={InputProps}
      />
    );
  }
  if (field.type === "content") {
    return (
      <div className={classNames({ [classes.editor]: !readOnly })}>
        {!!error && (
          <Typography className={classes.error} variant="body1">
            {typeof error === "string" ? error : "Campo obrigatório."}
          </Typography>
        )}
        <Editor
          readOnly={readOnly}
          toolbarHidden={readOnly}
          editorState={editorState}
          wrapperClassName="demo-wrapper"
          editorClassName="demo-editor"
          onEditorStateChange={editorState => {
            setEditorState(editorState);
            handleChange({
              target: {
                name: field.identity,
                value: editorState
                  ? draftToHtml(convertToRaw(editorState.getCurrentContent()))
                  : ""
              },
              field
            });
          }}
        />
      </div>
    );
  }
  if (field.type === "boolean") {
    return (
      <FormControlLabel
        className={classes.checkboxLabel}
        control={
          <Checkbox
            className={classNames(classes.textfield, classes.checkbox)}
            checked={!!lodashGet(formItem, field.identity)}
            name={field.identity}
            onChange={handleInputChange}
            disabled={readOnly}
            color="primary"
          />
        }
        label={field.text}
      />
    );
  }
  return (
    <Component
      // defaultValue=""
      // placeholder=""
      // fullWidth
      format={format}
      type={type}
      value={value}
      checked={value}
      onChange={handleInputChange}
      InputProps={InputProps}
      inputRef={ref => (inputRef.current = ref)}
      multiline={field.type === "longtext"}
      {...TextFieldProps}
    />
  );
};

export default withStyles(styles, { withTheme: true })(FormInput);
