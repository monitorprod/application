const pendingWaste = require("./pendingWaste");
const reportAvailability = require("./reportAvailability");
const reportHistory = require("./reportHistory");
const reportIndicators = require("./reportIndicators");
const reportYesterdaySummary = require("./reportYesterdaySummary");
const reportLabels = require("./reportLabels");
const reportOEE = require("./reportOEE");
const productionOrders = require("./productionOrders");
const sendUserReport = require("./sendUserReport");

module.exports = {
  pendingWaste,
  reportAvailability,
  reportHistory,
  reportLabels,
  reportIndicators,
  reportYesterdaySummary,
  reportOEE,
  productionOrders,
  sendUserReport
};
