


// Federal Reserve Communications AI - Backend Lambda Function
// Enhanced with AWS AI services for NLP, sentiment analysis, and LLM integration

const AWS = require('aws-sdk');
const crypto = require('crypto');

// Simple UUID v4 generator to avoid ES module issues
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize AWS services
const dynamodb = new AWS.DynamoDB.DocumentClient();
const comprehend = new AWS.Comprehend();
const bedrock = new AWS.BedrockRuntime();

// Environment variables
const INQUIRIES_TABLE = process.env.DYNAMODB_INQUIRIES_TABLE;
const TEMPLATES_TABLE = process.env.DYNAMODB_TEMPLATES_TABLE;
const ANALYTICS_TABLE = process.env.DYNAMODB_ANALYTICS_TABLE;
const SENTIMENT_TABLE = process.env.DYNAMODB_SENTIMENT_TABLE;
const TRENDING_TABLE = process.env.DYNAMODB_TRENDING_TABLE;

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

// AI-Powered Functions

// Analyze sentiment using AWS Comprehend
async function analyzeSentiment(text) {
    try {
        const params = {
            Text: text,
            LanguageCode: 'en'
        };
        
        const result = await comprehend.detectSentiment(params).promise();
        return {
            sentiment: result.Sentiment,
            confidence: result.SentimentScore[result.Sentiment],
            scores: result.SentimentScore
        };
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        return {
            sentiment: 'NEUTRAL',
            confidence: 0.5,
            scores: { POSITIVE: 0.33, NEGATIVE: 0.33, NEUTRAL: 0.34, MIXED: 0.0 }
        };
    }
}

// Extract key phrases and entities using AWS Comprehend
async function extractKeyInformation(text) {
    try {
        const [keyPhrasesResult, entitiesResult] = await Promise.all([
            comprehend.detectKeyPhrases({ Text: text, LanguageCode: 'en' }).promise(),
            comprehend.detectEntities({ Text: text, LanguageCode: 'en' }).promise()
        ]);

        return {
            keyPhrases: keyPhrasesResult.KeyPhrases.map(kp => kp.Text),
            entities: entitiesResult.Entities.map(entity => ({
                text: entity.Text,
                type: entity.Type,
                confidence: entity.Score
            }))
        };
    } catch (error) {
        console.error('Error extracting key information:', error);
        return { keyPhrases: [], entities: [] };
    }
}

// Classify communication category using keywords and entities
function classifyInquiry(text, keyPhrases, entities) {
    const categories = {
        'monetary_policy': ['federal funds rate', 'interest rate', 'monetary policy', 'FOMC', 'policy decision'],
        'inflation_policy': ['inflation', 'price stability', 'CPI', 'PCE', '2% target'],
        'banking_supervision': ['stress test', 'banking supervision', 'capital requirements', 'regulation'],
        'economic_analysis': ['employment', 'unemployment', 'GDP', 'economic growth', 'dual mandate'],
        'communication_strategy': ['forward guidance', 'communication', 'market expectations', 'transparency'],
        'research_inquiry': ['research', 'academic', 'study', 'analysis', 'methodology']
    };

    const textLower = text.toLowerCase();
    const allKeywords = [...keyPhrases.map(kp => kp.toLowerCase()), ...entities.map(e => e.text.toLowerCase())];
    
    let bestCategory = 'general_inquiry';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
        let score = 0;
        keywords.forEach(keyword => {
            if (textLower.includes(keyword.toLowerCase())) score += 2;
            if (allKeywords.some(k => k.includes(keyword.toLowerCase()))) score += 1;
        });
        
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
}

// Generate response using AWS Bedrock
async function generateResponse(inquiry, template) {
    try {
        const prompt = `You are a Federal Reserve communications specialist. Generate a professional response to this inquiry:

Subject: ${inquiry.subject}
Content: ${inquiry.content}
Category: ${inquiry.category}

Use this template as guidance but personalize it for the specific inquiry:
${template ? template.template : 'Provide a professional, informative response addressing the inquiry while maintaining Federal Reserve communication standards.'}

Response:`;

        const params = {
            modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 500,
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })
        };

        const result = await bedrock.invokeModel(params).promise();
        const response = JSON.parse(new TextDecoder().decode(result.body));
        
        return response.content[0].text;
    } catch (error) {
        console.error('Error generating response with Bedrock:', error);
        return template ? template.template : 'Thank you for your inquiry. We will review your message and respond appropriately.';
    }
}

// Store sentiment analysis results
async function storeSentimentAnalysis(inquiryId, sentimentData) {
    try {
        const analysisId = uuidv4();
        const item = {
            analysis_id: analysisId,
            inquiry_id: inquiryId,
            date: new Date().toISOString().split('T')[0],
            source: 'inquiry_analysis',
            sentiment: sentimentData.sentiment,
            confidence: sentimentData.confidence,
            scores: sentimentData.scores,
            timestamp: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: SENTIMENT_TABLE,
            Item: item
        }).promise();

        return analysisId;
    } catch (error) {
        console.error('Error storing sentiment analysis:', error);
        throw error;
    }
}

