module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const simple_account_roles = sequelizeClient.define(
    "simple_account_roles",
    {},
    {
      timestamps: true,
    }
  );
  simple_account_roles.associate = function (models) {
    models.user_roles.belongsTo(models.company);
  };
  return simple_account_roles;
};
