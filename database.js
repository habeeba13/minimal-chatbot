const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: false
  }
});

User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

const Prompt = sequelize.define('Prompt', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  projectId: {
    type: DataTypes.INTEGER,
    references: {
      model: Project,
      key: 'id'
    },
    allowNull: false
  }
});

Project.hasMany(Prompt, { foreignKey: 'projectId' });
Prompt.belongsTo(Project, { foreignKey: 'projectId' });

module.exports = { sequelize, User, Project, Prompt };
