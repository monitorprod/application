const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const production_order_types = sequelizeClient.define(
    "production_order_type",
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
      isInProduction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      timestamps: true
    }
  );
  production_order_types.associate = function(models) {
    models.production_order_type.belongsTo(models.company);
  };
  return production_order_types;
};
