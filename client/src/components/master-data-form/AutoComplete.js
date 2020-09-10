import React, { useRef, useState, useEffect } from "react";
import Downshift from "downshift";
import { TextField, Popper, Paper, MenuItem, Avatar, Icon, Typography } from "@material-ui/core";
import {
  withStyles,
  lodashGet,
  lodashMap,
  lodashDeburr,
  lodashDebounce,
  lodashToLower,
  lodashTrim,
  useGetService,
  useFindService
} from "../../utils";
import NotFound from "../not-found";
import Loader from "../loader";
import Button from "../buttons";
// TODO make this work
// import FormMenu from "./FormMenu";

const styles = theme => ({
  popper: {
    zIndex: 10,
    minWidth: 300
  },
  wrapper: {
    position: "relative"
  },
  menu: {
    marginTop: theme.spacing(1),
    minWidth: 300,
    maxHeight: 300,
    overflowY: "auto"
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
});

const AutoComplete = ({
  classes,
  field,
  formItem,
  query = {},
  value,
  handleChange,
  TextFieldProps = {},
  InputProps = {}
}) => {
  // TODO abstrac to a hook shared with checklist
  let hasIdentity = lodashGet(field, "model.hasIdentity");
  let queryField = lodashGet(field, "model.customContent.queryField");
  let modelCustomName = lodashGet(field, "model.customName");
  const sortQuery = {};
  if (hasIdentity) {
    sortQuery.identity = 1;
  } else if (queryField) {
    sortQuery[queryField] = 1;
  } else {
    sortQuery.name = 1;
  }
  // let findQuery = { ...query, $limit: 5, $sort: { ...sortQuery } };
  let findQuery = { ...query, $sort: { ...sortQuery } };
  let findModel = field.model || "";
  const modelThis = lodashGet(field, "model.this");
  if (modelThis) {
    findModel = lodashGet(formItem, modelThis);
  }
  const modelService = lodashGet(field, "model.service");
  const modelQuery = lodashGet(field, "model.query");
  let useCustomQuery = () => {};
  if (modelService) {
    if (modelQuery) {
      findQuery = { ...findQuery, ...modelQuery };
    }
    useCustomQuery = lodashGet(field, "model.useCustomQuery") || useCustomQuery;
    findModel = modelService;
  }
  // console.log("!!!useCustomQuery", useCustomQuery({ data: formItem }));
  findQuery = { ...findQuery, ...useCustomQuery({ data: formItem }) };
  const { list, loading, errors, setModel: setFindModel, setQuery } = useFindService({
    model: findModel,
    query: findQuery
  });
  const { item, loading: getLoading, setModel: setGetModel } = useGetService({
    model: findModel,
    id: value
  });
  // TODO verify invocation of effects, reduce the ones not needed
  useEffect(() => {
    // console.log(">>> effect findModel", field.identity, findModel);
    setFindModel(findModel);
    setGetModel(findModel);
  }, [setFindModel, setGetModel, findModel]);
  // TODO really a need for this stringify?
  const stringFindQuery = JSON.stringify(findQuery);
  useEffect(() => {
    // console.log(">>> effect findQuery", field.identity, findQuery);
    setQuery(JSON.parse(stringFindQuery));
  }, [setQuery, stringFindQuery]);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // TODO test this effect more
    // console.log(">>> effect findList", list, field.identity);
    if (findModel) {
      setOptions(list);
    }
  }, [findModel, list]);
  useEffect(() => {
    // console.log(">>> effect field.enum", field.enum);
    if (field.enum) {
      setOptions(lodashMap(field.enum, value => ({ id: value, name: value })));
    }
  }, [field.enum]);
  // TODO support custom fields for search
  const updateQuery = lodashDebounce(({ value }) => {
    const inputValue = lodashToLower(lodashDeburr(lodashTrim(value)));
    let query = {};
    if (hasIdentity) {
      query.$or = [
        {
          identity: {
            $like: `%${inputValue}%`
          }
        },
        {
          name: {
            $like: `%${inputValue}%`
          }
        }
      ];
    } else if (queryField) {
      query[queryField] = {
        $like: `%${inputValue}%`
      };
      if (modelQuery && modelQuery[queryField]) {
        query[queryField] = { ...query[queryField], ...modelQuery[queryField] };
      }
    } else {
      query.name = {
        $like: `%${inputValue}%`
      };
      if (modelQuery && modelQuery.name) {
        query.name = { ...query.name, ...modelQuery.name };
      }
    }
    setQuery(prev => ({
      ...prev,
      ...query
    }));
  }, 300);
  const handleMenuChange = selectedItem => {
    // console.log("!!!handleMenuChange", selectedItem, item);
    const selectedValue = lodashGet(selectedItem, "id") || null;
    if (`${lodashGet(item, "id")}` !== `${selectedValue}`) {
      handleChange({
        target: {
          name: field.identity,
          value: selectedValue
        },
        field
      });
    }
    if (selectedValue) {
      handleBlur();
    }
  };
  const handleSearch = inputValue => updateQuery({ value: inputValue });
  // TODO support custom string value
  const getStringValue = item =>
    modelCustomName
      ? modelCustomName({ data: item })
      : `${lodashGet(item, "identity") ? `${lodashGet(item, "identity")} - ` : ""}${lodashGet(
          item,
          "name"
        ) || ""}`;
  const empty = (!loading && options.length === 0) || (!field.enum && errors);
  const DownshiftRef = useRef(null);
  const PopperRef = useRef(null);
  useEffect(() => {
    // console.log("!! effect AutoComplete item", item, field.identity);
    if (getLoading || field.enum) {
      return;
    }
    // console.log("effectItem", lodashGet(item, "id"), value, formItem[field.identity]);
    if (lodashGet(item, "id") && DownshiftRef.current) {
      DownshiftRef.current.selectItem(item);
    } else {
      DownshiftRef.current.selectItem(null);
    }
  }, [item, getLoading, field.enum]);
  const enumValue = lodashGet(formItem, field.identity);
  useEffect(() => {
    // console.log("!!!!effect enumValue", field.enum, enumValue, DownshiftRef.current);
    if (field.enum && enumValue && DownshiftRef.current) {
      DownshiftRef.current.selectItem({
        id: enumValue,
        name: enumValue,
        value: enumValue
      });
    }
  }, [enumValue, field.enum]);
  const [focused, setFocused] = useState();
  const handleFocus = e => {
    e.target.select();
    setFocused(true);
  };
  const handleBlur = () => setFocused(false);
  const handleClear = () => {
    window.localStorage.setItem(`dont-default${field.identity}`, true);
    DownshiftRef.current.selectItem(null);
  };
  return (
    <React.Fragment>
      <Downshift
        ref={ref => (DownshiftRef.current = ref)}
        onChange={handleMenuChange}
        onInputValueChange={handleSearch}
        itemToString={getStringValue}
      >
        {({ getInputProps, getItemProps, getMenuProps, isOpen, inputValue }) => (
          <div className={classes.wrapper}>
            <TextField
              InputProps={{
                inputRef: ref => (PopperRef.current = ref),
                ...InputProps,
                ...getInputProps(),
                onFocus: handleFocus,
                onBlur: handleBlur
              }}
              {...TextFieldProps}
            />
            {!TextFieldProps.disabled && !InputProps.readOnly && value && (
              <Button
                type="icon"
                text="Deletar"
                icon="close"
                variants="deleteAction clearAction"
                onClick={handleClear}
              />
            )}
            <Popper
              open={focused || isOpen}
              anchorEl={PopperRef.current}
              className={classes.popper}
            >
              <Paper
                square
                style={{
                  width: PopperRef.current ? PopperRef.current.clientWidth : null
                }}
                className={classes.menu}
              >
                {empty && (
                  <MenuItem disabled>
                    <NotFound />
                  </MenuItem>
                )}
                {!empty &&
                  (!!inputValue || !loading) &&
                  lodashMap(options, item => (
                    <MenuItem
                      {...getItemProps({ item })}
                      key={item.id}
                      value={item.id}
                      selected={value === item.id}
                    >
                      {/** TODO support custom select render */}
                      {item.image && (
                        <Avatar alt={item.name} src={item.image} className={classes.avatar} />
                      )}
                      {!item.image && field.icon && field.icon.type === "svg" && (
                        <img className={classes.avatar} alt="icon" src={field.icon.src} />
                      )}
                      {!item.image && field.icon && !field.icon.type && (
                        <Icon className={classes.avatar}>{field.icon}</Icon>
                      )}
                      {!modelCustomName && (
                        <Typography variant="body1">
                          {item.identity ? `${item.identity} - ` : ""}
                          {item.name}
                        </Typography>
                      )}
                      {modelCustomName && (
                        <Typography variant="body1">{modelCustomName({ data: item })}</Typography>
                      )}
                    </MenuItem>
                  ))}
              </Paper>
            </Popper>
          </div>
        )}
      </Downshift>
      {field.loading && <Loader />}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(AutoComplete);
