const lodash = require("lodash");
const { BadRequest } = require("@feathersjs/errors");
const getConfigs = require("../utils/getConfigs");

module.exports = function(app) {
  app.get("/use_company_login_name", async (request, response) => {
    const loginName = lodash.get(request, "query.loginName");
    if (!loginName) {
      response.status(400);
      response.send(new BadRequest("Missing login name."));
    }
    const companiesService = app.service("companies");
    const { data: companies } = await companiesService.find({
      query: {
        loginName
      }
    });
    if (!companies.length) {
      response.status(400);
      return response.send(new BadRequest("Company Account not found"));
    }
    await getConfigs({ app });
    if (
      `${lodash.get(companies, "0.companyStatusId")}` !==
      `${lodash.get(app.get("config.company.status.active"), "value")}`
    ) {
      response.status(400);
      return response.send(new BadRequest("Company Account not found"));
    }
    return response.send({
      companyUUID: lodash.get(companies, "0.uuid")
    });
  });
};
