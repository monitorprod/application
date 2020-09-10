const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const mold_products = sequelizeClient.define(
    "mold_product",
    {
      cavities: {
        type: DataTypes.INTEGER,
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
  mold_products.associate = function(models) {
    models.mold_product.belongsTo(models.company);
  };
  return mold_products;
};
