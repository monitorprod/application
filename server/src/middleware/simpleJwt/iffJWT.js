const { jwt, jwtSecret } = require("./configJwt");
const { NotAuthenticated } = require("@feathersjs/errors");
const getConfigs = require("../../utils/getConfigs");

const lodash = require("lodash");

module.exports = function (app) {
  app.post("/authentication_simple", async (request, response) => {
    const username = lodash.get(request, "body.username");
    const companyUUID = lodash.get(request, "query.companyUUID");
    const accessToken = lodash.get(request, "body.accessToken");
    if (!companyUUID || !username) {
      throw new NotAuthenticated("Company Account not found");
    }
    const companySerive = app.service("companies");
    const { data: companies } = await companySerive.find({
      query: {
        uuid: companyUUID,
      },
    });
    if (!companies.length) {
      throw new NotAuthenticated("Company not found");
    }
    if (username) {
      const simpleAccountsSerive = app.service("simple-accounts");
      const { data: user } = await simpleAccountsSerive.find({
        query: {
          username: username,
        },
      });
      if (!user.length) {
        throw new NotAuthenticated("User not found");
      }
      await getConfigs({ app });
      if (
        `${lodash.get(companies, "0.companyStatusId")}` !==
        `${lodash.get(app.get("config.company.status.active"), "value")}`
      ) {
        throw new NotAuthenticated("Company Account not found");
      }
      if (
        `${lodash.get(user, "0.simpleAccountsStatusId")}` !==
        `${lodash.get(app.get("config.simple_account.status.active"), "value")}`
      ) {
        throw new NotAuthenticated("Company Account not found");
      }
      if (
        `${lodash.get(companies, "0.id")}` !==
        `${lodash.get(user, "0.companyId")}`
      ) {
        throw new NotAuthenticated("Company Account not found");
      } else {
        if (username === user[0].username) {
          const payload = {
            id: user[0].id,
            username: user[0].username,
            name: user[0].name,
            companyId: user[0].companyId,
          };
          jwt.sign(payload, jwtSecret, (error, token) => {
            response.send({
              user: payload,
              accessToken: token,
            });
          });
        }
      }
    } else {
      const payload = jwt.verify(accessToken, jwtSecret);
      if (payload) {
        response.send({
          user: payload,
          accessToken: accessToken,
        });
      }
    }
  });
};
