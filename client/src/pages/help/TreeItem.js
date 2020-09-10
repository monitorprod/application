import React, { useState, useCallback } from "react";
import { Grid } from "@material-ui/core";
import { withStyles } from "../../utils";
import { MasterDataForm, Tree } from "../../components";
import WikiPagesModel from "./model";

const styles = theme => ({
  item: {
    paddingLeft: ({ deep = 0 }) => `${theme.spacing(2 * (deep + 2))}px`
  }
});

const TreeItem = withStyles(styles, { withTheme: true })(
  ({ data, deep = 0, classes, isAdminApp }) => {
    const [reloadTree, setReloadTree] = useState();
    const reloadTreeHook = useCallback(() => {
      const asyncReloadTreeHook = async () => setReloadTree(Date.now());
      asyncReloadTreeHook();
    }, []);
    return (
      <Grid>
        <Tree
          model={{ ...WikiPagesModel.metadata }}
          reload={reloadTree}
          reloadTree={reloadTreeHook}
          query={{ wikiPageId: data.id }}
          deep={deep + 1}
          options={{
            dontShowNotFound: !isAdminApp
          }}
          customContent={{
            afterTree: ({ reloadTree }) =>
              isAdminApp && (
                <Grid item className={classes.item}>
                  <MasterDataForm
                    model={WikiPagesModel.metadata}
                    fields={WikiPagesModel.tree}
                    data={{
                      wikiPageId: data.id
                    }}
                    hooks={{
                      afterSubmit: reloadTree
                    }}
                    options={{
                      ...WikiPagesModel.options,
                      dontSave: true,
                      dontCreate: true,
                      dontDelete: true,
                      dontShowTree: true,
                      saveOnEnter: true
                    }}
                  />
                </Grid>
              ),
            afterTreeItem: ({ data, reloadTree }) =>
              data.id && (
                <TreeItem
                  data={data}
                  reload={reloadTree}
                  reloadTree={reloadTreeHook}
                  deep={deep + 1}
                  isAdminApp={isAdminApp}
                />
              )
          }}
        />
      </Grid>
    );
  }
);

export default TreeItem;
