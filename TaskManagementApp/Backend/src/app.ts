import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import bodyParser from 'body-parser';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middleware/errorHandler';

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());
// Update CORS configuration
// Add this early in your middleware chain
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(error => console.error('Database connection error:', error));

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (must come after all other middleware/routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

// Export the app for use in other files
export default app;