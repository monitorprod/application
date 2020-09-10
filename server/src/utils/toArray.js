const lodash = require("lodash");

const toArray = ({ value, propName }) => {
  let resultArray = value;
  if (lodash.isNil(value)) {
    return [];
  }
  if (!lodash.isArray(value)) {
    if (propName) {
      resultArray = [
        {
          [propName]: value
        }
      ];
    } else {
      resultArray = [value];
    }
  }
  return resultArray;
};

module.exports = toArray;
