const { BadRequest } = require("@feathersjs/errors");
const lodash = require("lodash");
const getConfigs = require("../../utils/getConfigs");
const sendMail = require("../../utils/sendMail");

module.exports = function() {
  return async context => {
    const { app, data, params, method, type, result } = context;
    const companiesService = app.service("companies");
    if (
      !data.$companyUser &&
      (((lodash.get(params, "$sendEmail") || lodash.get(params, "query.$sendEmail")) &&
        method === "patch") ||
        method === "create")
    ) {
      params.$sendEmail = true;
      lodash.unset(params, "query.$sendEmail");
    }
    if (params.$sendEmail && type === "after") {
      await getConfigs({ app });
      if (!data.userPassword) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Usuário não encontrado");
      }
      if (
        `${result.userStatusId}` !== `${lodash.get(app.get("config.user.status.active"), "value")}`
      ) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Não é possível enviar email para contas bloqueadas");
      }
      const company = await companiesService.get(result.companyId);
      await sendMail({
        data: {
          from: "MonitorProd",
          to: result.email,
          subject: "[Não Responder] Bem-vindo ao MonitorProd!",
          html: `Olá,<br/><br/>Uma conta na MonitorProd foi criada para este email.<br/>Segue abaixo dados para Registrar sua entrada ao Sistema.<br/><br/><b>Login: </b><a href="https://${app.get(
            "host"
          )}/login/${company.uuid}">${company.fantasyName}</a><br/><b>Senha: ${
            data.userPassword
          }</b><br/><b>Login da Empresa: ${
            company.loginName
          }</b><br/><br/>Nossos Agradecimentos<br/>Equipe MonitorProd.<br/><br/><img src="https://monitorprod.com.br/static/media/logo-dark.f159a8d1.png"/><br/><a href="mailto:comercial@monitorprod.com.br">comercial@monitorprod.com.br</a><br/><a href="tel:+5541991076618">+55 41 9 9107-6618</a>`
        }
      });
    }
    if (params.$forgotPassword && type === "after") {
      const user = lodash.get(result, "0");
      await getConfigs({ app });
      if (!data.userPassword) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Usuário não encontrado");
      }
      if (
        `${user.userStatusId}` !== `${lodash.get(app.get("config.user.status.active"), "value")}`
      ) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Não é possível enviar email para contas bloqueadas");
      }
      const company = await companiesService.get(user.companyId);
      await sendMail({
        data: {
          from: "MonitorProd",
          to: user.email,
          subject: "[Não Responder] MonitorProd: Redefinição de Senha",
          html: `Olá,<br/><br/>Uma solicitação de redefinição de senha foi feita nesta conta.<br/>Segue abaixo os novos dados para Registrar sua entrada ao Sistema.<br/><br/><b>Login: </b><a href="https://${app.get(
            "host"
          )}/login/${company.uuid}">${company.fantasyName}</a><br/><b>Senha: ${
            data.userPassword
          }</b><br/><b>Login da Empresa: ${
            company.loginName
          }</b><br/><br/>Nossos Agradecimentos<br/>Equipe MonitorProd.<br/><br/><img src="https://monitorprod.com.br/static/media/logo-dark.f159a8d1.png"/><br/><a href="mailto:comercial@monitorprod.com.br">comercial@monitorprod.com.br</a><br/><a href="tel:+5541991076618">+55 41 9 9107-6618</a>`
        }
      });
    }
    return context;
  };
};
