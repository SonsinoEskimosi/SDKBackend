const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || (isDev ? 3001 : 80);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SDKBackend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});

