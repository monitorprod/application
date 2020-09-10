const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get("sequelizeClient");
  const tickets = sequelizeClient.define(
    "ticket",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      content: {
        type: DataTypes.TEXT,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      timestamps: true
    }
  );
  tickets.associate = function(models) {
    models.ticket.belongsTo(models.company);
    models.ticket.belongsTo(models.user);
    models.ticket.belongsTo(models.ticket_statuses);
  };
  return tickets;
};
