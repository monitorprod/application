const lodash = require("lodash");
const moment = require("moment");
const { BadRequest } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");
const createPDF = require("./createPDF");

module.exports = function(app) {
  app.get("/report_pdf", async (request, response) => {
    const companiesService = app.service("companies");
    try {
      await getConfigs({ app });
      const company = lodash.get(
        await companiesService.find({ query: { uuid: lodash.get(request, "query.uuid") } }),
        "data.0"
      );
      if (
        !company ||
        `${company.companyStatusId}` !==
          `${lodash.get(app.get("config.company.status.active"), "value")}`
      ) {
        response.status(400);
        return response.send(new BadRequest("Company Account not found"));
      }
      // TODO review ISOString dates!
      const startD = moment(lodash.get(request, "query.sd"));
      const endD = moment(lodash.get(request, "query.ed"));
      response.statusCode = 200;
      response.setHeader("Content-type", "application/pdf");
      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader(
        "Content-disposition",
        `attachment; filename=Relatório de Produção ${startD.format("YYYY-MMM-DD")} ${endD.format(
          "YYYY-MMM-DD"
        )}.pdf`
      );
      await createPDF({
        app,
        startD,
        endD,
        company,
        stream: response
      });
    } catch (error) {
      console.log("!!!PDF REPORT ERROR", error);
    }
  });
};
