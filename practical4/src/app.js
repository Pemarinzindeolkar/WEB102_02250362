const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');      // ← ADD THIS
const videoRoutes = require('./routes/videos');   // ← ADD THIS if not there

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);    // ← ADD THIS
app.use('/api/videos', videoRoutes);  // ← ADD THIS if not there

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;