import { useEffect } from "react";
import { lodashGet, lodashFindIndex, lodashFlattenDeep } from "../../utils";

const useENTER = ({ fields, options = {} }) => {
  useEffect(() => {
    const handleKeyPress = e => {
      if (e.which === 13) {
        e.preventDefault();
        const flatFields = lodashFlattenDeep(fields);
        const target = e.target;
        if (target.nodeName === "INPUT") {
          const nextField = flatFields[lodashFindIndex(flatFields, { identity: target.name }) + 1];
          if (nextField) {
            document.querySelector(`input[name=${nextField.identity}]`).focus();
          }
        } else {
          document.querySelector(`input[name=${lodashGet(flatFields, "0.identity")}]`).focus();
        }
      }
    };
    if (!options.dontUseEnter) {
      document.addEventListener("keypress", handleKeyPress);
    }
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, [fields, options.dontUseEnter]);
};

export default useENTER;
