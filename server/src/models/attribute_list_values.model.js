const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const attributes_list_values = sequelizeClient.define(
    "attribute_list_value",
    {
      value: {
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
      timestamps: true,
    }
  );
  attributes_list_values.associate = function(models) {
    models.attribute_list_value.belongsTo(models.company);
    models.attribute_list_value.belongsTo(models.attribute);
  };
  return attributes_list_values;
};
