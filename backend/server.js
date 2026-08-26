const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const boardRoutes = require('./routes/boardRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Database Connection
connectDB();

// Global Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/profile', profileRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'SyncBoard REST API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));