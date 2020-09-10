import React from "react";
import { withStyles, lodashGet, useAuth } from "../../../utils";
import { withMasterDataFormPage, MoldProductsTable } from "../../../components";
import MoldProductsList from "./MoldProductsList";
import MoldsModel from "./model";

const styles = theme => ({});

const MasterDataMoldsFormPage = ({ classes }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  return withMasterDataFormPage({
    ...MoldsModel,
    customContent: {
      afterForm: ({ data, reloadTree }) =>
        data.id &&
        level === "N1" && (
          <MoldProductsTable
            options={MoldsModel.options}
            mold={data}
            reloadTree={reloadTree}
          />
        ),
      afterTreeItem: ({ data }) =>
        data.id &&
        level === "N1" && (
          <MoldProductsList
            model={{ ...MoldsModel.metadata, icon: "style" }}
            mold={data}
          />
        )
    }
  });
};

export default withStyles(styles, { withTheme: true })(MasterDataMoldsFormPage);
