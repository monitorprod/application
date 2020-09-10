const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const simple_account = sequelizeClient.define(
    "simple_account",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  simple_account.associate = function (models) {
    models.simple_account.belongsTo(models.company);
    models.simple_account.belongsTo(models.simple_accounts_status);
    models.simple_account.belongsToMany(models.role, {
      through: models.simple_account_roles,
    });
  };
  return simple_account;
};
