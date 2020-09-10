const { BadRequest } = require("@feathersjs/errors");
const lodash = require("lodash");
const getConfigs = require("../../utils/getConfigs");
const sendMail = require("../../utils/sendMail");

module.exports = function() {
  return async context => {
    const { app, data, params, method, type, result } = context;
    if (
      ((lodash.get(params, "$sendEmail") || lodash.get(params, "query.$sendEmail")) &&
        method === "patch") ||
      method === "create"
    ) {
      params.$sendEmail = true;
      lodash.unset(params, "query.$sendEmail");
    } else if (method === "patch") {
      const usersService = app.service("users");
      const user = lodash.get(
        await usersService.find({
          query: {
            companyId: data.id,
            email: data.adminEmail
          }
        }),
        "data.0"
      );
      if (!user) {
        params.$sendEmail = true;
        lodash.unset(params, "query.$sendEmail");
      }
    }
    if (params.$sendEmail && type === "after") {
      await getConfigs({ app });
      if (!data.companyUserPassword) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Usuário não encontrado");
      }
      if (
        `${result.companyStatusId}` !==
        `${lodash.get(app.get("config.company.status.active"), "value")}`
      ) {
        if (method === "create") {
          return context;
        }
        throw new BadRequest("Não é possível enviar email para contas bloqueadas");
      }
      await sendMail({
        data: {
          from: "MonitorProd",
          to: result.adminEmail,
          subject: "[Não Responder] Bem-vindo ao MonitorProd!",
          html: `Olá,<br/><br/>O Cadastro da Sua Empresa está finalizado.<br/>Segue abaixo dados para Registrar sua entrada ao Sistema como Administrador.<br/>Este e cadastro do Administrador da Empresa, terá acesso completo para Administrar os Usuarios e Dados do Sistema.<br/><br/><b>Login: </b><a href="https://${app.get(
            "host"
          )}/login/${result.uuid}">${result.fantasyName}</a><br/><b>Senha: ${
            data.companyUserPassword
          }</b><br/><b>Login da Empresa: ${
            result.loginName
          }</b><br/><br/>Nossos Agradecimentos<br/>Equipe MonitorProd.<br/><br/><img src="https://monitorprod.com.br/static/media/logo-dark.f159a8d1.png"/><br/><a href="mailto:comercial@monitorprod.com.br">comercial@monitorprod.com.br</a><br/><a href="tel:+5541991076618">+55 41 9 9107-6618</a>`
        }
      });
    }
    return context;
  };
};
