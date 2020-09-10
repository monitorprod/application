const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

module.exports = function(app) {
  const sequelizeClient = app.get("sequelizeClient");
  const companies = sequelizeClient.define(
    "company",
    {
      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.UUIDV1
      },
      level: {
        type: Sequelize.ENUM("N1", "N6"),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      fantasyName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      loginName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      taxId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      logo: {
        type: DataTypes.STRING
      },
      usersLimit: {
        type: DataTypes.INTEGER
      },
      machinesLimit: {
        type: DataTypes.INTEGER
      },
      stateRegistration: {
        type: DataTypes.STRING
      },
      municipalRegistration: {
        type: DataTypes.STRING
      },
      adminContact: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      adminEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      },
      technicalContact: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      technicalEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      },
      address: {
        type: DataTypes.STRING
      },
      addressNumber: {
        type: DataTypes.STRING
      },
      neighborhood: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      cep: {
        type: DataTypes.STRING
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      phone2: {
        type: DataTypes.STRING
      }
    },
    {
      timestamps: true
    }
  );
  companies.associate = function(models) {
    models.company.belongsTo(models.company_status);
  };
  return companies;
};
