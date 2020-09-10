const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

// TODO structure folders for model and services, explicit fields on models, remove foreign keys?
module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const wiki_sections = sequelizeClient.define(
    "wiki_section",
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
      content: {
        type: DataTypes.TEXT
      }
    },
    {
      timestamps: true
    }
  );
  wiki_sections.associate = function(models) {
    models.wiki_section.belongsTo(models.wiki_page);
  };
  return wiki_sections;
};
