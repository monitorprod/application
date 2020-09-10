module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const user_roles = sequelizeClient.define(
    "user_roles",
    {},
    {
      timestamps: true
    }
  );
  user_roles.associate = function(models) {
    models.user_roles.belongsTo(models.company);
  };
  return user_roles;
};
