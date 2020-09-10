const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const configs = sequelizeClient.define(
    "config",
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
      model: {
        type: DataTypes.STRING
      },
      value: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  return configs;
};
