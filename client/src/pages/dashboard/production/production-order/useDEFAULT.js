import { useContext, useState, useEffect } from "react";
import ApiContext from "../../../../api";
import {
  lodashGet,
  lodashMap,
  lodashFlattenDeep,
  useUpsertService
} from "../../../../utils";
import { form as fields } from "./model";
import useAuth from "../../../../utils/useAuth";

const useDEFAULT = ({ productionOrder, machineId, history }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const [selectedMachine, setSelectedMachine] = useState();
  const [selectedSensor, setSelectedSensor] = useState();
  const afterChange = async ({ data }) => {
    if (data.name === "machineId") {
      try {
        const machine = await client.service("machines").get(data.value);
        setSelectedMachine(machine);
        const { data: sensors } = await client
          .service("sensors")
          .find({ query: { machineId: data.value } });
        setSelectedSensor(sensors[0]);
        handleChange({
          target: {
            name: "sensorId",
            value: lodashGet(sensors, "0.id")
          }
        });
        handleChange({
          target: {
            name: "plantId",
            value: lodashGet(productionOrder, "uuid")
              ? productionOrder.plantId || machine.plantId
              : machine.plantId
          }
        });
      } catch (e) {
        setSelectedMachine();
        setSelectedSensor();
      }
    }
  };
  const beforeSubmit = async ({ data = {} }) => {
    if (!data.productionOrderTypeId) {
      return false;
    }
    const productionOrderType = await client
      .service("production_order_types")
      .get(data.productionOrderTypeId);
    if (!!productionOrderType.isInProduction) {
      let continueOperation = true;
      if (!data.moldId) {
        handleFormErrors({
          identity: "moldId",
          value: true
        });
        continueOperation = false;
      }
      if (!data.productId && level === "N1") {
        handleFormErrors({
          identity: "productId",
          value: true
        });
        continueOperation = false;
      }
      const openCavities = parseInt(data.openCavities, "10") || 0;
      const expectedProduction = parseInt(data.expectedProduction, "10") || 0;
      if (!data.expectedProductionUM && level === "N1") {
        handleFormErrors({
          identity: "expectedProductionUM",
          value: true
        });
        continueOperation = false;
      }
      if (!data.idealCycle || parseFloat(data.idealCycle) <= 0) {
        handleFormErrors({
          identity: "idealCycle",
          value: true
        });
        continueOperation = false;
      }
      if (!data.cycleUM) {
        handleFormErrors({
          identity: "cycleUM",
          value: true
        });
        continueOperation = false;
      }
      if ((!expectedProduction || expectedProduction <= 0) && level === "N1") {
        handleFormErrors({
          identity: "expectedProduction",
          value: "Digite a quantidade prevista."
        });
        continueOperation = false;
      }
      if ((!openCavities || openCavities <= 0) && level === "N1") {
        handleFormErrors({
          identity: "openCavities",
          value: "Digite o número de cavidades."
        });
        continueOperation = false;
      }
      if (data.moldId) {
        const mold = await client.service("molds").get(data.moldId);
        if (openCavities > parseInt(mold.cavities, "10") && level === "N1") {
          handleFormErrors({
            identity: "openCavities",
            value: "Cavidades do molde excedidas."
          });
          continueOperation = false;
        }
      }
      return continueOperation;
    }
    return true;
  };
  const afterSubmit = async ({ data }) => {
    history.push(`/dashboard/production/${machineId}/order/${data.id}`);
  };
  const {
    formItem,
    formErrors,
    handleChange,
    handleSubmit,
    handleFormErrors,
    loading: loadingUpsert,
    errors: errorsUpsert
  } = useUpsertService({
    model: "production_orders",
    data: productionOrder,
    hooks: {
      afterChange,
      beforeSubmit,
      afterSubmit
    },
    fields
  });
  const copyData = localStorage.getItem("copy-production-order");
  const stringCopyData = JSON.stringify(JSON.parse(copyData || "{}"));
  useEffect(() => {
    // console.log("!!! effect copy", stringCopyData);
    let parsedCopyData = JSON.parse(stringCopyData);
    localStorage.removeItem("copy-production-order");
    if (Object.keys(parsedCopyData).length > 0) {
      setTimeout(
        () =>
          lodashMap(lodashFlattenDeep(fields), field => {
            const value = lodashGet(parsedCopyData, field.identity);
            if (
              level !== "N1" &&
              [
                "openCavities",
                "expectedProduction",
                "expectedProductionUM"
              ].indexOf(field.identity) !== -1
            ) {
              return;
            }
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
  }, [stringCopyData, handleChange]);
  const stringProductionOrder = JSON.stringify(productionOrder || {});
  useEffect(() => {
    // TODO change machine to FORM INPUT
    // console.log("!!! effect useDEFAULT");
    const parsedProductionOrder = JSON.parse(stringProductionOrder);
    handleChange({
      target: {
        name: "machineId",
        value: lodashGet(parsedProductionOrder, "machineId") || machineId
      }
    });
  }, [stringProductionOrder, machineId, handleChange]);
  return {
    selectedMachine,
    selectedSensor,
    formItem,
    formErrors,
    handleChange,
    handleSubmit,
    loading: loadingUpsert,
    errors: errorsUpsert
  };
};

export default useDEFAULT;
