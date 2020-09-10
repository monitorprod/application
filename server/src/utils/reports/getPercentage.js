const getPercentage = ({ value = 0 }) => {
  let percentage = value;
  if (value < 0) {
    percentage = 0;
  }
  return percentage * 100;
};

module.exports = getPercentage;
