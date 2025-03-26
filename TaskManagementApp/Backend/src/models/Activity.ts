import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Activity extends Model {
  public id!: number;
  public userId!: number;
  public type!: string;
  public description!: string;
}

Activity.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('profile', 'task', 'login', 'other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Activity',
  timestamps: true,
});

Activity.belongsTo(User);
User.hasMany(Activity);

export default Activity;