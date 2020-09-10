const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const colors = sequelizeClient.define(
    "color",
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
      rgb: {
        type: DataTypes.STRING
      },
      hsv: {
        type: DataTypes.STRING
      },
      hex: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  return colors;
};
