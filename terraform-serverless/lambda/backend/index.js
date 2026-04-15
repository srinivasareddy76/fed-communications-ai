


// Federal Reserve Communications AI - Backend Lambda Function
// This function handles all API endpoints and DynamoDB operations

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment variables
const INQUIRIES_TABLE = process.env.DYNAMODB_INQUIRIES_TABLE;
const TEMPLATES_TABLE = process.env.DYNAMODB_TEMPLATES_TABLE;
const ANALYTICS_TABLE = process.env.DYNAMODB_ANALYTICS_TABLE;

// Sample Federal Reserve inquiries data
const sampleInquiries = [
    {
        inquiry_id: uuidv4(),
        subject: "Federal Funds Rate Policy Clarification",
        body: "We are seeking clarification on the Federal Reserve's current stance regarding the federal funds rate trajectory for the remainder of 2024. Our analysis suggests potential impacts on regional banking operations.",
        category: "Monetary Policy",
        priority: "high",
        source: "Regional Bank Association",
        date: new Date().toISOString(),
        status: "pending",
        sentiment: "neutral"
    },
    {
        inquiry_id: uuidv4(),
        subject: "Inflation Targeting Strategy Update",
        body: "Request for updated information on the Federal Reserve's inflation targeting strategy, particularly regarding the 2% target and any potential adjustments based on current economic conditions.",
        category: "Economic Policy",
        priority: "medium",
        source: "Economic Research Institute",
        date: new Date(Date.now() - 3600000).toISOString(),
        status: "pending",
        sentiment: "positive"
    },
    {
        inquiry_id: uuidv4(),
        subject: "Banking Supervision Guidelines",
        body: "Inquiry regarding recent updates to banking supervision guidelines and their implementation timeline. We need clarification on compliance requirements for community banks.",
        category: "Banking Regulation",
        priority: "high",
        source: "Community Banking Coalition",
        date: new Date(Date.now() - 7200000).toISOString(),
        status: "in_progress",
        sentiment: "neutral"
    },
    {
        inquiry_id: uuidv4(),
        subject: "Employment Data Methodology",
        body: "Request for detailed information about the methodology used in employment data analysis and how it influences Federal Reserve policy decisions.",
        category: "Economic Data",
        priority: "low",
        source: "Academic Institution",
        date: new Date(Date.now() - 10800000).toISOString(),
        status: "pending",
        sentiment: "positive"
    },
    {
        inquiry_id: uuidv4(),
        subject: "Digital Currency Policy Framework",
        body: "Seeking information on the Federal Reserve's current position and policy framework regarding Central Bank Digital Currencies (CBDCs) and their potential implementation.",
        category: "Digital Currency",
        priority: "medium",
        source: "Financial Technology Association",
        date: new Date(Date.now() - 14400000).toISOString(),
        status: "pending",
        sentiment: "neutral"
    }
];

// Sample dashboard analytics data
const sampleAnalytics = {
    federalReserveRates: {
        federalFundsRate: "5.25-5.50%",
        discountRate: "5.50%",
        tenYearTreasury: "4.28%",
        lastUpdated: new Date().toISOString()
    },
    economicIndicators: {
        unemploymentRate: "3.7%",
        corePCEInflation: "3.2%",
        gdpGrowth: "4.9%",
        lastUpdated: new Date().toISOString()
    },
    communicationSentiment: {
        positive: 65,
        neutral: 25,
        negative: 10,
        trend: "+8% this week"
    },
    trendingTopics: [
        "Interest Rates",
        "Inflation",
        "Employment",
        "Banking Policy",
        "Economic Outlook",
        "FOMC Decisions"
    ],
    priorityAlerts: [
        {
            level: "🔴",
            message: "High-profile media inquiry on rate policy",
            timestamp: new Date().toISOString()
        },
        {
            level: "🟡",
            message: "Congressional request for inflation data",
            timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
            level: "🟢",
            message: "Routine public information requests",
            timestamp: new Date(Date.now() - 7200000).toISOString()
        }
    ],
    marketImpact: {
        sp500: "+0.8%",
        usdIndex: "103.2",
        vix: "16.4",
        lastUpdated: new Date().toISOString()
    }
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

// Helper function to create response
function createResponse(statusCode, body, additionalHeaders = {}) {
    return {
        statusCode,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            ...additionalHeaders
        },
        body: JSON.stringify(body)
    };
}

