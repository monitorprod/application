const lodash = require("lodash");

const getColor = ({ data, path }) =>
  lodash.get(data, `${path}.hex`) ||
  lodash.get(data, `${path}.rgb`) ||
  lodash.get(data, `${path}.hsv`);

module.exports = getColor;
