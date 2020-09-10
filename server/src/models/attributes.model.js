const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const attributes = sequelizeClient.define(
    "attribute",
    {
      identity: {
        type: DataTypes.STRING,
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
      timestamps: true,
    }
  );
  attributes.associate = function(models) {
    models.attribute.belongsTo(models.company);
    models.attribute.belongsTo(models.attribute_group);
    models.attribute.hasMany(models.attribute_list_value);
    models.attribute.belongsToMany(models.machine, {
      through: models.machine_attribute
    });
    models.attribute.belongsToMany(models.mold, {
      through: models.mold_attribute
    });
    models.attribute.belongsToMany(models.product, {
      through: models.product_attribute
    });
    models.attribute.belongsToMany(models.sensor, {
      through: models.sensor_attribute
    });
  };
  return attributes;
};
