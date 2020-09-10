import { useContext, useState, useEffect, useCallback } from "react";
import ApiContext from "../api";
import {
  lodashForEach,
  lodashFind,
  lodashIsNil,
  lodashSplit,
  lodashToUpper,
  lodashFlattenDeep
} from "./lodash";
import runHooks from "./runHooks";
import validateForm from "./validateForm";

const useUpsertService = ({
  model: propsModel,
  fields: propsFields,
  data,
  hooks = {}
}) => {
  const client = useContext(ApiContext);
  const [newItem, setNewItem] = useState({});
  const [formItem, setFormItem] = useState({ ...data });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [model, setModel] = useState(propsModel);
  const [fields, setFields] = useState(propsFields);
  useEffect(() => {
    setErrors();
    setFormErrors({});
    setFormItem({ ...data });
  }, [data]);
  const flattenFields = lodashFlattenDeep(fields);
  const stringHooks = JSON.stringify(hooks);
  const stringFormItem = JSON.stringify(formItem);
  const handleChange = useCallback(
    ({ target }) => {
      const asyncHandleChange = async () => {
        const field =
          lodashFind(flattenFields, { identity: target.name }) || {};
        // console.log("!!! useCallback handleChange", target, field.identity);
        if (field.handleChange) {
          field.handleChange({
            client,
            data: { target },
            field,
            item: JSON.parse(stringFormItem),
            handleChange
          });
        }
        setFormItem(prev => {
          // console.log("!!setFormItem", target, field, data);
          return {
            ...prev,
            [target.name]:
              !lodashIsNil(target.value) &&
              field.type !== "boolean" &&
              field.type !== "checklist" &&
              field.type !== "table" &&
              field.type !== "image" &&
              field.type !== "content" &&
              target.name !== "loginName"
                ? lodashToUpper(target.value)
                : target.value || null
          };
        });
        await runHooks({
          hooks,
          data: target,
          identity: "afterChange"
        });
      };
      asyncHandleChange();
    },
    // [client, stringFormItem, flattenFields, hooks],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, stringFormItem, stringHooks]
  );
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrors();
    setFormErrors({});
    try {
      let continueOperation = true;
      if (!validateForm({ fields, formItem, setFormErrors })) {
        continueOperation = false;
      }
      if (
        !(await runHooks({ hooks, data: formItem, identity: "beforeSubmit" }))
      ) {
        continueOperation = false;
      }
      if (!continueOperation) {
        setLoading(false);
        return;
      }
      const cleanFormItem = {
        id: formItem.id
      };
      lodashForEach(
        flattenFields,
        ({ identity }) => (cleanFormItem[identity] = formItem[identity])
      );
      if (cleanFormItem.id) {
        console.log("patch", cleanFormItem);
        await client.service(model).patch(cleanFormItem.id, cleanFormItem);
        await runHooks({ hooks, data: formItem, identity: "afterSubmit" });
      } else {
        console.log("create", cleanFormItem);
        const data = await client.service(model).create(cleanFormItem);
        setNewItem(data);
        await runHooks({ hooks, data, identity: "afterSubmit" });
      }
    } catch (error) {
      console.log("upsert error:", error);
      lodashForEach(error.errors, ({ path, validatorKey }) => {
        const fieldIdentity = lodashSplit(path, "_")[0];
        const fieldError = lodashFind(flattenFields, {
          identity: fieldIdentity
        });
        if (validatorKey === "not_unique" && fieldError) {
          handleFormErrors({
            identity: fieldError.identity,
            value: `Já existe um registro com esse ${fieldError.text}`
          });
        }
      });
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };
  const handleFormErrors = ({ identity, value }) =>
    setFormErrors(prev => ({ ...prev, [identity]: value }));
  return {
    newItem,
    formItem,
    formErrors,
    handleChange,
    handleSubmit,
    handleFormErrors,
    loading,
    errors,
    setModel,
    setFields
  };
};

export default useUpsertService;
