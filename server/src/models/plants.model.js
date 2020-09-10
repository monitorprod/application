const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const plants = sequelizeClient.define(
    "plant",
    {
      name: {
        type: DataTypes.STRING,
        unique: "plant_company",
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      companyId: {
        type: DataTypes.INTEGER,
        unique: "plant_company"
      },
      description: {
        type: DataTypes.STRING
      },
      hoursPerWeek: {
        type: DataTypes.DOUBLE
      },
      notificationTimeMIN: {
        type: DataTypes.DOUBLE
      },
      qualityTrackType: {
        type: Sequelize.ENUM("Q Refugo", "Q Confirmada"),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      qualityTrackFrequency: {
        type: Sequelize.ENUM("Horario", "Turno", "Diario", "Encerramento"),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      wasteJustification: {
        type: DataTypes.BOOLEAN
      },
      wasteAutoTrack: {
        type: DataTypes.BOOLEAN
      },
      PONotes: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  plants.associate = function(models) {
    models.plant.belongsTo(models.company);
    models.plant.belongsTo(models.plant_status);
  };
  return plants;
};
