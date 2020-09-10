const lodash = require("lodash");
const moment = require("moment");

module.exports = function({ path }) {
  return async context => {
    const { result } = context;
    let resultArray = result.data || result;
    if (!Array.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    lodash.map(resultArray, item => {
      let value = path ? lodash.get(item, path) : item;
      let lastValue;
      if (Array.isArray(value)) {
        lastValue = lodash.last(value);
      }
      if (!lastValue) {
        lastValue = value;
      }
      if (lastValue && lastValue.ed === -1) {
        lastValue.ed = moment().toDate();
        lastValue.oed = -1;
      }
      if (Array.isArray(value) && moment().diff(moment(lastValue.ed), "minutes") > 15) {
        value.push({
          ev: -1,
          at: -1,
          tu: lastValue.tu,
          sd: moment(lastValue.ed).toDate(),
          ed: moment().toDate()
        });
      }
    });
    return context;
  };
};
