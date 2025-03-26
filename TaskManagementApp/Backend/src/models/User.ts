import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'user' | 'admin';
  public profilePicture?: string;
  public preferences!: {
    emailNotifications: boolean;
    darkMode: boolean;
  };
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  profilePicture: {
    type: DataTypes.STRING,
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      emailNotifications: true,
      darkMode: false,
    },
  },
}, {
  sequelize,
  modelName: 'User',
  timestamps: true,
});

export default User;