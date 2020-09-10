const addCompanyIdEvent = require("./addCompanyIdEvent");
const addCompanyIdQuery = require("./addCompanyIdQuery");
const setIsAdminPayload = require("./setIsAdminPayload");
const validateSensorAndCompanyUUID = require("./validateSensorAndCompanyUUID");
const validateSensorUUID = require("./validateSensorUUID");
const verifyIsSysAdmin = require("./verifyIsSysAdmin");
const verifySameCompany = require("./verifySameCompany");

module.exports = {
  addCompanyIdEvent,
  addCompanyIdQuery,
  setIsAdminPayload,
  validateSensorAndCompanyUUID,
  validateSensorUUID,
  verifyIsSysAdmin,
  verifySameCompany
};
