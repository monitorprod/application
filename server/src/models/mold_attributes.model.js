const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const mold_attributes = sequelizeClient.define(
    "mold_attribute",
    {
      value: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  mold_attributes.associate = function(models) {
    models.mold_attribute.belongsTo(models.company);
  };
  return mold_attributes;
};
