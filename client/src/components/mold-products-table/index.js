import React, { useRef, useContext, useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  lodashForEach,
  lodashSplit,
  lodashFind,
  lodashFlattenDeep,
  getPermissions,
  validateForm,
  useFindService,
  useAuth
} from "../../utils";
import { ProductsModel } from "../../pages/master-data/models";
import { form as fields } from "./model";
import NewProductPanel from "./NewProduct";
import AddProductPanel from "./AddProduct";
import ProductPanel from "./ProductPanel";
import Form from "./Form";

const styles = theme => ({});

const MoldProductsTable = ({ classes, mold, reloadTree, options = {} }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const [formItem, setFormItem] = useState({
    cavities: mold.cavities
  });
  const [formErrors, setFormErrors] = useState({});
  const handleChange = ({ target }) =>
    setFormItem(prev => ({ ...prev, [target.name]: target.value }));
  const query = {
    moldId: mold.id
  };
  const { list, reload, setQuery } = useFindService({
    model: "mold_products",
    query: {
      ...query,
      $populateAll: true
    }
  });
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    setQuery(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
    setExpanded();
  }, [stringQuery, setQuery]);
  const addProductQuery = {
    productStatusId: lodashGet(client.get("config.product.status.active"), "value"),
    id: {
      $nin: lodashMap(list, product => product.productId)
    }
  };
  const FormRef = useRef(null);
  const refsMap = {};
  const setFormRef = ({ id }) => ref => (refsMap[id] = ref);
  const [expanded, setExpanded] = useState();
  const handleExpand = ({ id, ...rest }) => () => {
    FormRef.current = refsMap[id];
    resetForm();
    if (expanded === id) {
      setExpanded();
      FormRef.current = null;
    } else {
      setExpanded(id);
      setFormItem({ cavities: mold.cavities, id, ...rest });
    }
  };
  const resetForm = () => {
    setFormErrors({});
    setFormItem({ cavities: mold.cavities });
  };
  const resetList = () => {
    reloadTree();
    reload();
  };
  const afterChange = async ({ data }) => handleChange({ target: data });
  const handleSubmit = async ({ product } = {}) => {
    setFormErrors({});
    let continueOperation = true;
    if (
      !validateForm({
        fields,
        formItem,
        setFormErrors
      })
    ) {
      continueOperation = false;
    }
    const intCavities = parseInt(formItem.cavities, "10");
    if (intCavities <= 0) {
      setFormErrors(prev => ({ ...prev, cavities: true }));
      continueOperation = false;
    }
    if (intCavities > mold.cavities) {
      setFormErrors(prev => ({
        ...prev,
        cavities: "Cavidades do molde excedidas."
      }));
      continueOperation = false;
    }
    const newProduct = {
      ...query,
      ...product,
      ...formItem,
      id: lodashGet(product, "id"),
      productId: lodashGet(product, "id")
    };
    if (
      !validateForm({
        fields: ProductsModel.form,
        formItem: newProduct,
        setFormErrors
      })
    ) {
      continueOperation = false;
    }
    if (!continueOperation) {
      return;
    }
    try {
      await client.service("molds").patch(mold.id, {
        products: [newProduct]
      });
      resetList();
      resetForm();
      setExpanded();
    } catch (error) {
      lodashForEach(error.errors, ({ path, validatorKey }) => {
        const fieldIdentity = lodashSplit(path, "_")[0];
        const fieldError = lodashFind(lodashFlattenDeep(ProductsModel.form), {
          identity: fieldIdentity
        });
        if (validatorKey === "not_unique" && fieldError) {
          setFormErrors(prev => ({
            ...prev,
            identity: `Já existe um registro com esse ${fieldError.text}`
          }));
        }
      });
    }
  };
  const handleDelete = async ({ product }) => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    await client.service("mold_products").remove(null, {
      query: {
        ...query,
        productId: product.id
      }
    });
    resetList();
  };
  const hasWriteAccess = getPermissions({ privileges: options.writePermissions, permissions });
  return (
    <React.Fragment>
      <Grid item>
        {lodashMap(list, (moldProduct, index) => (
          <ProductPanel
            key={index}
            data={moldProduct}
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            FormRef={FormRef}
            setFormRef={setFormRef}
            options={{
              readOnly: !hasWriteAccess
            }}
          />
        ))}
      </Grid>
      {hasWriteAccess && (
        <Grid item>
          <NewProductPanel
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            FormRef={FormRef}
            setFormRef={setFormRef}
          />
          <AddProductPanel
            query={addProductQuery}
            expanded={expanded}
            setExpanded={setExpanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            FormRef={FormRef}
            setFormRef={setFormRef}
          />
        </Grid>
      )}
      {FormRef.current && (
        <Form
          fields={fields}
          mold={mold}
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          afterChange={afterChange}
          FormRef={FormRef}
          options={{
            readOnly: !hasWriteAccess
          }}
        />
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(MoldProductsTable);
