const roundDecimal = ({ value = 0, digits = 2 }) => {
  const roundDigits = Math.pow(10, digits);
  return Math.round(value * roundDigits) / roundDigits;
};

module.exports = roundDecimal;
