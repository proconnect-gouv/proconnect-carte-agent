const http = require('http');
const https = require('https');
const express = require('express');

// Configuration from environment variables
const HOST = process.env.HOST || '0.0.0.0';
const HTTP_PORT = process.env.HTTP_PORT || 8080;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

// Initialize HTTP app
const httpApp = express();

httpApp.get('/', (req, res) => {
  res.status(200).send('HTTP server is running');
});

httpApp.get('/ping', (req, res) => {
  res.status(200).send('OK');
});

// Initialize HTTPS app
const httpsApp = express();

// Basic API endpoint
httpsApp.get('/', (req, res) => {
  // Get client certificate information
  const clientCert = req.socket.getPeerCertificate(true);

  if (clientCert?.subject) {
    console.log('Client connected with certificate:');
    console.log(`- Subject: ${JSON.stringify(clientCert.subject)}`);
    console.log(`- Issuer: ${JSON.stringify(clientCert.issuer)}`);
    console.log(`- Valid from: ${clientCert.valid_from}`);
    console.log(`- Valid to: ${clientCert.valid_to}`);

    res.json({
      message: 'mTLS Authentication Successful!',
      clientCertificate: {
        subject: clientCert.subject,
        issuer: clientCert.issuer,
        validFrom: clientCert.valid_from,
        validTo: clientCert.valid_to
      }
    });
  } else {
    console.log('Client connected without certificate');
    res.status(401).json({ message: 'Client certificate required' });
  }
});

const serverOptions = {
  key: process.env.SERVER_KEY,
  cert: process.env.SERVER_CERT,
  ca: process.env.SERVER_CA,
  enableTrace: process.env.SERVER_TLS_TRACE == "true",

  // Request client certificate
  requestCert: true,

  // Disable TLS 1.3 because it requires RSA-PSS and old smartcards do not support it
  secureOptions: require('constants').SSL_OP_NO_TLSv1_3,

  rejectUnauthorized: false // Node default is rejectUnauthorized==true
};

// Create the HTTP server
const httpServer = http.createServer(httpApp);

// Create the HTTPS server
const httpsServer = https.createServer(serverOptions, httpsApp);

httpsServer.on('connection', (socket) => {
  console.log(`New connection established from ${socket.remoteAddress}:${socket.remotePort}`);
});

httpsServer.on('secureConnection', (socket) => {
  console.log(`Secure connection established from ${socket.remoteAddress}:${socket.remotePort}`);
  console.log(`  Authorized: ${socket.authorized} (${socket.authorizationError})`);
});

httpsServer.on('tlsClientError', (err, socket) => {
  console.error('TLS client error:', err);
});

httpsServer.on('error', (err) => {
  console.error('Server error:', err);
});

// Start the servers
httpServer.listen(HTTP_PORT, HOST, () => {
  console.log(`HTTP server running at http://${HOST}:${HTTP_PORT}/`);
});

httpsServer.listen(HTTPS_PORT, HOST, () => {
  console.log(`HTTPS server running at https://${HOST}:${HTTPS_PORT}/`);
});
