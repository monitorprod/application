const { BadRequest } = require("@feathersjs/errors");
const fs = require("fs");
const lodash = require("lodash");
const moment = require("moment");
const { createPDF } = require("../../middleware/reports");
const getConfigs = require("../../utils/getConfigs");
const sendMail = require("../../utils/sendMail");

module.exports = function() {
  return async context => {
    const { app, params, method, type, result } = context;
    const companiesService = app.service("companies");
    if (
      (lodash.get(params, "$sendReport") || lodash.get(params, "query.$sendReport")) &&
      method === "patch"
    ) {
      params.$sendReport =
        lodash.get(params, "$sendReport") || lodash.get(params, "query.$sendReport");
      lodash.unset(params, "query.$sendReport");
    }
    if (params.$sendReport && type === "after") {
      await getConfigs({ app });
      if (
        `${result.userStatusId}` !== `${lodash.get(app.get("config.user.status.active"), "value")}`
      ) {
        throw new BadRequest("Não é possível enviar email para contas bloqueadas");
      }
      const company = await companiesService.get(result.companyId);
      if (
        !company ||
        `${company.companyStatusId}` !==
          `${lodash.get(app.get("config.company.status.active"), "value")}`
      ) {
        throw new BadRequest("Não é possível enviar email para contas bloqueadas");
      }
      const send = async ({ startD, endD }) => {
        try {
          const reportName = `report-${result.id}-${Date.now()}.pdf`;
          const PDFStream = fs.createWriteStream(reportName);
          await createPDF({
            app,
            startD,
            endD,
            company,
            stream: PDFStream
          });
          PDFStream.on("finish", async () => {
            await sendMail({
              data: {
                from: "MonitorProd",
                to: result.email,
                subject: "[Não Responder] Relatório de Produção",
                html: `Olá,<br/><br/>Este é o Relatório de Produção do período: ${startD.format(
                  "ddd, DD [de] MMM"
                )} até ${endD.format(
                  "ddd, DD [de] MMM"
                )}.<br/><br/>Nossos Agradecimentos<br/>Equipe MonitorProd.<br/><br/><img src="https://monitorprod.com.br/static/media/logo-dark.f159a8d1.png"/><br/><a href="mailto:comercial@monitorprod.com.br">comercial@monitorprod.com.br</a><br/><a href="tel:+5541991076618">+55 41 9 9107-6618</a>`,
                attachments: [
                  {
                    filename: `Relatório de Produção ${startD.format("YYYY-MMM-DD")} ${endD.format(
                      "YYYY-MMM-DD"
                    )}.pdf`,
                    content: fs.createReadStream(reportName)
                  }
                ]
              }
            });
            fs.unlinkSync(reportName);
          });
        } catch (error) {
          console.log("!!! SEND REPORT ERROR", error);
        }
      };
      if (params.$sendReport === "sendDailyReport") {
        const startD = moment()
          .subtract(1, "day")
          .startOf("day")
          .add(9, "hours");
        const endD = moment()
          .subtract(1, "day")
          .endOf("day")
          .add(9, "hours");
        await send({ startD, endD });
      } else if (params.$sendReport === "sendWeeklyReport") {
        const startD = moment()
          .subtract(5, "day")
          .startOf("week")
          .add(1, "day")
          .startOf("day")
          .add(9, "hours");
        const endD = moment()
          .subtract(5, "day")
          .endOf("week")
          .add(1, "day")
          .endOf("day")
          .add(9, "hours");
        await send({ startD, endD });
      }
    }
    return context;
  };
};
