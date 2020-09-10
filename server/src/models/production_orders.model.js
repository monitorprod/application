const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const production_orders = sequelizeClient.define(
    "production_order",
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV1
      },
      expectedStartDate: {
        type: DataTypes.DATE
      },
      expectedEndDate: {
        type: DataTypes.DATE
      },
      actualStartDate: {
        type: DataTypes.DATE
      },
      actualEndDate: {
        type: DataTypes.DATE
      },
      lot: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      color: {
        type: DataTypes.STRING
      },
      expectedProduction: {
        type: DataTypes.INTEGER
      },
      expectedProductionUM: {
        type: DataTypes.STRING
      },
      totalProduction: {
        type: DataTypes.INTEGER
      },
      totalProductionUM: {
        type: DataTypes.STRING
      },
      confirmedProduction: {
        type: DataTypes.INTEGER
      },
      wastedProduction: {
        type: DataTypes.INTEGER
      },
      openCavities: {
        type: DataTypes.INTEGER
      },
      idealCycle: {
        type: DataTypes.DOUBLE
      },
      idealCycleUM: {
        type: DataTypes.STRING
      },
      maxCycle: {
        type: DataTypes.DOUBLE
      },
      maxCycleUM: {
        type: DataTypes.STRING
      },
      minCycle: {
        type: DataTypes.DOUBLE
      },
      minCycleUM: {
        type: DataTypes.STRING
      },
      totalDuration: {
        type: DataTypes.DOUBLE
      },
      totalDurationUM: {
        type: DataTypes.STRING
      },
      percentageWaste: {
        type: DataTypes.DOUBLE
      },
      setupProductMinutes: {
        type: DataTypes.DOUBLE
      },
      hasSetupProductMinutes: {
        type: DataTypes.BOOLEAN
      },
      setupInMinutes: {
        type: DataTypes.DOUBLE
      },
      hasSetupInMinutes: {
        type: DataTypes.BOOLEAN
      },
      setupInjectionMinutes: {
        type: DataTypes.DOUBLE
      },
      hasSetupInjectionMinutes: {
        type: DataTypes.BOOLEAN
      },
      setupAutoMinutes: {
        type: DataTypes.DOUBLE
      },
      hasSetupAutoMinutes: {
        type: DataTypes.BOOLEAN
      },
      setupOutMinutes: {
        type: DataTypes.DOUBLE
      },
      hasSetupOutMinutes: {
        type: DataTypes.BOOLEAN
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isClosed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isContinuos: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      mostRecentEvent: DataTypes.VIRTUAL,
      lastReading: DataTypes.VIRTUAL,
      events: DataTypes.VIRTUAL
    },
    {
      timestamps: true
    }
  );
  production_orders.associate = function(models) {
    models.production_order.belongsTo(models.company);
    models.production_order.belongsTo(models.machine);
    models.production_order.belongsTo(models.mold);
    models.production_order.belongsTo(models.product);
    models.production_order.belongsTo(models.sensor);
    models.production_order.belongsTo(models.plant);
    models.production_order.belongsTo(models.production_order_type);
    models.production_order.belongsTo(models.production_order_status);
  };
  return production_orders;
};
