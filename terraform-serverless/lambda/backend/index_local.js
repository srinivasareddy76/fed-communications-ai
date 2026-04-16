
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

// Comprehensive Sample Data - Federal Reserve Communications
const sampleInquiries = [
    {
        inquiry_id: "INQ-2024-001",
        source: "media",
        category: "monetary_policy",
        priority: "high",
        subject: "Federal Funds Rate Decision Impact on Housing Market",
        content: "Can you provide details on the rationale behind the recent federal funds rate increase and its expected impact on inflation and the housing market? How does this align with the Fed's dual mandate?",
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
        keywords: ["federal funds rate", "inflation", "monetary policy", "housing market", "dual mandate"],
        entities: [
            { text: "Federal Reserve", type: "ORGANIZATION", confidence: 0.95 },
            { text: "inflation", type: "OTHER", confidence: 0.88 },
            { text: "housing market", type: "OTHER", confidence: 0.82 }
        ]
    },
    {
        inquiry_id: "INQ-2024-002",
        source: "congress",
        category: "banking_supervision",
        priority: "high",
        subject: "Bank Stress Test Results and Capital Requirements",
        content: "What are the key findings from the latest bank stress tests and how do they inform regulatory policy? Are there plans to adjust capital requirements for large banks?",
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
        keywords: ["stress tests", "banking regulation", "financial stability", "capital requirements"],
        entities: [
            { text: "House Financial Services Committee", type: "ORGANIZATION", confidence: 0.92 },
            { text: "large banks", type: "OTHER", confidence: 0.85 }
        ]
    },
    {
        inquiry_id: "INQ-2024-003",
        source: "public",
        category: "consumer_protection",
        priority: "medium",
        subject: "Credit Card Interest Rates and Consumer Impact",
        content: "Why are credit card interest rates so high despite Fed rate changes? What is the Fed doing to protect consumers from predatory lending practices?",
        sender_info: {
            name: "John Smith",
            organization: "Consumer Advocacy Group",
            email: "j.smith@consumeradvocacy.org"
        },
        status: "pending",
        date_created: "2024-04-15T16:45:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEGATIVE",
            confidence: 0.72,
            scores: { POSITIVE: 0.1, NEUTRAL: 0.3, NEGATIVE: 0.6 }
        },
        keywords: ["credit cards", "interest rates", "consumer protection", "predatory lending"],
        entities: [
            { text: "Fed", type: "ORGANIZATION", confidence: 0.85 },
            { text: "consumers", type: "OTHER", confidence: 0.78 }
        ]
    },
    {
        inquiry_id: "INQ-2024-004",
        source: "media",
        category: "financial_stability",
        priority: "high",
        subject: "Regional Bank Concerns and Systemic Risk",
        content: "Following recent regional bank failures, what measures is the Fed taking to ensure financial stability? How are you monitoring systemic risks in the banking sector?",
        sender_info: {
            name: "Maria Rodriguez",
            organization: "Wall Street Journal",
            email: "m.rodriguez@wsj.com"
        },
        status: "completed",
        date_created: "2024-04-14T09:15:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEGATIVE",
            confidence: 0.88,
            scores: { POSITIVE: 0.05, NEUTRAL: 0.25, NEGATIVE: 0.7 }
        },
        keywords: ["regional banks", "bank failures", "financial stability", "systemic risk"],
        entities: [
            { text: "Wall Street Journal", type: "ORGANIZATION", confidence: 0.98 },
            { text: "banking sector", type: "OTHER", confidence: 0.92 }
        ]
    },
    {
        inquiry_id: "INQ-2024-005",
        source: "academic",
        category: "monetary_policy",
        priority: "low",
        subject: "Quantitative Tightening Timeline and Economic Impact",
        content: "Can you provide insights on the Fed's quantitative tightening strategy and its expected timeline? What are the projected impacts on long-term interest rates and economic growth?",
        sender_info: {
            name: "Dr. Emily Watson",
            organization: "Harvard Economics Department",
            email: "e.watson@harvard.edu"
        },
        status: "pending",
        date_created: "2024-04-15T11:30:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.82,
            scores: { POSITIVE: 0.25, NEUTRAL: 0.65, NEGATIVE: 0.1 }
        },
        keywords: ["quantitative tightening", "timeline", "long-term rates", "economic growth"],
        entities: [
            { text: "Harvard Economics Department", type: "ORGANIZATION", confidence: 0.95 },
            { text: "economic growth", type: "OTHER", confidence: 0.88 }
        ]
    },
    {
        inquiry_id: "INQ-2024-006",
        source: "international",
        category: "monetary_policy",
        priority: "medium",
        subject: "Dollar Strength and Global Economic Coordination",
        content: "How is the Fed coordinating with other central banks regarding dollar strength and its impact on emerging markets? Are there plans for coordinated policy actions?",
        sender_info: {
            name: "Klaus Mueller",
            organization: "European Central Bank",
            email: "k.mueller@ecb.europa.eu"
        },
        status: "in_progress",
        date_created: "2024-04-15T08:00:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.75,
            scores: { POSITIVE: 0.3, NEUTRAL: 0.6, NEGATIVE: 0.1 }
        },
        keywords: ["dollar strength", "central banks", "emerging markets", "coordination"],
        entities: [
            { text: "European Central Bank", type: "ORGANIZATION", confidence: 0.98 },
            { text: "emerging markets", type: "OTHER", confidence: 0.85 }
        ]
    },
    {
        inquiry_id: "INQ-2024-007",
        source: "congress",
        category: "payment_systems",
        priority: "high",
        subject: "Central Bank Digital Currency (CBDC) Development",
        content: "What is the current status of the Fed's research into a central bank digital currency? What are the key considerations for privacy and financial inclusion?",
        sender_info: {
            name: "Sen. Patricia Williams",
            organization: "Senate Banking Committee",
            email: "p.williams@senate.gov"
        },
        status: "pending",
        date_created: "2024-04-15T13:45:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "POSITIVE",
            confidence: 0.79,
            scores: { POSITIVE: 0.6, NEUTRAL: 0.3, NEGATIVE: 0.1 }
        },
        keywords: ["CBDC", "digital currency", "privacy", "financial inclusion"],
        entities: [
            { text: "Senate Banking Committee", type: "ORGANIZATION", confidence: 0.96 },
            { text: "central bank digital currency", type: "OTHER", confidence: 0.92 }
        ]
    },
    {
        inquiry_id: "INQ-2024-008",
        source: "media",
        category: "employment",
        priority: "medium",
        subject: "Labor Market Conditions and Wage Growth",
        content: "How does the Fed assess current labor market conditions? What role does wage growth play in your inflation projections and policy decisions?",
        sender_info: {
            name: "David Kim",
            organization: "Reuters",
            email: "d.kim@reuters.com"
        },
        status: "completed",
        date_created: "2024-04-14T15:20:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.83,
            scores: { POSITIVE: 0.35, NEUTRAL: 0.55, NEGATIVE: 0.1 }
        },
        keywords: ["labor market", "wage growth", "inflation projections", "employment"],
        entities: [
            { text: "Reuters", type: "ORGANIZATION", confidence: 0.97 },
            { text: "labor market", type: "OTHER", confidence: 0.89 }
        ]
    },
    {
        inquiry_id: "INQ-2024-009",
        source: "public",
        category: "consumer_protection",
        priority: "low",
        subject: "Mortgage Rate Impact on First-Time Homebuyers",
        content: "How do rising mortgage rates affect first-time homebuyers? What guidance does the Fed have for consumers considering home purchases?",
        sender_info: {
            name: "Lisa Chen",
            organization: "National Association of Realtors",
            email: "l.chen@nar.realtor"
        },
        status: "pending",
        date_created: "2024-04-15T17:10:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEGATIVE",
            confidence: 0.68,
            scores: { POSITIVE: 0.15, NEUTRAL: 0.35, NEGATIVE: 0.5 }
        },
        keywords: ["mortgage rates", "first-time homebuyers", "home purchases", "consumer guidance"],
        entities: [
            { text: "National Association of Realtors", type: "ORGANIZATION", confidence: 0.94 },
            { text: "first-time homebuyers", type: "OTHER", confidence: 0.87 }
        ]
    },
    {
        inquiry_id: "INQ-2024-010",
        source: "financial_institution",
        category: "banking_supervision",
        priority: "medium",
        subject: "Climate Risk Assessment Guidelines",
        content: "Can you provide updated guidance on climate risk assessment requirements for banks? How should institutions incorporate climate scenarios into their risk management frameworks?",
        sender_info: {
            name: "Robert Taylor",
            organization: "American Bankers Association",
            email: "r.taylor@aba.com"
        },
        status: "in_progress",
        date_created: "2024-04-15T12:00:00Z",
        ai_processed: true,
        sentiment: {
            sentiment: "NEUTRAL",
            confidence: 0.76,
            scores: { POSITIVE: 0.4, NEUTRAL: 0.5, NEGATIVE: 0.1 }
        },
        keywords: ["climate risk", "risk assessment", "banks", "risk management"],
        entities: [
            { text: "American Bankers Association", type: "ORGANIZATION", confidence: 0.96 },
            { text: "climate scenarios", type: "OTHER", confidence: 0.84 }
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

// Comprehensive mock dashboard data with realistic Federal Reserve scenarios
function getMockDashboardData() {
    return {
        // Core Metrics
        total_inquiries: 247,
        pending_responses: 34,
        avg_response_time: "2.1 hours",
        sentiment_score: 0.68,
        
        // Federal Reserve Rates
        federalReserveRates: {
            federalFundsRate: "5.25-5.50%",
            discountRate: "5.50%",
            tenYearTreasury: "4.28%",
            primeRate: "8.50%"
        },
        
        // Economic Indicators
        economicIndicators: {
            unemploymentRate: "3.7%",
            corePCEInflation: "3.2%",
            gdpGrowth: "4.9%",
            consumerConfidence: "102.3",
            housingStarts: "1.42M",
            industrialProduction: "+0.4%"
        },
        
        // Communication Sentiment Analysis
        communicationSentiment: {
            positive: 42,
            neutral: 38,
            negative: 20,
            trend: "+5.2%"
        },
        
        // Trending Topics with Enhanced Data
        trendingTopics: [
            { topic: "Interest Rate Policy", mentions: 89, trend: "+12%", sentiment: "mixed" },
            { topic: "Inflation Control", mentions: 67, trend: "+8%", sentiment: "negative" },
            { topic: "Regional Banking", mentions: 45, trend: "+22%", sentiment: "negative" },
            { topic: "Employment Data", mentions: 38, trend: "+3%", sentiment: "positive" },
            { topic: "FOMC Decisions", mentions: 34, trend: "-2%", sentiment: "neutral" },
            { topic: "Digital Currency", mentions: 23, trend: "+18%", sentiment: "positive" },
            { topic: "Housing Market", mentions: 29, trend: "+6%", sentiment: "negative" },
            { topic: "Climate Risk", mentions: 18, trend: "+7%", sentiment: "neutral" }
        ],
        
        // Priority Alerts
        priorityAlerts: [
            { 
                level: "high", 
                message: "Surge in negative sentiment regarding regional bank stability",
                timestamp: "2024-04-15T17:45:00Z",
                source: "media"
            },
            { 
                level: "medium", 
                message: "Congressional inquiry on CBDC timeline requires response within 48 hours",
                timestamp: "2024-04-15T15:30:00Z",
                source: "congress"
            },
            { 
                level: "medium", 
                message: "International coordination request from ECB on dollar policy",
                timestamp: "2024-04-15T13:20:00Z",
                source: "international"
            },
            { 
                level: "low", 
                message: "Academic research requests increasing for forward guidance data",
                timestamp: "2024-04-15T11:10:00Z",
                source: "academic"
            }
        ],
        
        // Market Impact
        marketImpact: {
            sp500: "+0.8%",
            nasdaq: "+1.2%",
            dowJones: "+0.6%",
            usdIndex: "103.2",
            vix: "16.4",
            tenYearYield: "4.28%",
            twoYearYield: "4.85%"
        },
        
        // Enhanced AI Insights
        ai_insights: [
            {
                type: "sentiment_trend",
                level: "info",
                message: "Communication sentiment has improved by 5.2% over the past week",
                recommendation: "Continue current messaging strategy for monetary policy communications",
                confidence: 0.87,
                timestamp: "2024-04-15T18:00:00Z"
            },
            {
                type: "topic_analysis",
                level: "warning",
                message: "22% increase in regional banking concerns detected in the last 24 hours",
                recommendation: "Prepare proactive communication on banking sector stability measures",
                confidence: 0.92,
                timestamp: "2024-04-15T17:30:00Z"
            },
            {
                type: "response_optimization",
                level: "success",
                message: "Average response time decreased to 2.1 hours, meeting target SLA",
                recommendation: "Maintain current staffing levels during peak inquiry periods",
                confidence: 0.95,
                timestamp: "2024-04-15T16:45:00Z"
            },
            {
                type: "predictive_analysis",
                level: "info",
                message: "CBDC-related inquiries predicted to increase 35% following Senate hearing",
                recommendation: "Pre-draft response templates for common CBDC questions",
                confidence: 0.78,
                timestamp: "2024-04-15T15:20:00Z"
            },
            {
                type: "communication_effectiveness",
                level: "warning",
                message: "Mixed messaging perception detected in inflation communication",
                recommendation: "Review and align inflation-related response templates",
                confidence: 0.83,
                timestamp: "2024-04-15T14:10:00Z"
            }
        ],
        
        // Response Metrics
        responseMetrics: {
            completionRate: "94.2%",
            satisfactionScore: "4.3/5.0",
            escalationRate: "8.1%",
            avgResponseTimeByCategory: {
                monetary_policy: "1.8 hours",
                banking_supervision: "2.4 hours",
                consumer_protection: "3.1 hours",
                financial_stability: "1.2 hours",
                payment_systems: "2.7 hours"
            }
        },
        
        // Geographic Distribution
        geographicDistribution: {
            northeast: 28,
            southeast: 22,
            midwest: 19,
            southwest: 16,
            west: 15,
            international: 12
        },
        
        // Source Breakdown
        sourceBreakdown: {
            media: 89,
            public: 67,
            congress: 34,
            academic: 28,
            financial_institutions: 21,
            international: 8
        },
        
        // Sentiment by Category
        sentimentByCategory: {
            monetary_policy: { positive: 35, neutral: 45, negative: 20 },
            banking_supervision: { positive: 25, neutral: 40, negative: 35 },
            consumer_protection: { positive: 50, neutral: 30, negative: 20 },
            financial_stability: { positive: 20, neutral: 35, negative: 45 },
            payment_systems: { positive: 60, neutral: 30, negative: 10 }
        },
        
        // Key Phrases
        keyPhrases: [
            { phrase: "federal funds rate", frequency: 156, sentiment: "neutral", trend: "+8%" },
            { phrase: "inflation expectations", frequency: 134, sentiment: "negative", trend: "+12%" },
            { phrase: "banking stability", frequency: 98, sentiment: "negative", trend: "+25%" },
            { phrase: "employment data", frequency: 87, sentiment: "positive", trend: "+3%" },
            { phrase: "monetary policy", frequency: 76, sentiment: "neutral", trend: "+5%" },
            { phrase: "economic outlook", frequency: 65, sentiment: "mixed", trend: "+7%" }
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
                const dashboardData = getMockDashboardData();
                return createResponse(200, dashboardData.trendingTopics);

            // GET /api/analytics/sentiment - Sentiment analytics
            case httpMethod === 'GET' && path === '/api/analytics/sentiment':
                const sentimentData = getMockDashboardData();
                return createResponse(200, {
                    overall: sentimentData.communicationSentiment,
                    by_category: sentimentData.sentimentByCategory,
                    by_source: sentimentData.sourceBreakdown,
                    key_phrases: sentimentData.keyPhrases
                });

            // GET /api/analytics/geographic - Geographic distribution
            case httpMethod === 'GET' && path === '/api/analytics/geographic':
                const geoData = getMockDashboardData();
                return createResponse(200, geoData.geographicDistribution);

            // GET /api/analytics/response-metrics - Response performance metrics
            case httpMethod === 'GET' && path === '/api/analytics/response-metrics':
                const responseData = getMockDashboardData();
                return createResponse(200, responseData.responseMetrics);

            // GET /api/market/indicators - Market and economic indicators
            case httpMethod === 'GET' && path === '/api/market/indicators':
                const marketData = getMockDashboardData();
                return createResponse(200, {
                    federal_reserve_rates: marketData.federalReserveRates,
                    economic_indicators: marketData.economicIndicators,
                    market_impact: marketData.marketImpact
                });

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

