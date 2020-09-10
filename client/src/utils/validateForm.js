import { lodashGet, lodashMap, lodashForEach, lodashIsNil } from "./lodash";

const validateForm = ({ fields, formItem, setFormErrors }) => {
  let isValid = true;
  lodashForEach(fields, field => {
    let isValidField = true;
    if (Array.isArray(field)) {
      isValidField = validateForm({
        fields: field,
        formItem,
        setFormErrors
      });
    } else {
      isValidField = validateField({
        field,
        requiredKey: field.required,
        formItem,
        setFormErrors
      });
    }
    if (isValid) {
      isValid = isValidField;
    }
  });
  return isValid;
};

const validateField = ({ field, requiredKey, formItem, setFormErrors, OR = false }) => {
  let isValid = true;
  const value = lodashGet(formItem, field.identity);
  if (Array.isArray(requiredKey)) {
    const validation = lodashMap(requiredKey, key =>
      validateField({
        field,
        requiredKey: key,
        formItem,
        setFormErrors,
        OR: !OR
      })
    );
    if (OR) {
      return validation.indexOf(true) !== -1;
    }
    return validation.indexOf(false) === -1;
  }
  const required =
    typeof requiredKey === "boolean" ? requiredKey : !!lodashGet(formItem, requiredKey);
  if (required && (lodashIsNil(value) || value === "")) {
    setFormErrors(prev => ({ ...prev, [field.identity]: true }));
    isValid = false;
  }
  if (field.handleValidate) {
    const validationResult = field.handleValidate({
      data: {
        target: {
          name: field.identity,
          value
        }
      },
      item: formItem
    });
    if (typeof validationResult === "string") {
      setFormErrors(prev => ({ ...prev, [field.identity]: validationResult }));
      isValid = false;
    }
  }
  return isValid;
};

export default validateForm;
