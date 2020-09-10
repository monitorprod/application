import { useState, useEffect } from "react";
import useFindService from "./useFindService";
import useDeleteService from "./useDeleteService";

const useFindDeleteService = ({ model, query = {} }) => {
  const [findQuery, setFindQuery] = useState({
    $populateAll: true,
    $sort: {
      name: 1
    },
    ...query
  });
  const { list, loading: findLoading, errors: findErrors, reload, setQuery } = useFindService({
    model,
    query: findQuery
  });
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    // console.log("!!!efect setFindQuery", stringQuery, query);
    setFindQuery(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
  }, [stringQuery]);
  const stringFindQuery = JSON.stringify(findQuery);
  useEffect(() => {
    // console.log("!!!efect setQuery", stringFindQuery, findQuery);
    setQuery(JSON.parse(stringFindQuery));
  }, [stringFindQuery, setQuery]);
  const reloadFindHook = async () => reload();
  const { handleDelete: doDelete, loading: deleteLoading, errors: deleteErrors } = useDeleteService(
    {
      model,
      hooks: {
        afterDelete: [reloadFindHook]
      }
    }
  );
  const [deleteRef, setDeleteRef] = useState({});
  const handleDelete = ({ id }) => () => {
    setDeleteRef(prev => ({ ...prev, [id]: true }));
    doDelete({ id })();
  };
  return {
    list,
    setFindQuery,
    handleDelete,
    deleteRef,
    deleteLoading,
    findLoading,
    loading: deleteLoading || findLoading,
    errors: deleteErrors || findErrors
  };
};

export default useFindDeleteService;
