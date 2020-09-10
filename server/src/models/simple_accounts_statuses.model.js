const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const user_statuses = sequelizeClient.define(
    "simple_accounts_status",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return user_statuses;
};
