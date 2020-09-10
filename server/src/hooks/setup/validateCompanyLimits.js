const lodash = require("lodash");
const { BadRequest } = require("@feathersjs/errors");

module.exports = function({ service, identity, error }) {
  return async context => {
    const { app, data } = context;
    const companiesSerive = app.service("companies");
    const limitsService = app.service(service);
    const company = await companiesSerive.get(data.companyId);
    const { total } = await limitsService.find({
      query: { companyId: data.companyId }
    });
    if (total >= lodash.get(company, identity)) {
      throw new BadRequest(error);
    }
    return context;
  };
};
