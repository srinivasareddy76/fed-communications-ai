
// Lambda handler for Fed Communications AI
const serverless = require('serverless-http');

// Import your existing Express app
const app = require('./backend/server');

// Wrap Express app for Lambda
module.exports.handler = serverless(app);
