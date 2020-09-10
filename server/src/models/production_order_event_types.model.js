const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const production_order_event_types = sequelizeClient.define(
    "production_order_event_type",
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
      icon: {
        type: DataTypes.STRING
      },
      isSystemEvent: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  production_order_event_types.associate = function(models) {
    models.production_order_event_type.belongsTo(models.company);
    models.production_order_event_type.belongsTo(
      models.production_order_action_type
    );
  };
  return production_order_event_types;
};
