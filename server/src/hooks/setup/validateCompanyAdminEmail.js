const { BadRequest } = require("@feathersjs/errors");

module.exports = function() {
  return async context => {
    const { app, data } = context;
    const usersService = app.service("users");
    const { data: users } = await usersService.find({ query: { email: data.adminEmail } });
    if (users.length) {
      throw new BadRequest("Já existe uma conta com este email");
    }
    return context;
  };
};
