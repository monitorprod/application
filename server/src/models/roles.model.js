const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const roles = sequelizeClient.define(
    "role",
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
      writeMasterData: {
        type: DataTypes.BOOLEAN
      },
      readMasterData: {
        type: DataTypes.BOOLEAN
      },
      crudAdminData: {
        type: DataTypes.BOOLEAN
      },
      crudUserData: {
        type: DataTypes.BOOLEAN
      },
      writeActiveProductionOrders: {
        type: DataTypes.BOOLEAN
      },
      writeScheduledStopProductionOrders: {
        type: DataTypes.BOOLEAN
      },
      openProductionOrders: {
        type: DataTypes.BOOLEAN
      },
      writeProductionOrderEvents: {
        type: DataTypes.BOOLEAN
      },
      readProductionOrders: {
        type: DataTypes.BOOLEAN
      },
      readProductionOrderReports: {
        type: DataTypes.BOOLEAN
      },
      readPendingWaste: {
        type: DataTypes.BOOLEAN
      },
      writePendingWaste: {
        type: DataTypes.BOOLEAN
      },
      editPendingWaste: {
        type: DataTypes.BOOLEAN
      },
      editProductionOrderEvents: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      timestamps: true
    }
  );
  roles.associate = function(models) {
    models.role.belongsTo(models.role_status);
    models.role.belongsToMany(models.user, {
      through: models.user_roles
    });
  };
  return roles;
};
