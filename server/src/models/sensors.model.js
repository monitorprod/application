const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const sensors = sequelizeClient.define(
    "sensor",
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
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      name: {
        type: DataTypes.STRING
      },
      mac: {
        type: DataTypes.STRING
      },
      ip: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  sensors.associate = function(models) {
    models.sensor.belongsTo(models.company);
    models.sensor.belongsTo(models.sensor_status);
    models.sensor.belongsTo(models.machine);
  };
  return sensors;
};
