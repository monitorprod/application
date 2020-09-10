import React, { useContext } from "react";
import ApiContext from "../../../api";
import {
  withRouter,
  withStyles,
  lodashGet,
  useGetService
} from "../../../utils";
import {
  MasterDataForm,
  MachineMoldProductsTable,
  BreadCrumbs
} from "../../../components";
import ProductsModel from "../products/model";
import MoldProductsList from "./MoldProductsList";
import MoldsModel from "./model";

const styles = theme => ({});

const MasterDataMoldsFormPage = ({ match: { params }, classes }) => {
  const client = useContext(ApiContext);
  const { item: mold, reload } = useGetService({
    model: lodashGet(MoldsModel, "metadata.name"),
    id: lodashGet(params, lodashGet(MoldsModel, "metadata.paramsProp"))
  });
  const { item: product, loading, errors } = useGetService({
    model: lodashGet(ProductsModel, "metadata.name"),
    id: lodashGet(params, lodashGet(ProductsModel, "metadata.paramsProp"))
  });
  const afterSubmit = async ({ data: product }) => {
    await client.service("molds").patch(mold.id, {
      products: [{ ...product, cavities: mold.cavities }]
    });
    reload();
  };
  return (
    <React.Fragment>
      <BreadCrumbs
        links={[
          ...MoldsModel.links,
          {
            text: lodashGet(mold, "id")
              ? mold.name
              : lodashGet(MoldsModel, "metadata.newItemText"),
            href: `${lodashGet(MoldsModel, "metadata.formPath")}/${lodashGet(
              params,
              lodashGet(MoldsModel, "metadata.paramsProp")
            )}`
          },
          {
            text: lodashGet(product, "id")
              ? product.name
              : lodashGet(ProductsModel, "metadata.newItemText"),
            href: `${lodashGet(MoldsModel, "metadata.formPath")}/${lodashGet(
              params,
              lodashGet(MoldsModel, "metadata.paramsProp")
            )}/products/${lodashGet(
              params,
              lodashGet(ProductsModel, "metadata.paramsProp")
            )}`
          }
        ]}
      />
      <MasterDataForm
        model={{
          ...ProductsModel.metadata,
          formPath: `${lodashGet(MoldsModel, "metadata.formPath")}/${lodashGet(
            params,
            lodashGet(MoldsModel, "metadata.paramsProp")
          )}/products`
        }}
        treeModel={MoldsModel.metadata}
        fields={ProductsModel.form}
        data={product}
        query={MoldsModel.query}
        loading={loading}
        errors={errors}
        hooks={{
          afterSubmit
        }}
        options={{
          ...ProductsModel.options,
          dontRedirect: true,
          // TODO make create new work
          dontCreate: true,
          dontDelete: true
        }}
        customContent={{
          afterForm: ({ data }) =>
            data.id && (
              <MachineMoldProductsTable
                options={ProductsModel.options}
                mold={mold}
                product={data}
              />
            ),
          afterTreeItem: ({ data }) =>
            data.id && (
              <MoldProductsList
                model={{ ...MoldsModel.metadata, icon: "style" }}
                mold={data}
              />
            )
        }}
      />
    </React.Fragment>
  );
};

export default withRouter(
  withStyles(styles, { withTheme: true })(MasterDataMoldsFormPage)
);
