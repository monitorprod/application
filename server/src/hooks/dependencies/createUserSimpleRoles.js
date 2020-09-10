const lodash = require("lodash");

module.exports = function () {
  return async (context) => {
    const { app, data, result } = context;
    const userSimpleRolesService = app.service("simple-account-roles");
    if (lodash.isNil(data.roles)) {
      return context;
    }
    if (!Array.isArray(data.roles)) {
      data.roles = [data.roles];
    }
    if (!Array.isArray(data["roles:delete"])) {
      data["roles:delete"] = [data["roles:delete"]];
    }
    let resultArray = result;
    if (!Array.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async (user) => {
        await Promise.all(
          lodash.map(data.roles, async (role) => {
            try {
              await userSimpleRolesService.create({
                companyId: data.companyId,
                userId: user.id,
                roleId: role.id,
              });
              // eslint-disable-next-line no-empty
            } catch (err) {}
            return context;
          })
        );
        return await Promise.all(
          lodash.map(data["roles:delete"], async (role) => {
            try {
              await userSimpleRolesService.remove(null, {
                query: {
                  // TODO clean DB and activate this again
                  // companyId: data.companyId,
                  userId: user.id,
                  roleId: role.id,
                },
              });
              // eslint-disable-next-line no-empty
            } catch (error) {}
            return context;
          })
        );
      })
    );
  };
};
