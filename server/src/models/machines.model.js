const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const machines = sequelizeClient.define(
    "machine",
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
        unique: "machine_company",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      companyId: {
        type: DataTypes.INTEGER,
        unique: "machine_company"
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      maker: {
        type: DataTypes.STRING
      },
      manufactureYear: {
        type: DataTypes.INTEGER
      },
      model: {
        type: DataTypes.STRING
      },
      serialNr: {
        type: DataTypes.STRING
      },
      endGuarantee: {
        type: DataTypes.DATE
      },
      lockingForce: {
        type: DataTypes.DOUBLE
      },
      lockingForceUM: {
        type: DataTypes.STRING
      },
      distanceColumnsLength: {
        type: DataTypes.DOUBLE
      },
      distanceColumnsLengthUM: {
        type: DataTypes.STRING
      },
      distanceColumnsWidth: {
        type: DataTypes.DOUBLE
      },
      distanceColumnsWidthUM: {
        type: DataTypes.STRING
      },
      centralRingDiameter: {
        type: DataTypes.DOUBLE
      },
      centralRingDiameterUM: {
        type: DataTypes.STRING
      },
      injectionThreadDiameter: {
        type: DataTypes.DOUBLE
      },
      injectionThreadDiameterUM: {
        type: DataTypes.STRING
      },
      nozzleType: {
        type: DataTypes.STRING
      },
      plateSizeLength: {
        type: DataTypes.DOUBLE
      },
      plateSizeLengthUM: {
        type: DataTypes.STRING
      },
      plateSizeWidth: {
        type: DataTypes.DOUBLE
      },
      plateSizeWidthUM: {
        type: DataTypes.STRING
      },
      openingStroke: {
        type: DataTypes.DOUBLE
      },
      openingStrokeUM: {
        type: DataTypes.STRING
      },
      minMoldHeight: {
        type: DataTypes.DOUBLE
      },
      minMoldHeightUM: {
        type: DataTypes.STRING
      },
      maxMoldHeight: {
        type: DataTypes.DOUBLE
      },
      maxMoldHeightUM: {
        type: DataTypes.STRING
      },
      maxMoldWeight: {
        type: DataTypes.DOUBLE
      },
      maxMoldWeightUM: {
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
      cyclesForMaintenanceUM: {
        type: DataTypes.STRING
      },
      idealCycle: {
        type: DataTypes.DOUBLE
      },
      idealCycleUM: {
        type: DataTypes.STRING
      },
      ideal_cycle_measurement_unit: DataTypes.VIRTUAL
    },
    {
      timestamps: true
    }
  );
  machines.associate = function(models) {
    models.machine.belongsTo(models.company);
    models.machine.belongsTo(models.machine_type);
    models.machine.belongsTo(models.plant);
    models.machine.belongsTo(models.machine_status);
    models.machine.belongsToMany(models.attribute, {
      through: models.machine_attribute
    });
  };
  return machines;
};
