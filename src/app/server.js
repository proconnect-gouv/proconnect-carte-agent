require('dotenv').config();
const http = require('http');
const express = require('express');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Basic API endpoint
app.get('/', (req, res) => {
  console.log('Client connected');
  res.status(200).json({ message: 'Hello', headers: req.headers });
});

app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});

// Create the HTTPS server with Express
const server = http.createServer(app);

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Start the server
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Server cert:\n${process.env.SERVER_CERT}`);
});
