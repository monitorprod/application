import React, { useState, useEffect } from "react";
import { List, ListItem, Checkbox, FormControlLabel, Typography } from "@material-ui/core";
import {
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  lodashFind,
  lodashFindIndex,
  useFindService
} from "../../utils";
import NotFound from "../not-found";

const styles = theme => ({
  wrapper: {
    position: "relative"
  },
  option: { padding: `0 ${theme.spacing(2)}px` },
  textField: {
    margin: 0,
    minWidth: 250,
    backgroundColor: theme.palette.common.white,
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
  checkbox: {
    padding: theme.spacing(1),
    minWidth: "unset"
  },
  label: {
    margin: 0
  },
  error: {
    color: "#f44336",
    margin: 0,
    fontSize: "0.75rem",
    // textAlign: "left",
    marginTop: theme.spacing(1)
  }
});

const CheckList = ({ classes, field, formItem, formErrors, query = {}, handleChange }) => {
  // TODO abstrac to a hook shared with checklist
  let hasIdentity = lodashGet(field, "model.hasIdentity");
  let queryField = lodashGet(field, "model.customContent.queryField");
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
  // TODO verify invocation of effects, reduce the ones not needed
  useEffect(() => {
    // console.log(">>> effect findModel", field.identity, findModel);
    setFindModel(findModel);
  }, [findModel, setFindModel]);
  const stringQuery = JSON.stringify(findQuery);
  useEffect(() => {
    // console.log(">>> effect findQuery", field.identity, findQuery);
    setQuery(JSON.parse(stringQuery));
  }, [stringQuery, setQuery]);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    // console.log(">>> effect findList", list);
    if (findModel) {
      setOptions(list);
    }
  }, [list, findModel]);
  const spliceAndPush = async ({
    arraySplice,
    identitySplice,
    arrayPush,
    identityPush,
    field,
    id
  }) => {
    const index = lodashFindIndex(arraySplice, { id });
    if (index !== -1) {
      arraySplice.splice(index, 1);
      await handleChange({
        target: {
          name: identitySplice,
          value: arraySplice
        },
        field
      });
    }
    arrayPush.push({ id });
    return handleChange({
      target: {
        name: identityPush,
        value: arrayPush
      },
      field
    });
  };
  const handleOptionChange = ({ id }) => async data => {
    const checked = lodashGet(data, "target.checked");
    const fieldValue = lodashGet(formItem, field.identity) || [];
    const fieldDeleteValue = lodashGet(formItem, `${field.identity}:delete`) || [];
    if (checked) {
      await spliceAndPush({
        arraySplice: fieldDeleteValue,
        identitySplice: `${field.identity}:delete`,
        arrayPush: fieldValue,
        identityPush: field.identity,
        identity: field.identity,
        field,
        id
      });
    } else {
      await spliceAndPush({
        arraySplice: fieldValue,
        identitySplice: field.identity,
        arrayPush: fieldDeleteValue,
        identityPush: `${field.identity}:delete`,
        field,
        id
      });
    }
  };
  const empty = (!loading && options.length === 0) || (!field.enum && errors);
  const error = lodashGet(formErrors, field.identity);
  const customOptionContent = lodashGet(field, "customContent.customOptionContent");
  return (
    <div className={classes.wrapper}>
      <Typography variant="body1">{field.text}</Typography>
      {!!error && (
        <Typography className={classes.error} variant="body1">
          {typeof error === "string" ? error : "Campo obrigatório."}
        </Typography>
      )}
      <List className={classes.options}>
        {empty && (
          <ListItem disabled>
            <NotFound />
          </ListItem>
        )}
        {!empty &&
          !loading &&
          lodashMap(options, item => (
            <ListItem className={classes.option} button key={item.id}>
              <FormControlLabel
                className={classes.label}
                control={
                  <Checkbox
                    className={classNames(classes.textfield, classes.checkbox)}
                    checked={!!lodashFind(lodashGet(formItem, field.identity), { id: item.id })}
                    name={field.identity}
                    onChange={handleOptionChange({ id: item.id })}
                    color="primary"
                  />
                }
                label={item.name}
              />
              {customOptionContent && customOptionContent({ option: item, field, data: formItem })}
            </ListItem>
          ))}
      </List>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(CheckList);
