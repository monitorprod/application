const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const holidays = sequelizeClient.define(
    "holiday",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      noWorkDay: {
        type: DataTypes.BOOLEAN
      },
      recurring: {
        type: DataTypes.BOOLEAN
      },
      isSystemHoliday: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  holidays.associate = function(models) {
    models.holiday.belongsTo(models.company);
    models.holiday.belongsTo(models.plant);
  };
  return holidays;
};
