const createCompanyInitialData = require("./createCompanyInitialData");
const createCompanyLoginName = require("./createCompanyLoginName");
const createCompanyUser = require("./createCompanyUser");
const createDefaultHolidays = require("./createDefaultHolidays");
const createDefaultTurns = require("./createDefaultTurns");
const createUserPassword = require("./createUserPassword");
const redirectSiteContactEmail = require("./redirectSiteContactEmail");
const sendCompanySetupEmail = require("./sendCompanySetupEmail");
const sendUserSetupEmail = require("./sendUserSetupEmail");
const updateCompanyUser = require("./updateCompanyUser");
const updateUserPassword = require("./updateUserPassword");
const validateCompanyAdminEmail = require("./validateCompanyAdminEmail");
const validateCompanyLimits = require("./validateCompanyLimits");

module.exports = {
  createCompanyInitialData,
  createCompanyLoginName,
  createCompanyUser,
  createDefaultHolidays,
  createDefaultTurns,
  createUserPassword,
  redirectSiteContactEmail,
  sendCompanySetupEmail,
  sendUserSetupEmail,
  updateCompanyUser,
  updateUserPassword,
  validateCompanyAdminEmail,
  validateCompanyLimits
};
