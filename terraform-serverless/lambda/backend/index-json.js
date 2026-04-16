
// Federal Reserve Communications AI - Backend Lambda Function (JSON-based)
// Uses local JSON files instead of DynamoDB for immediate functionality

const crypto = require('crypto');

// Simple UUID v4 generator
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Sample data - Federal Reserve Communications
const sampleInquiries = [
    {
        inquiry_id: "INQ-2024-001",
        source: "media",
        category: "monetary_policy",
        priority: "high",
        subject: "Federal Funds Rate Decision",
        content: "Can you provide details on the rationale behind the recent federal funds rate increase and its expected impact on inflation?",
        sender_info: {
            name: "Sarah Johnson",
            organization: "Financial Times",
            email: "s.johnson@ft.com"
        },
        status: "pending",
        date_created: "2024-04-15T10:30:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.85,
            scores: { POSITIVE: 0.2, NEUTRAL: 0.7, NEGATIVE: 0.1 }
        },
        keywords: ["federal funds rate", "inflation", "monetary policy", "economic impact"],
        entities: [
            { text: "Federal Reserve", type: "ORGANIZATION", confidence: 0.95 },
            { text: "inflation", type: "OTHER", confidence: 0.88 }
        ]
    },
    {
        inquiry_id: "INQ-2024-002",
        source: "congress",
        category: "banking_supervision",
        priority: "medium",
        subject: "Bank Stress Test Results",
        content: "What are the key findings from the latest bank stress tests and how do they inform regulatory policy?",
        sender_info: {
            name: "Rep. Michael Chen",
            organization: "House Financial Services Committee",
            email: "m.chen@house.gov"
        },
        status: "in_progress",
        date_created: "2024-04-15T14:20:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.78,
            scores: { POSITIVE: 0.3, NEUTRAL: 0.6, NEGATIVE: 0.1 }
        },
        keywords: ["stress tests", "banking regulation", "financial stability"],
        entities: [
            { text: "House Financial Services Committee", type: "ORGANIZATION", confidence: 0.92 }
        ]
    },
    {
        inquiry_id: "INQ-2024-003",
        source: "public",
        category: "consumer_protection",
        priority: "low",
        subject: "Credit Card Interest Rates",
        content: "Why are credit card interest rates so high despite Fed rate changes?",
        sender_info: {
            name: "John Smith",
            organization: "Individual",
            email: "j.smith@email.com"
        },
        status: "pending",
        date_created: "2024-04-15T16:45:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEGATIVE",
            confidence: 0.72,
            scores: { POSITIVE: 0.1, NEUTRAL: 0.3, NEGATIVE: 0.6 }
        },
        keywords: ["credit cards", "interest rates", "consumer protection"],
        entities: [
            { text: "Fed", type: "ORGANIZATION", confidence: 0.85 }
        ]
    }
];

const responseTemplates = [
    {
        template_id: "TMPL-001",
        category: "monetary_policy",
        title: "Federal Funds Rate Response",
        content: "The Federal Reserve's decision on the federal funds rate is based on careful analysis of economic conditions, including employment levels, inflation trends, and overall economic growth. Our dual mandate focuses on maximum employment and price stability...",
        variables: ["rate_change", "economic_indicators", "timeline"],
        last_updated: "2024-04-01T00:00:00Z"
    },
    {
        template_id: "TMPL-002", 
        category: "banking_supervision",
        title: "Banking Regulation Response",
        content: "The Federal Reserve's supervisory activities are designed to ensure the safety and soundness of banking institutions while supporting a healthy economy. Our regulatory framework includes...",
        variables: ["regulation_type", "implementation_date", "affected_institutions"],
        last_updated: "2024-04-01T00:00:00Z"
    }
];

// Mock dashboard analytics
function getMockDashboardData() {
    return {
        total_inquiries: 156,
        pending_responses: 23,
        avg_response_time: "2.3 hours",
        sentiment_score: 0.72,
        federalReserveRates: {
            federalFundsRate: "5.25-5.50%",
            discountRate: "5.50%",
            tenYearTreasury: "4.28%"
        },
        economicIndicators: {
            unemploymentRate: "3.7%",
            corePCEInflation: "3.2%",
            gdpGrowth: "4.9%"
        },
        communicationSentiment: {
            positive: 65,
            neutral: 25,
            negative: 10
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
            { level: "high", message: "High-profile media inquiry on rate policy" },
            { level: "medium", message: "Congressional request for inflation data" },
            { level: "low", message: "Routine public information requests" }
        ],
        marketImpact: {
            sp500: "+0.8%",
            usdIndex: "103.2",
            vix: "16.4"
        },
        ai_insights: [
            {
                type: "sentiment_trend",
                level: "info",
                message: "Communication sentiment has improved by 12% over the past week",
                recommendation: "Continue current messaging strategy for monetary policy communications"
            },
            {
                type: "topic_analysis",
                level: "warning",
                message: "Increased inquiries about inflation expectations detected", 
                recommendation: "Prepare additional resources on Fed's inflation targeting framework"
            },
            {
                type: "response_time",
                level: "success",
                message: "Average response time has decreased to 2.3 hours",
                recommendation: "Maintain current staffing levels during peak inquiry periods"
            }
        ]
    };
}

