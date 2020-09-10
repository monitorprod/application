const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const product_mat_types = sequelizeClient.define(
    "product_mat_type",
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
  product_mat_types.associate = function(models) {
    models.product_mat_type.belongsTo(models.company);
  };
  return product_mat_types;
};
