const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const machine_types = sequelizeClient.define(
    "machine_type",
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
      }
    },
    {
      timestamps: true
    }
  );
  machine_types.associate = function(models) {
    models.machine_type.belongsTo(models.company);
  };
  return machine_types;
};
