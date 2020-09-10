const lodash = require("lodash");
const moment = require("moment");

const getOBJDateJSON = ({ date = {}, path }) => {
  return {
    [`${path}Y`]: date.year,
    [`${path}M`]: date.month,
    [`${path}D`]: date.date,
    [`${path}h`]: date.hour,
    [`${path}m`]: date.minute,
    [`${path}s`]: date.second
  };
};

module.exports = function() {
  return async context => {
    const { data, params } = context;
    context.data = {
      poi: parseInt(data.poi) || null,
      mi: parseInt(data.mi) || null,
      ti: parseInt(data.ti) || null,
      ...getOBJDateJSON({ date: data.sd, path: "sd" }),
      ...getOBJDateJSON({ date: data.ed, path: "ed" }),
      cd: moment().toDate(),
      sd: moment(data.sd).toDate(),
      ed: moment(data.ed).toDate(),
      tp: data.tp || 0,
      cp: data.cp || 0,
      wp: data.wp || 0,
      wji: parseInt(data.wji) || null,
      ui: parseInt(lodash.get(params, "connection.payload.userId")) || null
    };
    return context;
  };
};
