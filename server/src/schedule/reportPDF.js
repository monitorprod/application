const fs = require("fs");
const schedule = require("node-schedule");
const lodash = require("lodash");
const moment = require("moment");
moment.locale("pt-BR");
const { createPDF } = require("../middleware/reports");
const getConfigs = require("../utils/getConfigs");
const sendMail = require("../utils/sendMail");

module.exports = function(app) {
  const send = async ({ startD, endD, param }) => {
    const usersService = app.service("users");
    const companiesService = app.service("companies");
    await getConfigs({ app });
    const { data: users } = await usersService.find({
      query: {
        [param]: true,
        userStatusId: lodash.get(app.get("config.user.status.active"), "value")
      }
    });
    try {
      await Promise.all(
        lodash.map(users, async user => {
          const company = await companiesService.get(user.companyId);
          if (
            !company ||
            `${company.companyStatusId}` !==
              `${lodash.get(app.get("config.company.status.active"), "value")}`
          ) {
            return;
          }
          const reportName = `report-${user.id}-${Date.now()}.pdf`;
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
                to: user.email,
                subject: "[Não Responder] Relatório de Produção",
                html: `Olá,<br/><br/>Este é o Relatório de Produção do período: ${startD.format(
                  "ddd, DD [de] MMM"
                )} até ${endD.format(
                  "ddd, DD [de] MMM"
                )}.<br/><br/>Nossos Agradecimentos<br/>Equipe MonitorProd.<br/><br/><img src="https://monitorprod.com.br/static/media/logo-dark.f159a8d1.png"/><br/><a href="mailto:comercial@monitorprod.com.br">comercial@monitorprod.com.br</a><br/><a href="tel:+5541991076618">+55 41 9 9107-6618</a>`,
                attachments: [
                  {
                    filename: `Relatório de Produção ${startD.format(
                      "YYYY-MMM-DD"
                    )} ${endD.format("YYYY-MMM-DD")}.pdf`,
                    content: fs.createReadStream(reportName)
                  }
                ]
              }
            });
            fs.unlinkSync(reportName);
          });
        })
      );
    } catch (error) {
      console.log("!!! SEND REPORT ERROR", error);
    }
  };
  schedule.scheduleJob("0 10 13 * * *", () => {
    const startD = moment()
      .subtract(1, "day")
      .startOf("day")
      .add(9, "hours");
    const endD = moment()
      .subtract(1, "day")
      .endOf("day")
      .add(9, "hours");
    send({ startD, endD, param: "sendDailyReport" });
  });
  // schedule.scheduleJob("0 10 9 * * 1", () => {
  //   const startD = moment()
  //     .subtract(5, "day")
  //     .startOf("week")
  //     .add(1, "day")
  //     .startOf("day")
  //     .add(9, "hours");
  //   const endD = moment()
  //     .subtract(1, "day")
  //     .endOf("day")
  //     .add(9, "hours");
  //   send({ startD, endD, param: "sendWeeklyReport" });
  // });
};
