#!/usr/bin/env node

// Test server for Fed Communications AI (S3-based backend)
// This simulates the Lambda environment locally for testing

const http = require('http');
const url = require('url');

// Import the Lambda functions
const frontendHandler = require('./terraform-serverless/lambda/frontend/index.js');
const backendHandler = require('./terraform-serverless/lambda/backend/index.js');

const PORT = 53788;

// Mock Lambda event creator
function createLambdaEvent(req) {
    const parsedUrl = url.parse(req.url, true);
    
    return {
        httpMethod: req.method,
        path: parsedUrl.pathname,
        pathParameters: extractPathParameters(parsedUrl.pathname),
        queryStringParameters: parsedUrl.query || {},
        headers: req.headers,
        body: null, // Will be set for POST requests
        requestContext: {
            requestId: `test-${Date.now()}`,
            stage: 'test'
        }
    };
}

function extractPathParameters(path) {
    // Extract path parameters for API routes
    const apiMatch = path.match(/^\/api\/([^\/]+)\/(.+)$/);
    if (apiMatch) {
        return { id: apiMatch[2] };
    }
    return null;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    try {
        let body = '';
        
        // Collect request body for POST requests
        if (req.method === 'POST') {
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            await new Promise(resolve => {
                req.on('end', resolve);
            });
        }
        
        // Create Lambda event
        const event = createLambdaEvent(req);
        if (body) {
            event.body = body;
        }
        
        let response;
        
        // Route to appropriate Lambda function
        if (req.url.startsWith('/api/')) {
            // Backend Lambda
            console.log('Backend Lambda invoked:', JSON.stringify(event, null, 2));
            response = await backendHandler.handler(event);
        } else {
            // Frontend Lambda
            console.log('Frontend Lambda invoked:', JSON.stringify(event, null, 2));
            response = await frontendHandler.handler(event);
        }
        
        // Send response
        res.writeHead(response.statusCode, response.headers || {});
        res.end(response.body);
        
    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error', message: error.message }));
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fed Communications AI Test Server running at:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('📊 Testing S3-based backend with fallback data...');
    console.log('🛑 Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

