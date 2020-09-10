const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const production_order_acumulated_times = sequelizeClient.define(
    "production_order_acumulated_time",
    {
      totalTime: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
    },
    {
      timestamps: true
    }
  );
  production_order_acumulated_times.associate = function(models) {
    models.production_order_acumulated_time.belongsTo(models.company);
    models.production_order_acumulated_time.belongsTo(models.production_order);
    models.production_order_acumulated_time.belongsTo(models.production_order_event_type);
  };
  return production_order_acumulated_times;
};
