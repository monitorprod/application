const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const nozzle_types = sequelizeClient.define(
    "nozzle_type",
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
  nozzle_types.associate = function(models) {
    models.nozzle_type.belongsTo(models.company);
  };
  return nozzle_types;
};
