#!/usr/bin/env node

// Test server to run the Fed Communications AI application locally
// This simulates the AWS Lambda + API Gateway environment

const http = require('http');
const url = require('url');
const path = require('path');

// Import the Lambda functions
const frontendHandler = require('./terraform-serverless/lambda/frontend/index.js').handler;
const backendHandler = require('./terraform-serverless/lambda/backend/index.js').handler;

// Mock environment variables for local testing
process.env.DYNAMODB_INQUIRIES_TABLE = 'fed-communications-ai-inquiries-prod';
process.env.DYNAMODB_TEMPLATES_TABLE = 'fed-communications-ai-templates-prod';
process.env.DYNAMODB_ANALYTICS_TABLE = 'fed-communications-ai-analytics-prod';
process.env.DYNAMODB_SENTIMENT_TABLE = 'fed-communications-ai-sentiment-prod';
process.env.DYNAMODB_TRENDING_TABLE = 'fed-communications-ai-trending-prod';
process.env.ENVIRONMENT = 'development';

const PORT = process.env.PORT || 53788;

// Create HTTP server
const server = http.createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        let lambdaEvent;
        let handler;

        // Route to appropriate Lambda function
        if (pathname.startsWith('/api/')) {
            // Backend API routes
            handler = backendHandler;
            
            // Collect request body for POST/PUT requests
            let body = '';
            if (req.method === 'POST' || req.method === 'PUT') {
                await new Promise((resolve) => {
                    req.on('data', chunk => body += chunk);
                    req.on('end', resolve);
                });
            }

            // Extract path parameters for routes like /api/inquiries/{id}
            const pathParts = pathname.split('/');
            let pathParameters = null;
            
            if (pathParts.length > 3 && pathParts[3]) {
                pathParameters = { id: pathParts[3] };
            }

            lambdaEvent = {
                httpMethod: req.method,
                path: pathname,
                pathParameters: pathParameters,
                queryStringParameters: parsedUrl.query,
                body: body || null,
                headers: req.headers,
                requestContext: {
                    requestId: 'test-' + Date.now(),
                    stage: 'test'
                }
            };
        } else {
            // Frontend routes - serve the main application
            handler = frontendHandler;
            lambdaEvent = {
                httpMethod: req.method,
                path: pathname,
                headers: req.headers,
                requestContext: {
                    requestId: 'test-' + Date.now(),
                    stage: 'test'
                }
            };
        }

        // Call the Lambda handler
        const result = await handler(lambdaEvent, {
            getRemainingTimeInMillis: () => 30000,
            functionName: 'test-function',
            functionVersion: '1',
            invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
            memoryLimitInMB: '512',
            awsRequestId: 'test-' + Date.now()
        });

        // Send response
        res.writeHead(result.statusCode || 200, result.headers || {});
        res.end(result.body || '');

    } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Internal server error', 
            message: error.message,
            stack: error.stack 
        }));
    }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log('🏛️  Federal Reserve Communications AI - Test Server');
    console.log('='.repeat(60));
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`🌐 External access: http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('📊 Features Available:');
    console.log('  • AI-Powered Sentiment Analysis');
    console.log('  • Real-time Text Classification');
    console.log('  • AWS Bedrock Response Generation');
    console.log('  • Trending Topics Analysis');
    console.log('  • Communication Insights Dashboard');
    console.log('='.repeat(60));
    console.log('⚠️  Note: This is a development server with mock data');
    console.log('   AWS AI services will return simulated responses');
    console.log('='.repeat(60));
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