// Mock AI analysis functions
function mockAnalyzeSentiment(text) {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['good', 'excellent', 'positive', 'beneficial', 'helpful', 'support'];
    const negativeWords = ['bad', 'terrible', 'negative', 'harmful', 'concerning', 'crisis'];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    let sentiment = 'NEUTRAL';
    let confidence = 0.5;
    
    if (positiveCount > negativeCount) {
        sentiment = 'POSITIVE';
        confidence = Math.min(0.9, 0.6 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
        sentiment = 'NEGATIVE';
        confidence = Math.min(0.9, 0.6 + (negativeCount * 0.1));
    }
    
    return {
        sentiment,
        confidence,
        scores: {
            POSITIVE: sentiment === 'POSITIVE' ? confidence : (1 - confidence) / 2,
            NEUTRAL: sentiment === 'NEUTRAL' ? confidence : (1 - confidence) / 2,
            NEGATIVE: sentiment === 'NEGATIVE' ? confidence : (1 - confidence) / 2
        }
    };
}

function mockExtractKeyPhrases(text) {
    // Simple keyword extraction
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an'];
    
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
    
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([word]) => word);
}

function mockExtractEntities(text) {
    const entities = [];
    
    // Federal Reserve related entities
    const fedTerms = ['federal reserve', 'fed', 'fomc', 'federal open market committee'];
    fedTerms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
            entities.push({
                text: term.charAt(0).toUpperCase() + term.slice(1),
                type: 'ORGANIZATION',
                confidence: 0.9
            });
        }
    });
    
    // Economic terms
    const economicTerms = ['inflation', 'employment', 'gdp', 'interest rate', 'monetary policy'];
    economicTerms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
            entities.push({
                text: term,
                type: 'OTHER',
                confidence: 0.8
            });
        }
    });
    
    return entities.slice(0, 5);
}

function mockClassifyInquiry(text) {
    const categories = {
        'monetary_policy': ['rate', 'inflation', 'policy', 'fomc', 'federal funds'],
        'banking_supervision': ['bank', 'regulation', 'supervision', 'stress test', 'capital'],
        'consumer_protection': ['consumer', 'credit', 'mortgage', 'protection', 'complaint'],
        'financial_stability': ['stability', 'systemic', 'risk', 'crisis', 'market'],
        'payment_systems': ['payment', 'settlement', 'clearing', 'digital', 'currency']
    };
    
    const textLower = text.toLowerCase();
    let bestCategory = 'general';
    let maxScore = 0;
    
    Object.entries(categories).forEach(([category, keywords]) => {
        const score = keywords.reduce((acc, keyword) => {
            return acc + (textLower.includes(keyword) ? 1 : 0);
        }, 0);
        
        if (score > maxScore) {
            maxScore = score;
            bestCategory = category;
        }
    });
    
    return bestCategory;
}

function mockGenerateResponse(inquiry, template) {
    const baseResponse = template ? template.content : 
        "Thank you for your inquiry regarding Federal Reserve policy. The Federal Reserve carefully considers all aspects of economic conditions in making policy decisions. Our commitment to transparency ensures that the public has access to information about our decision-making process.";
    
    return `${baseResponse}\n\nThis response addresses your specific question about: ${inquiry.subject}\n\nFor additional information, please visit our website at federalreserve.gov or contact our public affairs office.\n\nSincerely,\nFederal Reserve Communications Team`;
}

// Helper function to create API response
function createResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            ...headers
        },
        body: JSON.stringify(body)
    };
}

