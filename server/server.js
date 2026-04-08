require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
const corsOptions = {
  origin: ['https://dsa-blond-six.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
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
// Use path.resolve to ensure absolute pathing
const uploadsPath = path.resolve(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsPath));

// API health check
app.get('/api/test', (req, res) => res.json({ message: 'API is working' }));

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => console.log('MongoDB Connection Error: ', err));
} else {
  console.log('Provide MONGO_URI in .env to connect to the database.');
}

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.json({ message: 'DSA Tracker API is live' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
