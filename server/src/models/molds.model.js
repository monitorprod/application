const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const molds = sequelizeClient.define(
    "mold",
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV1
      },
      barcode: {
        type: DataTypes.STRING
      },
      identity: {
        type: DataTypes.STRING,
        unique: "mold_company",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      companyId: {
        type: DataTypes.INTEGER,
        unique: "mold_company"
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      cavities: {
        type: DataTypes.INTEGER,
      },
      maker: {
        type: DataTypes.STRING
      },
      manufactureYear: {
        type: DataTypes.INTEGER
      },
      serialNr: {
        type: DataTypes.STRING
      },
      endGuarantee: {
        type: DataTypes.DATE
      },
      initialCycle: {
        type: DataTypes.DOUBLE
      },
      idealCycle: {
        type: DataTypes.DOUBLE
      },
      idealCycleUM: {
        type: DataTypes.STRING
      },
      nozzleType: {
        type: DataTypes.STRING
      },
      length: {
        type: DataTypes.DOUBLE
      },
      lengthUM: {
        type: DataTypes.STRING
      },
      width: {
        type: DataTypes.DOUBLE
      },
      widthUM: {
        type: DataTypes.STRING
      },
      height: {
        type: DataTypes.DOUBLE
      },
      heightUM: {
        type: DataTypes.STRING
      },
      centralRingDiameter: {
        type: DataTypes.DOUBLE
      },
      centralRingDiameterUM: {
        type: DataTypes.STRING
      },
      weight: {
        type: DataTypes.DOUBLE
      },
      weightUM: {
        type: DataTypes.STRING
      },
      image: {
        type: DataTypes.STRING
      },
      hoursForMaintenance: {
        type: DataTypes.DOUBLE
      },
      cyclesForMaintenance: {
        type: DataTypes.DOUBLE
      },
      // TODO change all xUM to INTs?
      cyclesForMaintenanceUM: {
        type: DataTypes.STRING
      },
      ideal_cycle_measurement_unit: DataTypes.VIRTUAL
    },
    {
      timestamps: true
    }
  );
  molds.associate = function(models) {
    models.mold.belongsTo(models.company);
    models.mold.belongsTo(models.mold_status);
    models.mold.belongsToMany(models.product, {
      through: models.mold_product
    });
    models.mold.belongsToMany(models.attribute, {
      through: models.mold_attribute
    });
  };
  return molds;
};
