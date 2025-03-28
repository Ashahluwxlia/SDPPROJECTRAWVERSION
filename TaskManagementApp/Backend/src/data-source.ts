import { DataSource } from 'typeorm';
import { Task } from './models/Task';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [Task],
  synchronize: true,
  logging: true
});