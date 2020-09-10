import { useContext, useState, useEffect } from "react";
import ApiContext from "../api";
import runHooks from "./runHooks";

const useDeleteService = ({ model: propsModel, item: propsItem, hooks = {} }) => {
  const client = useContext(ApiContext);
  const [item, setItem] = useState(propsItem);
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [model, setModel] = useState(propsModel);
  useEffect(() => {
    // console.log(">>> effect DELETE setErrors");
    setErrors();
  }, [item]);
  const handleDelete = ({ id }) => async () => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    setErrors();
    setLoading(true);
    try {
      console.log("delete", item);
      await runHooks({ hooks, item, identity: "beforeDelete" });
      await client.service(model).remove(id || item.id);
      await runHooks({ hooks, item, identity: "afterDelete" });
    } catch (error) {
      setErrors(error);
    } finally {
      setLoading(false);
    }
  };
  return { item, handleDelete, loading, errors, setModel, setItem };
};

export default useDeleteService;
