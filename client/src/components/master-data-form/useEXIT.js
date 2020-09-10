import { useRef, useState, useEffect } from "react";
import { lodashFilter, lodashFind, lodashIsNil, lodashFlattenDeep } from "../../utils";

const useEXIT = ({ history, fields, formItem, loading, dirty: propsDirty }) => {
  const [dirty, setDirty] = useState();
  const [timer, setTimer] = useState();
  const unblock = useRef(null);
  const blockText =
    "Tem certeza de que deseja sair desta página? Suas alterações não serão salvas.";
  const doUnblock = () => {
    window.onbeforeunload = null;
    unblock.current && unblock.current();
  };
  const handleBeforeUnload = () => blockText;
  useEffect(() => {
    if (!lodashIsNil(loading) && !loading) {
      setDirty(false);
    }
  }, [loading, timer]);
  useEffect(() => {
    if (!lodashIsNil(timer) && !lodashIsNil(dirty) && !lodashIsNil(loading) && !loading) {
      const noModelFields = lodashFilter(lodashFlattenDeep(fields), field => !field.model);
      if (
        lodashFilter(
          formItem,
          (value, key) => value && lodashFind(noModelFields, { identity: key })
        ).length > 0
      ) {
        // console.log("!!! BLOCK TRUE");
        setDirty(true);
      } else {
        setDirty(false);
      }
    }
  }, [loading, formItem, dirty, fields, timer]);
  useEffect(() => {
    if (!lodashIsNil(dirty) && dirty) {
      window.onbeforeunload = handleBeforeUnload;
      unblock.current = history.block(blockText);
    } else {
      doUnblock();
    }
    return () => doUnblock();
  }, [dirty, history]);
  useEffect(() => {
    if (!lodashIsNil(propsDirty)) {
      setDirty(false);
    }
  }, [propsDirty]);
  useEffect(() => {
    setTimeout(() => setTimer(Date.now()), 7000);
  }, []);
};

export default useEXIT;
