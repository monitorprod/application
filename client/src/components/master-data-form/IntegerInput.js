import React from "react";
import NumberFormat from "react-number-format";

const IntegerInput = ({ inputRef, onChange, name, value, ...other }) => {
  return (
    <NumberFormat
      {...other}
      allowEmptyFormatting
      thousandSeparator={"."}
      decimalSeparator={","}
      decimalScale={0}
      type="text"
      value={value}
      onValueChange={({ floatValue }) => {
        if (parseFloat(value) !== floatValue) {
          onChange({
            target: {
              name,
              value: floatValue || 0
            }
          });
        }
      }}
      getInputRef={inputRef}
    />
  );
};

export default IntegerInput;
