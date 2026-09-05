require('dotenv').config();
const express = require('express');
const cors = require('cors');
//require('dotenv').config();
const app = express();
//connectDB(); // Connect to MongoDB

app.use(express.json());

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const boardRoutes = require('./routes/boardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

//const app = express();

// Connect Database
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/profile', profileRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'SyncBoard REST API Running' });
});

// Global Error Middleware
if (errorHandler) {
  app.use(errorHandler);
}

// Only listen when not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;