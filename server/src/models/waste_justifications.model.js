const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const waste_justifications = sequelizeClient.define(
    "waste_justification",
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
      companyId: {
        type: DataTypes.INTEGER
      }
    },
    {
      timestamps: true
    }
  );
  return waste_justifications;
};
