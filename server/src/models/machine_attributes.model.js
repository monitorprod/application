const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const machine_attributes = sequelizeClient.define(
    "machine_attribute",
    {
      value: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  machine_attributes.associate = function(models) {
    models.machine_attribute.belongsTo(models.company);
  };
  return machine_attributes;
};
