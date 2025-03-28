import { AppDataSource } from './data-source';

// Initialize the data source
AppDataSource.initialize()
  .then(() => console.log('Database connected'))
  .catch(error => console.error('Database connection error:', error));