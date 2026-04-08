require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://dsa-blond-six.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow same-origin/server-to-server tools and explicit frontend origins.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 204
};

// DEBUGGING: Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Handle CORS and preflight requests before routes.
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
