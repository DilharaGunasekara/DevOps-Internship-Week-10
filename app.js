const http = require('http');

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || 'v1';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <h1>DevOps Internship - Week 09</h1>
    <h2>CI/CD Deployment Application</h2>
    <p>Application Version: ${APP_VERSION}</p>
    <p>Status: Running Successfully</p>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Week 09 application ${APP_VERSION} running on port ${PORT}`);
});

module.exports = server;
