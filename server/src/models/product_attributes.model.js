const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const product_attributes = sequelizeClient.define(
    "product_attribute",
    {
      value: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  product_attributes.associate = function(models) {
    models.product_attribute.belongsTo(models.company);
  };
  return product_attributes;
};
