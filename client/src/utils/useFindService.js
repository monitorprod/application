import { useContext, useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import ApiContext from "../api";

const useFindService = ({ model: propsModel, query: propsQuery = {}, timeCarousel }) => {
  const client = useContext(ApiContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState();
  const [errors, setErrors] = useState();
  const [model, setModel] = useState(propsModel);
  const [query, setQuery] = useState(propsQuery);
  const [trigger, setTrigger] = useState();
  const stringQuery = JSON.stringify(query);
  const [doFind] = useDebouncedCallback(
    useCallback(() => {
      const find = async () => {
        // console.log(">>> effect FIND", stringQuery, trigger);
        setLoading(true);
        setErrors();
        try {
          const { data } = await client.service(model).find({ query: JSON.parse(stringQuery) });
          setList(data);
        } catch (error) {
          setErrors(error);
        } finally {
          setLoading(false);
        }
      };
      if (timeCarousel) {
        setTimeout(() => {
          find()
        }, timeCarousel * 1000)
      } else {
        find();
      } 
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, model, stringQuery, trigger]),
    300
  );
  useEffect(() => {
    // const find = async () => {
    //   console.log(">>> effect FIND", stringQuery, trigger);
    //   setLoading(true);
    //   setErrors();
    //   try {
    //     const { data } = await client.service(model).find({ query: JSON.parse(stringQuery) });
    //     setList(data);
    //   } catch (error) {
    //     setErrors(error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // find();
    doFind();
  }, [doFind]);
  const reload = useCallback(() => {
    // console.log("!! useCallback FIND reload");
    setTrigger(Date.now());
  }, []);
  return { list, loading, errors, reload, setModel, setQuery };
};

export default useFindService;
