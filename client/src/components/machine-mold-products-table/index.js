import React, { useRef, useContext, useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  getPermissions,
  validateForm,
  useFindService,
  useAuth
} from "../../utils";
import { form as fields } from "./model";
import AddMachinePanel from "./AddMachine";
import MachinePanel from "./MachinePanel";
import Form from "./Form";

const styles = theme => ({});

const MachineMoldProductsTable = ({ classes, mold, product, options }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const [formItem, setFormItem] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const handleChange = ({ target }) =>
    setFormItem(prev => ({ ...prev, [target.name]: target.value }));
  const query = {
    productId: product.id,
    moldId: null
  };
  if (mold) {
    query.moldId = mold.id;
  }
  const { list, reload, setQuery } = useFindService({
    model: "machine_mold_products",
    query: {
      ...query,
      $populateAll: true
    }
  });
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    // console.log("!! effect Machine Mold Product setQuery");
    setQuery(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
    setExpanded();
  }, [setQuery, stringQuery]);
  const addMachineQuery = {
    machineStatusId: lodashGet(client.get("config.machine.status.active"), "value"),
    id: {
      $nin: lodashMap(list, machine => parseInt(machine.machineId, "10"))
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
      setFormItem({ id, ...rest });
    }
  };
  const resetForm = () => {
    setFormErrors({});
    setFormItem({});
  };
  const resetList = () => {
    reload();
  };
  const handleSubmit = async ({ machine }) => {
    setFormErrors({});
    if (
      !validateForm({
        fields,
        formItem,
        setFormErrors
      })
    ) {
      return;
    }
    await client.service("machines").patch(machine.id, {
      products: [
        {
          ...formItem,
          ...query,
          machineId: machine.id
        }
      ]
    });
    resetList();
  };
  const handleDelete = async ({ machine }) => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    await client.service("machine_mold_products").remove(null, {
      query: {
        ...query,
        machineId: machine.id
      }
    });
    resetList();
  };
  useEffect(() => {
    // console.log("!! effect calc cycle");
    const calculateCycle = ({ value, factor }) =>
      Math.round(parseFloat(value, "10") * factor * 100) / 100;
    if (formItem.idealCycle) {
      setFormItem(prev => ({
        ...prev,
        minCycle: calculateCycle({ value: prev.idealCycle, factor: 0.9 }),
        maxCycle: calculateCycle({ value: prev.idealCycle, factor: 1.1 })
      }));
    }
  }, [formItem.idealCycle]);
  const hasWriteAccess = getPermissions({ privileges: options.writePermissions, permissions });
  // console.log(">>> render MachineMoldProductTable", list);
  return (
    <React.Fragment>
      <Grid item>
        {lodashMap(list, (machineMoldProduct, index) => (
          <MachinePanel
            key={index}
            data={machineMoldProduct}
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
          <AddMachinePanel
            query={addMachineQuery}
            expanded={expanded}
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
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          FormRef={FormRef}
          options={{
            readOnly: !hasWriteAccess
          }}
        />
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(MachineMoldProductsTable);
