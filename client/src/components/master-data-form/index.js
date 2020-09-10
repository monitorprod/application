import React, { useState, useEffect, useCallback } from "react";
import { Grid, Hidden, Paper } from "@material-ui/core";
import {
  withRouter,
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  lodashFlattenDeep,
  lodashIsNil,
  getPermissions,
  addHooks,
  useUpsertService,
  useDeleteService,
  useAuth
} from "../../utils";
import Loader from "../loader";
import Errors from "../errors";
import Actions from "./Actions";
import Tree from "./Tree";
import FieldsRow from "./FieldsRow";
import useENTER from "./useENTER";
// import useEXIT from "./useEXIT";

const styles = theme => ({
  container: {
    flexWrap: "nowrap",
    overflow: "hidden"
  },
  tree: {
    flex: 1,
    maxWidth: "25%",
    overflowY: "auto",
    overflowX: "hidden"
  },
  wrapper: {
    flex: 1,
    overflowX: "auto"
  },
  form: {
    flex: 1,
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    padding: `${theme.spacing(1)}px 0`
  },
  fullWidth: {
    overflowX: "auto",
    "&>div": {
      width: "100%"
    }
  }
});

const MasterDataForm = ({
  history,
  classes,
  model,
  treeModel,
  fields,
  formErrors: propsFormErrors = {},
  data: propsData,
  query = {},
  hooks = {},
  options = {},
  loading: propsLoading,
  errors: propsErrors,
  customContent = {},
  customActions
}) => {
  const { permissions } = useAuth();
  const [reloadTree, setReloadTree] = useState();
  const [reloadHome, setReloadHome] = useState();
  // const [dirty, setDirty] = useState();
  const reloadTreeHook = useCallback(() => {
    // console.log("!!! useCallback reloadTreeHook");
    const asyncReloadTreeHook = async () => setReloadTree(Date.now());
    asyncReloadTreeHook();
  }, []);
  const reloadHomeHook = useCallback(() => {
    const asyncReloadHomeHook = async () => setReloadHome(Date.now());
    asyncReloadHomeHook();
  });
  const redirectToItemHook = useCallback(
    ({ data }) => {
      // console.log("!!! useCallback redirectToItemHook");
      const asyncRedirectToItemHook = async () => {
        if (lodashGet(propsData, "id") !== data.id && !options.noRedirect) {
          history.push(`${model.formPath}/${data.id}`);
        }
      };
      asyncRedirectToItemHook();
    },
    [history, model.formPath, options.noRedirect, propsData]
  );
  // const cleanFormHook = async () => setDirty();
  const {
    formItem,
    formErrors,
    handleChange,
    handleSubmit: upsertSubmit,
    loading: upsertLoading,
    errors: upsertErrors
  } = useUpsertService({
    model: model.name,
    fields,
    data: propsData,
    hooks: addHooks({
      hooks,
      identity: "afterSubmit",
      hooksToAdd: [
        // cleanFormHook,
        reloadTreeHook,
        redirectToItemHook
      ]
    })
  });
  const redirectToListHook = async () => {
    if (!options.noRedirect) {
      history.push(model.listPath);
    }
  };
  const {
    handleDelete,
    loading: deleteLoading,
    errors: deleteErrors
  } = useDeleteService({
    model: model.name,
    data: propsData,
    hooks: {
      ...addHooks({
        hooks,
        identity: "beforeDelete"
        // hooksToAdd: [cleanFormHook]
      }),
      ...addHooks({
        hooks,
        identity: "afterDelete",
        hooksToAdd: [redirectToListHook, reloadHomeHook]
      })
    }
  });
  useENTER({ fields, options });
  // TODO make this work
  // useEXIT({ history, fields, formItem, loading: propsLoading, dirty });
  const errors = propsErrors || upsertErrors || deleteErrors;
  const loading = propsLoading || upsertLoading || deleteLoading;
  const hasWriteAccess = getPermissions({
    privileges: options.writePermissions,
    permissions
  });
  const hasActions =
    hasWriteAccess &&
    (!options.dontSave ||
      (formItem.id && !options.dontDelete) ||
      (formItem.id && !options.dontCreate));
  const copyData = localStorage.getItem(`copy-${model.name}`);
  const stringCopyData = JSON.stringify(JSON.parse(copyData || "{}"));
  useEffect(() => {
    // console.log("!!! effect copy", stringCopyData);
    let parsedCopyData = JSON.parse(stringCopyData);
    localStorage.removeItem(`copy-${model.name}`);
    if (Object.keys(parsedCopyData).length > 0) {
      setTimeout(
        () =>
          lodashMap(lodashFlattenDeep(fields), field => {
            const value = lodashGet(parsedCopyData, field.identity);
            if (value) {
              handleChange({
                target: {
                  name: field.identity,
                  value
                },
                field
              });
            }
          }),
        0
      );
    }
  }, [stringCopyData, model.name, fields, handleChange]);
  // TODO it's calling again because of the handleChange funtion, use dispatch? useCallback? useMemo on Hooks?
  // useEffect(() => {
  //   console.log("!!! effect handleChange", handleChange);
  // }, [handleChange]);
  const handleSubmit = e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    upsertSubmit(e);
  };
  /* #region  handleSubmitEnter */
  const handleSubmitEnter = e => {
    e.preventDefault();
    if (options.saveOnEnter) {
      if (loading) {
        return;
      }
      upsertSubmit(e);
    }
  };
  /* #endregion */
  // console.log("!! MasterDataForm formItem", formItem);

  const itemIsNull = lodashIsNil(formItem.id) ? false : true

  if (!options.isAdmin && options.chatSupport) {
    options = {
      ...options, readOnly: itemIsNull, dontSave: itemIsNull
    }
  }

  if (options.isAdmin && options.chatSupport) {
    options = {
      ...options,
      readOnly: true
    }
  }

  // console.log(' >> formItem.id: ', formItem.id)
  return (
    <Grid
      container
      spacing={2}
      className={classNames(classes.container, "form-container")}
    >
      {!options.dontShowTree && (
        <Hidden smDown>
          <Grid item className={classes.tree}>
            <Paper elevation={4}>
              {/* Render Tree */}
              <Tree
                model={treeModel || model}
                reload={reloadTree}
                reloadTree={reloadTreeHook}
                query={query}
                customContent={customContent}
              />
            </Paper>
          </Grid>
        </Hidden>
      )}
      <Grid item className={classes.wrapper}>
        {!formItem.id && customContent.replaceNewItem && (
          <Grid>
            {customContent.replaceNewItem({
              reloadHomeHook: reloadHomeHook,
              reloadHome: reloadHome
            })}
          </Grid>
        )}
        {((formItem.id && customContent.replaceNewItem) ||
          (formItem.id && !customContent.replaceNewItem) ||
          (!formItem.id && !customContent.replaceNewItem) ||
          (!formItem.id && customContent.replaceNewItem && !options.isAdmin)) && (
            <Grid
              container
              direction="column"
              component="form"
              onSubmit={handleSubmitEnter}
              className={classNames(classes.container, "form-wrapper")}
            >
              {customContent.beforeForm && (
                <Grid>
                  {customContent.beforeForm({
                    data: formItem,
                  })}
                </Grid>
              )}
              {(options.chatSupport && formItem.id && !options.isAdmin && hasActions) || 
                hasActions && (
                //Button save
                <Actions
                  model={model}
                  fields={fields}
                  formItem={formItem}
                  handleSubmit={handleSubmit}
                  handleDelete={handleDelete}
                  options={options}
                  customContent={customContent}
                  customActions={customActions}
                />
              )}
              {loading && <Loader />}
              {errors && (
                // Errors form
                <Errors
                  errors={
                    customContent.customError
                      ? customContent.customError({ errors })
                      : errors
                  }
                />
              )}
              <Grid item container spacing={2} className={classes.form}>
                <FieldsRow
                  fields={fields}
                  formErrors={{ ...propsFormErrors, ...formErrors }}
                  formItem={formItem}
                  handleChange={handleChange}
                  loading={propsLoading}
                  options={{
                    ...options,
                    readOnly: !hasWriteAccess || options.readOnly
                  }}
                />
                {customContent.afterForm && (
                  <Grid item container spacing={2} className={classes.fullWidth}>
                    {customContent.afterForm({
                      data: formItem,
                      handleChange: handleChange,
                      reloadTree: reloadTreeHook,
                      handleSubmit: handleSubmit
                    })}
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
      </Grid>
    </Grid>
  );
};

export default withRouter(
  withStyles(styles, { withTheme: true })(MasterDataForm)
);
