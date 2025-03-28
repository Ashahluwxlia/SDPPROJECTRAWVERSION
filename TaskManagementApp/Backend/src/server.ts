import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5241;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});