const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const wiki_pages = sequelizeClient.define(
    "wiki_page",
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
      icon: {
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
  wiki_pages.associate = function(models) {
    models.wiki_page.belongsTo(models.wiki_page);
  };
  return wiki_pages;
};
