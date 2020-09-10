const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const production_order_action_types = sequelizeClient.define(
    "production_order_action_type",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING
      },
      colorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      isSystemEvent: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  return production_order_action_types;
};
