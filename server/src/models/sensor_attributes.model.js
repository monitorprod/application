const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const sensor_attributes = sequelizeClient.define(
    "sensor_attribute",
    {
      value: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  sensor_attributes.associate = function(models) {
    models.sensor_attribute.belongsTo(models.company);
  };
  return sensor_attributes;
};