// Update trending topics
async function updateTrendingTopics(keyPhrases, entities) {
    try {
        const today = new Date().toISOString().split('T')[0];
        const topics = [...keyPhrases, ...entities.map(e => e.text)];

        for (const topic of topics.slice(0, 5)) { // Limit to top 5 topics
            const topicId = `${topic.toLowerCase().replace(/\s+/g, '_')}_${today}`;
            
            try {
                // Try to get existing topic
                const existing = await dynamodb.get({
                    TableName: TRENDING_TABLE,
                    Key: { topic_id: topicId }
                }).promise();

                const mentions = existing.Item ? existing.Item.mentions + 1 : 1;
                const trendScore = mentions * 10; // Simple scoring algorithm

                await dynamodb.put({
                    TableName: TRENDING_TABLE,
                    Item: {
                        topic_id: topicId,
                        topic: topic,
                        date: today,
                        mentions: mentions,
                        trend_score: trendScore,
                        last_updated: new Date().toISOString()
                    }
                }).promise();
            } catch (error) {
                console.error(`Error updating topic ${topic}:`, error);
            }
        }
    } catch (error) {
        console.error('Error updating trending topics:', error);
    }
}

// Enhanced create inquiry with AI analysis
async function createInquiryWithAI(inquiryData) {
    try {
        // Perform AI analysis
        const [sentimentResult, keyInfo] = await Promise.all([
            analyzeSentiment(inquiryData.content),
            extractKeyInformation(inquiryData.content)
        ]);

        // Classify the inquiry
        const category = classifyInquiry(inquiryData.content, keyInfo.keyPhrases, keyInfo.entities);

        // Create enhanced inquiry object
        const inquiry = {
            inquiry_id: uuidv4(),
            subject: inquiryData.subject,
            content: inquiryData.content,
            sender: inquiryData.sender || 'Unknown',
            source: inquiryData.source || 'direct',
            category: category,
            priority: determinePriority(sentimentResult, keyInfo),
            sentiment: sentimentResult.sentiment.toLowerCase(),
            sentiment_confidence: sentimentResult.confidence,
            keywords: keyInfo.keyPhrases.slice(0, 10),
            entities: keyInfo.entities.slice(0, 5),
            status: 'pending',
            date_created: new Date().toISOString(),
            ai_processed: true
        };

        // Store the inquiry
        await dynamodb.put({
            TableName: INQUIRIES_TABLE,
            Item: inquiry
        }).promise();

        // Store sentiment analysis
        await storeSentimentAnalysis(inquiry.inquiry_id, sentimentResult);

        // Update trending topics
        await updateTrendingTopics(keyInfo.keyPhrases, keyInfo.entities);

        return inquiry;
    } catch (error) {
        console.error('Error creating inquiry with AI:', error);
        throw error;
    }
}

// Determine priority based on sentiment and content
function determinePriority(sentimentResult, keyInfo) {
    // High priority for negative sentiment or urgent keywords
    if (sentimentResult.sentiment === 'NEGATIVE' && sentimentResult.confidence > 0.7) {
        return 'high';
    }
    
    const urgentKeywords = ['crisis', 'urgent', 'immediate', 'emergency', 'critical'];
    const hasUrgentKeywords = keyInfo.keyPhrases.some(phrase => 
        urgentKeywords.some(keyword => phrase.toLowerCase().includes(keyword))
    );
    
    if (hasUrgentKeywords) return 'high';
    
    // Medium priority for mixed sentiment or important entities
    if (sentimentResult.sentiment === 'MIXED' || 
        keyInfo.entities.some(e => e.type === 'ORGANIZATION' && e.confidence > 0.8)) {
        return 'medium';
    }
    
    return 'low';
}

// Get AI-powered analytics
async function getAIAnalytics() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get recent sentiment data
        const sentimentData = await dynamodb.query({
            TableName: SENTIMENT_TABLE,
            IndexName: 'date-source-index',
            KeyConditionExpression: '#date BETWEEN :weekAgo AND :today',
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: {
                ':weekAgo': weekAgo,
                ':today': today
            }
        }).promise();

        // Get trending topics
        const trendingData = await dynamodb.query({
            TableName: TRENDING_TABLE,
            IndexName: 'trending-index',
            KeyConditionExpression: '#date = :today',
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: { ':today': today },
            ScanIndexForward: false,
            Limit: 10
        }).promise();

        return {
            sentiment_overview: calculateSentimentOverview(sentimentData.Items),
            trending_topics: trendingData.Items,
            ai_insights: generateInsights(sentimentData.Items, trendingData.Items)
        };
    } catch (error) {
        console.error('Error getting AI analytics:', error);
        return {
            sentiment_overview: { positive: 0.33, neutral: 0.34, negative: 0.33 },
            trending_topics: [],
            ai_insights: []
        };
    }
}

