const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const measurement_units = sequelizeClient.define(
    "measurement_unit",
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
      type: {
        type: Sequelize.ENUM(
          "distance",
          "force",
          "frequency",
          "mass",
          "quantity",
          "temperature",
          "time",
          "other"
        ),
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
  return measurement_units;
};
