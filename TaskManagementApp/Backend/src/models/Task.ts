import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Task extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public status!: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  public priority!: 'LOW' | 'MEDIUM' | 'HIGH';
  public assignedToId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public dueDate?: Date;
}

Task.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'TODO',
    validate: {
      isIn: [['TODO', 'IN_PROGRESS', 'COMPLETED']]
    }
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'MEDIUM',
    validate: {
      isIn: [['LOW', 'MEDIUM', 'HIGH']]
    }
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: 'Task',
  timestamps: true,
});

// Define the relationship
Task.belongsTo(User, {
  foreignKey: 'assignedToId',
  as: 'assignedTo'
});

export default Task;