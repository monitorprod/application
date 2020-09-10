const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const machine_mold_products = sequelizeClient.define(
    "machine_mold_product",
    {
      machineId: {
        type: DataTypes.INTEGER,
        unique: "machine_mold_product",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      moldId: {
        type: DataTypes.INTEGER,
        unique: "machine_mold_product",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        unique: "machine_mold_product",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      idealCycle: {
        type: DataTypes.DOUBLE
      },
      idealCycleUM: {
        type: DataTypes.STRING
      },
      minCycle: {
        type: DataTypes.DOUBLE
      },
      minCycleUM: {
        type: DataTypes.STRING
      },
      maxCycle: {
        type: DataTypes.DOUBLE
      },
      maxCycleUM: {
        type: DataTypes.STRING
      },
      warningCycle: {
        type: DataTypes.DOUBLE
      },
      setupInMinutes: {
        type: DataTypes.DOUBLE
      },
      setupInjectionMinutes: {
        type: DataTypes.DOUBLE
      },
      setupAutoMinutes: {
        type: DataTypes.DOUBLE
      },
      setupOutMinutes: {
        type: DataTypes.DOUBLE
      },
      percentageWaste: {
        type: DataTypes.DOUBLE
      },
      ideal_cycle_measurement_unit: DataTypes.VIRTUAL
    },
    {
      timestamps: true
    }
  );
  machine_mold_products.associate = function(models) {
    models.machine_mold_product.belongsTo(models.company);
  };
  return machine_mold_products;
};
