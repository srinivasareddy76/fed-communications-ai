
// Lambda handler for Fed Communications AI
const serverless = require('serverless-http');

try {
  // Import Lambda-optimized Express app (without Socket.IO)
  const app = require('./lambda-server');
  
  // Wrap Express app for Lambda
  module.exports.handler = serverless(app, {
    binary: ['image/*', 'application/pdf', 'application/octet-stream'],
    request: function(request, event, context) {
      // Add Lambda context to request
      request.context = context;
      request.event = event;
    }
  });
  
  console.log('✅ Lambda handler initialized successfully');
  
} catch (error) {
  console.error('❌ Error initializing Lambda handler:', error);
  
  // Fallback handler for debugging
  module.exports.handler = async (event, context) => {
    console.error('Lambda initialization failed:', error);
    
    // Log event details for debugging
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
        details: 'Lambda handler initialization failed',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  };
}
