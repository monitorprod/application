const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const attribute_groups = sequelizeClient.define(
    "attribute_group",
    {
      identity: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  attribute_groups.associate = function(models) {
    models.attribute_group.belongsTo(models.company);
    models.attribute_group.hasMany(models.attribute);
  };
  return attribute_groups;
};
