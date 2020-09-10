const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const products = sequelizeClient.define(
    "product",
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV1
      },
      identity: {
        type: DataTypes.STRING,
        unique: "product_company",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      companyId: {
        type: DataTypes.INTEGER,
        unique: "product_company"
      },
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
      color: {
        type: DataTypes.STRING
      },
      version: {
        type: DataTypes.STRING
      },
      design: {
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      UM: {
        type: DataTypes.STRING
      },
      weight: {
        type: DataTypes.DOUBLE
      },
      weightUM: {
        type: DataTypes.STRING
      },
      percentageWaste: {
        type: DataTypes.DOUBLE
      },
      setupMinutes: {
        type: DataTypes.DOUBLE
      },
      measurement_unit: DataTypes.VIRTUAL,
      weight_measurement_unit: DataTypes.VIRTUAL
    },
    {
      timestamps: true
    }
  );
  products.associate = function(models) {
    models.product.belongsTo(models.company);
    models.product.belongsTo(models.product_status);
    models.product.belongsToMany(models.mold, {
      through: models.mold_product
    });
    models.product.belongsToMany(models.attribute, {
      through: models.product_attribute
    });
  };
  return products;
};
