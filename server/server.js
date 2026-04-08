require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// DEBUGGING: Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// BULLETPROOF CORS - Using a simple setup to first confirm connectivity
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// USE ABSOLUTE PATHS FOR ROUTES (Fixes 404s on Render)
// __dirname is the directory of the current file (server/)
const authRoutes = require(path.resolve(__dirname, 'routes/auth'));
const probRoutes = require(path.resolve(__dirname, 'routes/problems'));
const userBaseRoutes = require(path.resolve(__dirname, 'routes/users'));
const platformRoutes = require(path.resolve(__dirname, 'routes/platforms'));
const leetcodeRoutes = require(path.resolve(__dirname, 'routes/leetcode'));

app.use('/api/auth', authRoutes);
app.use('/api/problems', probRoutes);
app.use('/api/users', userBaseRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/leetcode', leetcodeRoutes);

// Fix Static Uploads
app.use('/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

app.get('/api/test', (req, res) => res.json({ status: "ok" }));
app.get('/', (req, res) => res.send("API IS RUNNING"));

// MONGODB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => console.error('DB ERROR:', err));
} else {
  console.error('CRITICAL: MONGO_URI is missing');
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
