const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const notifications = sequelizeClient.define(
    "notification",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING
      },
      machineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      productionOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      type: {
        type: Sequelize.ENUM("production_exceeded", "stop", "noise"),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      timestamps: true
    }
  );
  notifications.associate = function(models) {
    models.notification.belongsTo(models.company);
  };
  return notifications;
};
