import { useContext, useEffect } from "react";
import ApiContext from "../../api";
import { lodashGet, lodashForEach, lodashIsNil, getConfigs } from "../../utils";

const useDEFAULT = ({ field, formItem, value, loading, handleChange = () => {} }) => {
  const client = useContext(ApiContext);
  useEffect(() => {
    // console.log("!! effect POPULATE");
    if (field.populate) {
      let populate = field.populate;
      if (!Array.isArray(populate)) {
        populate = [populate];
      }
      if (value) {
        lodashForEach(populate, key => {
          if (formItem[key] !== value) {
            // console.log("effect populate", field, formItem);
            handleChange({ target: { name: key, value } });
          }
        });
      }
    }
    // TODO don't depend on the whole formItem somehow
  }, [field, formItem, handleChange, value]);
  // TODO handleChange calling too many times, and maybe value too
  // useEffect(() => {
  //   console.log("!! effect populate handleChange", handleChange);
  // }, [handleChange]);
  useEffect(() => {
    // console.log("!!! effect DEFAULT");
    let continueOperation = true;
    const setConfigValue = async ({ config }) => {
      await getConfigs({ client });
      const configValue = lodashGet(client.get(`config.${config}`), "value");
      if (configValue) {
        handleChange({
          target: { name: field.identity, value: configValue }
        });
      }
    };
    // TODO set DIRTY logic to set default value, is overwriting
    // TODO 0 value must be allowed, only nil
    if (!formItem[field.identity]) {
      // TODO populate if value on formItem, use upsertLoading flag?
      if (field.populate) {
        // console.log("effect default value POPULATE");
        let populate = field.populate;
        if (!Array.isArray(populate)) {
          populate = [populate];
        }
        let populatedValue = false;
        lodashForEach(populate, key => {
          // TODO 0 value must be allowed, only nil
          if (!populatedValue && formItem[key]) {
            handleChange({
              target: { name: field.identity, value: formItem[key] }
            });
            populatedValue = true;
          }
        });
        if (populatedValue) {
          continueOperation = false;
        }
      }
      // TODO 0 value must be allowed, only nil
      if (continueOperation && !lodashIsNil(loading) && !loading && field.defaultValue) {
        if (window.localStorage.getItem(`dont-default${field.identity}`)) {
          window.localStorage.removeItem(`dont-default${field.identity}`);
        } else {
          // console.log("!!! effect default value default", field.defaultValue);
          let defaultValue = field.defaultValue;
          const defaultConfig = lodashGet(defaultValue, "config");
          const defaultThis = lodashGet(defaultValue, "this");
          const defaultCustomValue = lodashGet(defaultValue, "customValue");
          if (defaultConfig) {
            setConfigValue({ config: defaultConfig });
          } else if (defaultThis) {
            handleChange({
              target: {
                name: field.identity,
                value: lodashGet(formItem, defaultThis)
              }
            });
          } else if (defaultCustomValue) {
            defaultCustomValue({ data: formItem, field, client, handleChange });
          } else if (defaultValue) {
            handleChange({
              target: { name: field.identity, value: defaultValue }
            });
          }
        }
      }
      // if (field.type === "date" || field.type === "datetime") {
      //   // console.log("effect default value date");
      //   return setTimeout(
      //     () =>
      //       handleChange({
      //         target: { name: field.identity, value: new Date().toISOString() }
      //       }),
      //     0
      //   );
      // }
    }
  }, [client, field, handleChange, formItem, loading]);
};

export default useDEFAULT;
