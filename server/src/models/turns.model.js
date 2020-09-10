const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const turns = sequelizeClient.define(
    "turn",
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
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      startTimeHours: {
        type: DataTypes.INTEGER,
      },
      startTimeMinutes: {
        type: DataTypes.INTEGER,
      },
      startTimeSeconds: {
        type: DataTypes.INTEGER,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      endTimeHours: {
        type: DataTypes.INTEGER,
      },
      endTimeMinutes: {
        type: DataTypes.INTEGER,
      },
      endTimeSeconds: {
        type: DataTypes.INTEGER,
      },
      monday: {
        type: DataTypes.BOOLEAN
      },
      tuesday: {
        type: DataTypes.BOOLEAN
      },
      wednesday: {
        type: DataTypes.BOOLEAN
      },
      thursday: {
        type: DataTypes.BOOLEAN
      },
      friday: {
        type: DataTypes.BOOLEAN
      },
      saturday: {
        type: DataTypes.BOOLEAN
      },
      sunday: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  turns.associate = function(models) {
    models.turn.belongsTo(models.company);
    models.turn.belongsTo(models.plant);
  };
  return turns;
};
