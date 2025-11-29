import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const isDev = process.env.NODE_ENV === 'development';
const PORT = process.env.PORT || (isDev ? 3001 : 80);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve SDK as static file
app.use('/sdk', express.static(path.join(__dirname, '../public/sdk')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to JSSDK Backend API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
  console.log(`SDK available at http://localhost:${PORT}/sdk/sdk.js`);
});