// Calculate sentiment overview
function calculateSentimentOverview(sentimentData) {
    if (sentimentData.length === 0) {
        return { positive: 0.33, neutral: 0.34, negative: 0.33 };
    }

    const totals = sentimentData.reduce((acc, item) => {
        acc.positive += item.scores.POSITIVE || 0;
        acc.neutral += item.scores.NEUTRAL || 0;
        acc.negative += item.scores.NEGATIVE || 0;
        return acc;
    }, { positive: 0, neutral: 0, negative: 0 });

    const count = sentimentData.length;
    return {
        positive: totals.positive / count,
        neutral: totals.neutral / count,
        negative: totals.negative / count
    };
}

// Generate AI insights
function generateInsights(sentimentData, trendingData) {
    const insights = [];

    // Sentiment trend insight
    if (sentimentData.length > 0) {
        const avgNegative = sentimentData.reduce((sum, item) => sum + (item.scores.NEGATIVE || 0), 0) / sentimentData.length;
        if (avgNegative > 0.4) {
            insights.push({
                type: 'sentiment_alert',
                level: 'medium',
                message: 'Increased negative sentiment detected in recent communications',
                recommendation: 'Consider reviewing communication strategy and addressing common concerns'
            });
        }
    }

    // Trending topics insight
    if (trendingData.length > 0) {
        const topTopic = trendingData[0];
        if (topTopic.mentions > 5) {
            insights.push({
                type: 'trending_topic',
                level: 'info',
                message: `"${topTopic.topic}" is trending with ${topTopic.mentions} mentions`,
                recommendation: 'Monitor this topic for potential communication opportunities'
            });
        }
    }

    return insights;
}

// Get template by category
async function getTemplateByCategory(category) {
    try {
        const result = await dynamodb.query({
            TableName: TEMPLATES_TABLE,
            IndexName: 'category-template-index',
            KeyConditionExpression: 'category = :category',
            ExpressionAttributeValues: {
                ':category': category
            },
            Limit: 1
        }).promise();

        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
        console.error('Error getting template by category:', error);
        return null;
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

            // POST /api/inquiries - Enhanced with AI analysis
            case httpMethod === 'POST' && path === '/api/inquiries':
                const newInquiry = await createInquiryWithAI(requestBody);
                return createResponse(201, newInquiry);

            // PUT /api/inquiries/{id}
            case httpMethod === 'PUT' && path.startsWith('/api/inquiries/') && pathParameters?.id:
                const updatedInquiry = await updateInquiry(pathParameters.id, requestBody);
                return createResponse(200, updatedInquiry);

            // GET /api/dashboard/analytics - Enhanced with AI insights
            case httpMethod === 'GET' && path === '/api/dashboard/analytics':
                const [basicAnalytics, aiAnalytics] = await Promise.all([
                    getDashboardAnalytics(),
                    getAIAnalytics()
                ]);
                return createResponse(200, { ...basicAnalytics, ...aiAnalytics });

            // POST /api/inquiries/{id}/generate-response - AI-powered response generation
            case httpMethod === 'POST' && path.match(/^\/api\/inquiries\/[^\/]+\/generate-response$/):
                const inquiryId = pathParameters.id;
                const targetInquiry = await getInquiryById(inquiryId);
                if (!targetInquiry) {
                    return createResponse(404, { error: 'Inquiry not found' });
                }
                
                // Get appropriate template
                const template = await getTemplateByCategory(targetInquiry.category);
                const generatedResponse = await generateResponse(targetInquiry, template);
                
                return createResponse(200, { 
                    generated_response: generatedResponse,
                    template_used: template?.id || null
                });

            // GET /api/sentiment/overview - Sentiment analysis overview
            case httpMethod === 'GET' && path === '/api/sentiment/overview':
                const sentimentOverview = await getAIAnalytics();
                return createResponse(200, sentimentOverview.sentiment_overview);

            // GET /api/trending/topics - Trending topics analysis
            case httpMethod === 'GET' && path === '/api/trending/topics':
                const trendingAnalysis = await getAIAnalytics();
                return createResponse(200, trendingAnalysis.trending_topics);

            // POST /api/analyze/text - Real-time text analysis
            case httpMethod === 'POST' && path === '/api/analyze/text':
                if (!requestBody.text) {
                    return createResponse(400, { error: 'Text is required' });
                }
                
                const [sentiment, keyInfo] = await Promise.all([
                    analyzeSentiment(requestBody.text),
                    extractKeyInformation(requestBody.text)
                ]);
                
                const category = classifyInquiry(requestBody.text, keyInfo.keyPhrases, keyInfo.entities);
                
                return createResponse(200, {
                    sentiment: sentiment,
                    key_phrases: keyInfo.keyPhrases,
                    entities: keyInfo.entities,
                    predicted_category: category
                });

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



