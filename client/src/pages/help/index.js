import React from "react";
import { Grid } from "@material-ui/core";
import { withStyles, lodashForEach, lodashFlattenDeep, useAuth } from "../../utils";
import {
  withMasterDataFormPage,
  WikiPageWikiSectionsTable,
  MasterDataForm
} from "../../components";
import WikiPagesModel from "./model";
import TreeItem from "./TreeItem";
import Home from './home';

const styles = theme => ({
  item: {
    paddingLeft: `${theme.spacing(2)}px`
  }
});

const WikiPage = ({ classes }) => {
  const { session } = useAuth();
  const isAdminApp = session && session.isAdmin;
  const fields = lodashFlattenDeep(WikiPagesModel.form);
  if (!isAdminApp) {
    lodashForEach(fields, field => (field.variants = "wiki"));
  } else {
    lodashForEach(fields, field => (field.variants = ""));
  }
  return withMasterDataFormPage({
    ...WikiPagesModel,
    options: {
      ...WikiPagesModel.options,
      readOnly: !isAdminApp,
      dontSave: !isAdminApp,
      dontDelete: !isAdminApp,
      dontCreate: !isAdminApp
    },
    customContent: {
      afterForm: ({ data }) =>
        data.id && (
          <React.Fragment>
            <WikiPageWikiSectionsTable
              options={{
                readOnly: !isAdminApp
              }}
              wikiPage={data}
            />
          </React.Fragment>
        ),
      afterTreeItem: ({ data, reloadTree }) =>
        data.id && <TreeItem data={data} reloadTree={reloadTree} isAdminApp={isAdminApp} />,
      afterTree: ({ reloadTree }) =>
        isAdminApp && (
          <Grid item className={classes.item}>
            <MasterDataForm
              model={WikiPagesModel.metadata}
              fields={WikiPagesModel.tree}
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
      replaceNewItem: () =>
        <Home />
    }
  });
};

export default withStyles(styles, { withTheme: true })(WikiPage);
