const lodash = require("lodash");

module.exports = function() {
  return async context => {
    const { app, data, result } = context;
    const userRolesService = app.service("user_roles");
    if (lodash.isNil(data.roles)) {
      return context;
    }
    if (!Array.isArray(data.roles)) {
      data.roles = [data.roles];
    }
    if (!Array.isArray(data["roles:delete"])) {
      data["roles:delete"] = [data["roles:delete"]];
    }
    // TODO make this a util function
    let resultArray = result;
    if (!Array.isArray(resultArray)) {
      resultArray = [resultArray];
    }
    await Promise.all(
      lodash.map(resultArray, async user => {
        await Promise.all(
          lodash.map(data.roles, async role => {
            try {
              await userRolesService.create({
                companyId: data.companyId,
                userId: user.id,
                roleId: role.id
              });
            } catch (error) {}
            return context;
          })
        );
        return await Promise.all(
          lodash.map(data["roles:delete"], async role => {
            try {
              await userRolesService.remove(null, {
                query: {
                  // TODO clean DB and activate this again
                  // companyId: data.companyId,
                  userId: user.id,
                  roleId: role.id
                }
              });
            } catch (error) {}
            return context;
          })
        );
      })
    );
  };
};
