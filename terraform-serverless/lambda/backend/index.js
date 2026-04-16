
// Federal Reserve Communications AI - Backend Lambda Function (S3-based)
// Loads synthetic data from S3 bucket for production deployment

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
});

// Cache for S3 data to avoid repeated fetches
let dataCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Load data from S3 with caching
async function loadDataFromS3(key) {
    const cacheKey = key;
    const now = Date.now();
    
    // Check if data is cached and not expired
    if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp) < CACHE_TTL) {
        console.log(`Using cached data for ${key}`);
        return dataCache[cacheKey].data;
    }
    
    try {
        const bucketName = process.env.S3_SYNTHETIC_DATA_BUCKET;
        if (!bucketName) {
            console.error('S3_SYNTHETIC_DATA_BUCKET environment variable not set');
            throw new Error('S3 bucket not configured');
        }
        
        console.log(`Loading ${key} from S3 bucket: ${bucketName}`);
        
        const params = {
            Bucket: bucketName,
            Key: key
        };
        
        const result = await s3.getObject(params).promise();
        const data = JSON.parse(result.Body.toString());
        
        // Cache the data
        dataCache[cacheKey] = {
            data: data,
            timestamp: now
        };
        
        console.log(`Successfully loaded and cached ${key}`);
        return data;
    } catch (error) {
        console.error(`Error loading ${key} from S3:`, error);
        throw error;
    }
}

// Comprehensive fallback data in case S3 is not available
const getFallbackData = (dataType) => {
    const fallbackData = {
        inquiries: [
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
                urgency_score: 8.5,
                sentiment: "neutral",
                keywords: ["federal funds rate", "housing market", "inflation", "dual mandate"]
            },
            {
                inquiry_id: "INQ-2024-002",
                source: "congress",
                category: "financial_stability",
                priority: "high",
                subject: "Regional Banking Sector Stress Test Results",
                content: "Following the recent stress test results, what measures is the Federal Reserve taking to ensure regional bank stability and prevent systemic risks?",
                sender_info: {
                    name: "Rep. Michael Chen",
                    organization: "House Financial Services Committee",
                    email: "m.chen@house.gov"
                },
                status: "in_progress",
                date_created: "2024-04-15T09:15:00Z",
                urgency_score: 9.2,
                sentiment: "concerned",
                keywords: ["stress test", "regional banking", "systemic risk", "financial stability"]
            }
        ],
        dashboard_analytics: {
            totalInquiries: 247,
            pendingInquiries: 23,
            completedInquiries: 224,
            averageResponseTime: "2.1 hours",
            sentimentDistribution: { 
                positive: 42, 
                neutral: 38, 
                negative: 20 
            },
            categoryBreakdown: {
                "monetary_policy": 89,
                "financial_stability": 67,
                "employment": 45,
                "inflation": 38,
                "cbdc": 8
            },
            priorityDistribution: {
                "high": 34,
                "medium": 156,
                "low": 57
            },
            sourceBreakdown: {
                "media": 98,
                "congress": 67,
                "academic": 45,
                "public": 23,
                "international": 14
            },
            weeklyTrends: {
                inquiries: [45, 52, 38, 61, 47, 39, 42],
                responseTime: [2.3, 2.1, 2.4, 1.9, 2.2, 2.0, 2.1]
            },
            keyMetrics: {
                federalFundsRate: "5.25-5.50%",
                discountRate: "5.50%",
                treasuryYield: "4.28%",
                unemploymentRate: "3.7%",
                inflationRate: "3.2%",
                gdpGrowth: "4.9%"
            },
            marketImpact: {
                sp500: "+0.8%",
                usdIndex: "103.2",
                vix: "16.4"
            },
            priorityAlerts: [
                {
                    level: "high",
                    message: "Surge in negative sentiment regarding regional bank stability",
                    count: 12
                },
                {
                    level: "medium", 
                    message: "Congressional inquiry on CBDC timeline requires response within 48 hours",
                    count: 3
                },
                {
                    level: "medium",
                    message: "International coordination request from ECB on dollar policy",
                    count: 2
                },
                {
                    level: "low",
                    message: "Academic research requests increasing for forward guidance data",
                    count: 8
                }
            ]
        },
        trending_topics: [
            { topic: "Interest Rate Policy", mentions: 89, trend: "↑", sentiment: "mixed", change: "+12%" },
            { topic: "Inflation Control", mentions: 67, trend: "↑", sentiment: "concerned", change: "+8%" },
            { topic: "Regional Banking", mentions: 45, trend: "↑", sentiment: "negative", change: "+22%" },
            { topic: "Employment Data", mentions: 38, trend: "→", sentiment: "positive", change: "+2%" },
            { topic: "FOMC Decisions", mentions: 34, trend: "↑", sentiment: "neutral", change: "+15%" },
            { topic: "CBDC Development", mentions: 23, trend: "↑", sentiment: "curious", change: "+35%" },
            { topic: "Climate Risk", mentions: 18, trend: "→", sentiment: "neutral", change: "-1%" },
            { topic: "Digital Assets", mentions: 15, trend: "↓", sentiment: "cautious", change: "-5%" }
        ],
        ai_analytics: {
            insights: [
                {
                    type: "SENTIMENT_TREND",
                    title: "Communication sentiment has improved by 5.2% over the past week",
                    description: "Positive sentiment increased from 37% to 42%, indicating more effective messaging around monetary policy decisions.",
                    recommendation: "Continue current messaging strategy for monetary policy communications",
                    confidence: 0.87,
                    impact: "medium"
                },
                {
                    type: "TOPIC_ANALYSIS", 
                    title: "22% increase in regional banking concerns detected in the last 24 hours",
                    description: "Spike in inquiries related to regional bank stability following stress test results publication.",
                    recommendation: "Prepare proactive communication on banking sector stability measures",
                    confidence: 0.92,
                    impact: "high"
                },
                {
                    type: "RESPONSE_OPTIMIZATION",
                    title: "Average response time decreased to 2.1 hours, meeting target SLA",
                    description: "Improved efficiency in handling high-priority inquiries, particularly from congressional sources.",
                    recommendation: "Maintain current staffing levels during peak inquiry periods",
                    confidence: 0.95,
                    impact: "low"
                },
                {
                    type: "PREDICTIVE_ANALYSIS",
                    title: "CBDC-related inquiries predicted to increase 35% following Senate hearing",
                    description: "Machine learning models indicate significant uptick in digital currency questions expected next week.",
                    recommendation: "Pre-draft response templates for common CBDC questions",
                    confidence: 0.78,
                    impact: "medium"
                },
                {
                    type: "COMMUNICATION_EFFECTIVENESS",
                    title: "Mixed messaging perception detected in inflation communication",
                    description: "Analysis shows inconsistent language patterns in inflation-related responses across different channels.",
                    recommendation: "Review and align inflation-related response templates",
                    confidence: 0.83,
                    impact: "high"
                }
            ],
            predictiveMetrics: {
                nextWeekInquiries: 58,
                expectedCategories: ["monetary_policy", "cbdc", "regional_banking"],
                riskFactors: ["market_volatility", "congressional_hearing", "international_events"]
            }
        },
        sentiment_analysis: {
            overall: {
                positive: 0.33,
                neutral: 0.34, 
                negative: 0.33
            },
            byCategory: {
                "monetary_policy": { positive: 0.45, neutral: 0.35, negative: 0.20 },
                "financial_stability": { positive: 0.25, neutral: 0.40, negative: 0.35 },
                "employment": { positive: 0.60, neutral: 0.30, negative: 0.10 },
                "inflation": { positive: 0.20, neutral: 0.35, negative: 0.45 }
            },
            trends: {
                daily: [
                    { date: "2024-04-09", positive: 0.35, neutral: 0.32, negative: 0.33 },
                    { date: "2024-04-10", positive: 0.38, neutral: 0.34, negative: 0.28 },
                    { date: "2024-04-11", positive: 0.32, neutral: 0.36, negative: 0.32 },
                    { date: "2024-04-12", positive: 0.40, neutral: 0.33, negative: 0.27 },
                    { date: "2024-04-13", positive: 0.36, neutral: 0.35, negative: 0.29 },
                    { date: "2024-04-14", positive: 0.42, neutral: 0.32, negative: 0.26 },
                    { date: "2024-04-15", positive: 0.33, neutral: 0.34, negative: 0.33 }
                ]
            }
        }
    };
    
    return fallbackData[dataType] || {};
};

