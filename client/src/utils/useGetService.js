import { useContext, useState, useEffect, useCallback } from "react";
import ApiContext from "../api";

const useGetService = ({ model: propsModel, id, query: propsQuery = {} }) => {
  const client = useContext(ApiContext);
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [model, setModel] = useState(propsModel);
  const [query, setQuery] = useState(propsQuery);
  const [trigger, setTrigger] = useState();
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    const get = async () => {
      // console.log(">>> effect GET");
      setLoading(true);
      setErrors();
      try {
        if (id !== "new" && id !== "list" && id) {
          const data = await client.service(model).get(id, { query: JSON.parse(stringQuery) });
          // console.log("!!! GET", data);
          setItem(data);
        } else {
          setItem();
        }
      } catch (error) {
        setErrors(error);
      } finally {
        setLoading(false);
      }
    };
    get();
  }, [client, model, id, trigger, stringQuery]);
  const reload = useCallback(() => {
    // console.log("!! useCallback GET reload");
    setTrigger(Date.now());
  }, []);
  return { item, loading, errors, reload, setModel, setQuery };
};

export default useGetService;
