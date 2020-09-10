const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const ticket_messages = sequelizeClient.define(
    "ticket_message",
    {
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
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
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      viewedAt: {
        type: DataTypes.DATE
      }
    },
    {
      timestamps: true
    }
  );
  ticket_messages.associate = function(models) {
    models.ticket_message.belongsTo(models.company);
    models.ticket_message.belongsTo(models.user);
    models.ticket_message.belongsTo(models.ticket);
  };
  return ticket_messages;
};
