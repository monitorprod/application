// http://docs.sequelizejs.com/manual/tutorial/models-definition.html
// http://docs.sequelizejs.com/en/latest/docs/associations/
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const users = sequelizeClient.define(
    "user",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
      },
      sendDailyReport: {
        type: DataTypes.BOOLEAN,
      },
      sendWeeklyReport: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      timestamps: true,
    }
  );
  users.associate = function (models) {
    models.user.belongsTo(models.company);
    models.user.belongsTo(models.user_status);
    // TODO adicionar simples user
    models.user.belongsToMany(models.role, {
      through: models.user_roles,
    });
  };
  return users;
};