// Initialize sample data in DynamoDB
async function initializeSampleData() {
    try {
        // Check if inquiries already exist
        const existingInquiries = await dynamodb.scan({
            TableName: INQUIRIES_TABLE,
            Limit: 1
        }).promise();

        if (existingInquiries.Items.length === 0) {
            console.log('Initializing sample inquiries...');
            
            // Insert sample inquiries
            for (const inquiry of sampleInquiries) {
                await dynamodb.put({
                    TableName: INQUIRIES_TABLE,
                    Item: {
                        ...inquiry,
                        date_created: inquiry.date
                    }
                }).promise();
            }

            // Insert sample analytics data
            await dynamodb.put({
                TableName: ANALYTICS_TABLE,
                Item: {
                    metric_id: 'dashboard-data',
                    metric_type: 'dashboard',
                    data: sampleAnalytics,
                    last_updated: new Date().toISOString()
                }
            }).promise();

            console.log('Sample data initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Get all inquiries
async function getInquiries(queryParams = {}) {
    try {
        await initializeSampleData();

        const params = {
            TableName: INQUIRIES_TABLE
        };

        // Add filters based on query parameters
        if (queryParams.category) {
            params.IndexName = 'category-index';
            params.KeyConditionExpression = 'category = :category';
            params.ExpressionAttributeValues = {
                ':category': queryParams.category
            };
        } else if (queryParams.priority) {
            params.IndexName = 'priority-index';
            params.KeyConditionExpression = 'priority = :priority';
            params.ExpressionAttributeValues = {
                ':priority': queryParams.priority
            };
        }

        const result = params.KeyConditionExpression 
            ? await dynamodb.query(params).promise()
            : await dynamodb.scan(params).promise();

        // Sort by date (newest first)
        const sortedInquiries = result.Items.sort((a, b) => 
            new Date(b.date || b.date_created) - new Date(a.date || a.date_created)
        );

        return {
            inquiries: sortedInquiries,
            total: sortedInquiries.length,
            page: 1,
            totalPages: 1
        };
    } catch (error) {
        console.error('Error getting inquiries:', error);
        throw error;
    }
}

// Get specific inquiry by ID
async function getInquiryById(inquiryId) {
    try {
        const result = await dynamodb.get({
            TableName: INQUIRIES_TABLE,
            Key: { inquiry_id: inquiryId }
        }).promise();

        return result.Item;
    } catch (error) {
        console.error('Error getting inquiry by ID:', error);
        throw error;
    }
}

// Create new inquiry
async function createInquiry(inquiryData) {
    try {
        const inquiry = {
            inquiry_id: uuidv4(),
            ...inquiryData,
            date: new Date().toISOString(),
            date_created: new Date().toISOString(),
            status: 'pending'
        };

        await dynamodb.put({
            TableName: INQUIRIES_TABLE,
            Item: inquiry
        }).promise();

        return inquiry;
    } catch (error) {
        console.error('Error creating inquiry:', error);
        throw error;
    }
}

// Update inquiry
async function updateInquiry(inquiryId, updateData) {
    try {
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updateData).forEach(key => {
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = updateData[key];
        });

        const result = await dynamodb.update({
            TableName: INQUIRIES_TABLE,
            Key: { inquiry_id: inquiryId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        }).promise();

        return result.Attributes;
    } catch (error) {
        console.error('Error updating inquiry:', error);
        throw error;
    }
}

// Get dashboard analytics
async function getDashboardAnalytics() {
    try {
        await initializeSampleData();

        const result = await dynamodb.get({
            TableName: ANALYTICS_TABLE,
            Key: { 
                metric_id: 'dashboard-data',
                metric_type: 'dashboard'
            }
        }).promise();

        if (result.Item) {
            return result.Item.data;
        } else {
            // Return sample data if not found in database
            return sampleAnalytics;
        }
    } catch (error) {
        console.error('Error getting dashboard analytics:', error);
        // Return sample data on error
        return sampleAnalytics;
    }
}

// Main Lambda handler
exports.handler = async (event, context) => {
    console.log('Backend Lambda invoked:', JSON.stringify(event, null, 2));

    try {
        const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
        const requestBody = body ? JSON.parse(body) : {};

        // Handle different routes
        switch (true) {
            // GET /api/inquiries
            case httpMethod === 'GET' && path === '/api/inquiries':
                const inquiries = await getInquiries(queryStringParameters || {});
                return createResponse(200, inquiries);

            // GET /api/inquiries/{id}
            case httpMethod === 'GET' && path.startsWith('/api/inquiries/') && pathParameters?.id:
                const inquiry = await getInquiryById(pathParameters.id);
                if (!inquiry) {
                    return createResponse(404, { error: 'Inquiry not found' });
                }
                return createResponse(200, inquiry);

            // POST /api/inquiries
            case httpMethod === 'POST' && path === '/api/inquiries':
                const newInquiry = await createInquiry(requestBody);
                return createResponse(201, newInquiry);

            // PUT /api/inquiries/{id}
            case httpMethod === 'PUT' && path.startsWith('/api/inquiries/') && pathParameters?.id:
                const updatedInquiry = await updateInquiry(pathParameters.id, requestBody);
                return createResponse(200, updatedInquiry);

            // GET /api/dashboard/analytics
            case httpMethod === 'GET' && path === '/api/dashboard/analytics':
                const analytics = await getDashboardAnalytics();
                return createResponse(200, analytics);

            // Handle OPTIONS requests (CORS preflight)
            case httpMethod === 'OPTIONS':
                return createResponse(200, {});

            // Default case - route not found
            default:
                return createResponse(404, { 
                    error: 'Route not found',
                    method: httpMethod,
                    path: path
                });
        }
    } catch (error) {
        console.error('Lambda execution error:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message
        });
    }
};