// AI Text Analysis (local processing)
function analyzeText(text) {
    const words = text.toLowerCase().split(/\s+/);
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'strong', 'growth', 'stable'];
    const negativeWords = ['bad', 'poor', 'negative', 'weak', 'decline', 'crisis', 'concern'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });
    
    let sentiment = 'NEUTRAL';
    let confidence = 50;
    
    if (positiveCount > negativeCount) {
        sentiment = 'POSITIVE';
        confidence = Math.min(90, 50 + (positiveCount - negativeCount) * 10);
    } else if (negativeCount > positiveCount) {
        sentiment = 'NEGATIVE';
        confidence = Math.min(90, 50 + (negativeCount - positiveCount) * 10);
    }
    
    // Extract key phrases (simple word frequency)
    const keyPhrases = words
        .filter(word => word.length > 3)
        .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were'].includes(word))
        .slice(0, 8);
    
    // Extract entities (simple pattern matching)
    const entities = [];
    if (text.toLowerCase().includes('federal reserve') || text.toLowerCase().includes('fed')) {
        entities.push({ text: 'Federal reserve', type: 'ORGANIZATION' });
    }
    if (text.toLowerCase().includes('inflation')) {
        entities.push({ text: 'inflation', type: 'OTHER' });
    }
    if (text.toLowerCase().includes('employment')) {
        entities.push({ text: 'employment', type: 'OTHER' });
    }
    if (text.toLowerCase().includes('interest rate')) {
        entities.push({ text: 'interest rate', type: 'OTHER' });
    }
    
    // Classify category
    let category = 'general';
    if (text.toLowerCase().includes('interest rate') || text.toLowerCase().includes('monetary')) {
        category = 'monetary policy';
    } else if (text.toLowerCase().includes('inflation')) {
        category = 'inflation';
    } else if (text.toLowerCase().includes('employment') || text.toLowerCase().includes('jobs')) {
        category = 'employment';
    }
    
    return {
        sentiment: {
            sentiment: sentiment,
            confidence: confidence
        },
        keyPhrases: keyPhrases,
        entities: entities,
        category: category
    };
}

