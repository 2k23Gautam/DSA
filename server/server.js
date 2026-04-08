require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Request logging for debugging production issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`Origin: ${req.get('origin')}`);
  next();
});

// Robust CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    
    const allowedPatterns = [
      'vercel.app',
      'localhost',
      '127.0.0.1'
    ];
    
    const isAllowed = allowedPatterns.some(pattern => origin.includes(pattern));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/users', require('./routes/users'));
app.use('/api/platforms', require('./routes/platforms'));
app.use('/api/leetcode', require('./routes/leetcode'));

// Serve uploaded profile images
const uploadsPath = path.resolve(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsPath));

// API health check
app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DSA Tracker API is live',
    timestamp: new Date().toISOString(),
    status: 'Operational'
  });
});

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => {
      console.error('MongoDB Connection Error:');
      console.error(err);
    });
} else {
  console.error('CRITICAL: MONGO_URI is missing in environment variables.');
}

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