// Main Lambda handler
exports.handler = async (event, context) => {
    console.log('Backend Lambda invoked:', JSON.stringify(event, null, 2));
    
    const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
    
    try {
        switch (true) {
            // GET /api/inquiries - Get all inquiries
            case httpMethod === 'GET' && path === '/api/inquiries':
                return createResponse(200, sampleInquiries);

            // POST /api/inquiries - Create new inquiry
            case httpMethod === 'POST' && path === '/api/inquiries':
                const inquiryData = JSON.parse(body || '{}');
                
                // Analyze with mock AI
                const sentiment = mockAnalyzeSentiment(inquiryData.content || '');
                const keyPhrases = mockExtractKeyPhrases(inquiryData.content || '');
                const entities = mockExtractEntities(inquiryData.content || '');
                const category = mockClassifyInquiry(inquiryData.content || '');
                
                const newInquiry = {
                    inquiry_id: `INQ-${Date.now()}`,
                    ...inquiryData,
                    category,
                    priority: sentiment.sentiment === 'NEGATIVE' ? 'high' : 'medium',
                    status: 'pending',
                    date_created: new Date().toISOString(),
                    ai_processed: true,
                    sentiment,
                    keywords: keyPhrases,
                    entities
                };
                
                sampleInquiries.unshift(newInquiry);
                return createResponse(201, newInquiry);

            // GET /api/inquiries/{id} - Get specific inquiry
            case httpMethod === 'GET' && path.match(/^\/api\/inquiries\/[^\/]+$/):
                const inquiryId = pathParameters?.id;
                const inquiry = sampleInquiries.find(i => i.inquiry_id === inquiryId);
                
                if (!inquiry) {
                    return createResponse(404, { error: 'Inquiry not found' });
                }
                
                return createResponse(200, inquiry);

            // PUT /api/inquiries/{id} - Update inquiry
            case httpMethod === 'PUT' && path.match(/^\/api\/inquiries\/[^\/]+$/):
                const updateId = pathParameters?.id;
                const updateData = JSON.parse(body || '{}');
                const inquiryIndex = sampleInquiries.findIndex(i => i.inquiry_id === updateId);
                
                if (inquiryIndex === -1) {
                    return createResponse(404, { error: 'Inquiry not found' });
                }
                
                sampleInquiries[inquiryIndex] = { ...sampleInquiries[inquiryIndex], ...updateData };
                return createResponse(200, sampleInquiries[inquiryIndex]);

            // GET /api/dashboard/analytics - Dashboard analytics
            case httpMethod === 'GET' && path === '/api/dashboard/analytics':
                return createResponse(200, getMockDashboardData());

            // POST /api/analyze/text - Analyze text
            case httpMethod === 'POST' && path === '/api/analyze/text':
                const textData = JSON.parse(body || '{}');
                const text = textData.text || '';
                
                const analysisResult = {
                    sentiment: mockAnalyzeSentiment(text),
                    key_phrases: mockExtractKeyPhrases(text),
                    entities: mockExtractEntities(text),
                    predicted_category: mockClassifyInquiry(text)
                };
                
                return createResponse(200, analysisResult);

            // POST /api/inquiries/{id}/generate-response - Generate AI response
            case httpMethod === 'POST' && path.match(/^\/api\/inquiries\/[^\/]+\/generate-response$/):
                const responseInquiryId = pathParameters?.id;
                const targetInquiry = sampleInquiries.find(i => i.inquiry_id === responseInquiryId);
                
                if (!targetInquiry) {
                    return createResponse(404, { error: 'Inquiry not found' });
                }
                
                const template = responseTemplates.find(t => t.category === targetInquiry.category);
                const generatedResponse = mockGenerateResponse(targetInquiry, template);
                
                return createResponse(200, { 
                    generated_response: generatedResponse,
                    template_used: template?.template_id || null
                });

            // GET /api/sentiment/overview - Sentiment overview
            case httpMethod === 'GET' && path === '/api/sentiment/overview':
                return createResponse(200, {
                    positive: 0.33,
                    neutral: 0.34,
                    negative: 0.33
                });

            // GET /api/trending/topics - Trending topics
            case httpMethod === 'GET' && path === '/api/trending/topics':
                return createResponse(200, [
                    { topic: "Interest Rates", mentions: 45, trend_score: 8.5 },
                    { topic: "Inflation", mentions: 38, trend_score: 7.2 },
                    { topic: "Employment", mentions: 29, trend_score: 6.8 },
                    { topic: "Banking Policy", mentions: 22, trend_score: 5.9 },
                    { topic: "Economic Outlook", mentions: 18, trend_score: 5.1 }
                ]);

            default:
                return createResponse(404, { error: 'Endpoint not found' });
        }
    } catch (error) {
        console.error('Lambda execution error:', error);
        return createResponse(500, { 
            error: 'Internal server error', 
            message: error.message 
        });
    }
};