exports.handler = async (event) => {
    try {
        console.log('Backend Lambda invoked:', JSON.stringify(event, null, 2));
        
        const { httpMethod, path, pathParameters, body } = event;
        
        console.log(`Processing ${httpMethod} ${path}`);
        
        // Handle CORS preflight
        if (httpMethod === 'OPTIONS') {
            return createResponse(200, { message: 'CORS preflight successful' });
        }
        
        // Route handling
        if (httpMethod === 'GET' && path === '/api/inquiries') {
            try {
                const inquiries = await loadDataFromS3('communications.json');
                return createResponse(200, inquiries || getFallbackData('inquiries'));
            } catch (error) {
                console.log('Using fallback data for inquiries');
                return createResponse(200, getFallbackData('inquiries'));
            }
        }
        
        if (httpMethod === 'GET' && path.startsWith('/api/dashboard/')) {
            const dashboardType = pathParameters?.id || 'analytics';
            
            try {
                let data;
                switch (dashboardType) {
                    case 'analytics':
                        data = await loadDataFromS3('dashboard_analytics.json');
                        break;
                    default:
                        data = await loadDataFromS3('dashboard_analytics.json');
                }
                return createResponse(200, data || getFallbackData('dashboard_analytics'));
            } catch (error) {
                console.log(`Using fallback data for dashboard/${dashboardType}`);
                return createResponse(200, getFallbackData('dashboard_analytics'));
            }
        }
        
        if (httpMethod === 'GET' && path.startsWith('/api/sentiment/')) {
            const sentimentType = pathParameters?.id || 'overview';
            
            try {
                const data = await loadDataFromS3('sentiment_analysis.json');
                return createResponse(200, data || getFallbackData('sentiment_analysis'));
            } catch (error) {
                console.log('Using fallback data for sentiment analysis');
                return createResponse(200, getFallbackData('sentiment_analysis'));
            }
        }
        
        if (httpMethod === 'GET' && path.startsWith('/api/trending/')) {
            const trendingType = pathParameters?.id || 'topics';
            
            try {
                const data = await loadDataFromS3('trending_topics.json');
                return createResponse(200, data || getFallbackData('trending_topics'));
            } catch (error) {
                console.log('Using fallback data for trending topics');
                return createResponse(200, getFallbackData('trending_topics'));
            }
        }
        
        if (httpMethod === 'GET' && path.startsWith('/api/ai/')) {
            const aiType = pathParameters?.id || 'insights';
            
            try {
                const data = await loadDataFromS3('ai_analytics.json');
                return createResponse(200, data || getFallbackData('ai_analytics'));
            } catch (error) {
                console.log('Using fallback data for AI analytics');
                return createResponse(200, getFallbackData('ai_analytics'));
            }
        }
        
        if (httpMethod === 'POST' && path.startsWith('/api/analyze/')) {
            const analyzeType = pathParameters?.id || 'text';
            
            if (analyzeType === 'text') {
                const requestBody = JSON.parse(body || '{}');
                const text = requestBody.text;
                
                if (!text) {
                    return createResponse(400, { error: 'Text is required for analysis' });
                }
                
                const analysis = analyzeText(text);
                return createResponse(200, analysis);
            }
        }
        
        if (httpMethod === 'POST' && path === '/api/inquiries') {
            const requestBody = JSON.parse(body || '{}');
            
            // Create new inquiry (in production, this would save to S3 or database)
            const newInquiry = {
                inquiry_id: `INQ-${Date.now()}`,
                ...requestBody,
                status: 'pending',
                date_created: new Date().toISOString()
            };
            
            return createResponse(201, newInquiry);
        }
        
        if (httpMethod === 'POST' && path.startsWith('/api/generate/')) {
            const generateType = pathParameters?.id || 'response';
            
            if (generateType === 'response') {
                const requestBody = JSON.parse(body || '{}');
                const inquiryId = requestBody.inquiryId;
                
                // Generate AI response (simplified)
                const aiResponse = {
                    response_id: `RESP-${Date.now()}`,
                    inquiry_id: inquiryId,
                    generated_response: "Thank you for your inquiry regarding Federal Reserve policy. The Federal Reserve carefully considers all economic indicators when making monetary policy decisions, including inflation data, employment statistics, and overall economic growth. Our decisions are guided by our dual mandate of price stability and maximum employment.",
                    confidence_score: 0.85,
                    generated_at: new Date().toISOString()
                };
                
                return createResponse(200, aiResponse);
            }
        }
        
        // Default response for unmatched routes
        return createResponse(404, { 
            error: 'Endpoint not found',
            path: path,
            method: httpMethod
        });
        
    } catch (error) {
        console.error('Lambda execution error:', error);
        return createResponse(500, { 
            error: 'Internal server error',
            message: error.message
        });
    }
};
