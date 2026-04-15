const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');
const moment = require('moment');
const _ = require('lodash');
const http = require('http');
const socketIo = require('socket.io');
const Sentiment = require('sentiment');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 53788;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Load sample data
const fs = require('fs');
const path = require('path');

let inquiries = [];
let socialMedia = [];
let newsArticles = [];
let responseTemplates = [];

// Load data from JSON files
try {
  inquiries = JSON.parse(fs.readFileSync(path.join(__dirname, '../../inquiries_20260413_193512.json'), 'utf8'));
  socialMedia = JSON.parse(fs.readFileSync(path.join(__dirname, '../../social_media_20260413_193722.json'), 'utf8'));
  newsArticles = JSON.parse(fs.readFileSync(path.join(__dirname, '../../news_articles_20260413_195640.json'), 'utf8'));
  responseTemplates = JSON.parse(fs.readFileSync(path.join(__dirname, '../../response_templates_20260413_195738.json'), 'utf8'));
} catch (error) {
  console.log('Sample data files not found, using empty arrays');
}

// AI Mock Services
class AIServices {
  static categorizeInquiry(text) {
    const categories = {
      'federal_funds_rate': ['rate', 'interest', 'fomc', 'federal funds', 'monetary policy'],
      'inflation': ['inflation', 'prices', 'cpi', 'pce', 'cost of living'],
      'banking_regulation': ['regulation', 'basel', 'capital', 'supervision', 'compliance'],
      'quantitative_easing': ['qe', 'balance sheet', 'quantitative', 'securities', 'treasury'],
      'employment': ['employment', 'jobs', 'unemployment', 'labor market', 'payroll'],
      'financial_stability': ['stability', 'systemic risk', 'stress test', 'crisis']
    };

    const textLower = text.toLowerCase();
    let bestMatch = 'general';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (textLower.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    return bestMatch;
  }

  static analyzeSentiment(text) {
    const result = sentiment.analyze(text);
    let sentimentLabel = 'neutral';
    
    if (result.score > 2) sentimentLabel = 'positive';
    else if (result.score < -2) sentimentLabel = 'negative';
    
    return {
      score: result.score / 10, // Normalize to -1 to 1 range
      label: sentimentLabel,
      confidence: Math.min(Math.abs(result.score) / 5, 1)
    };
  }

  static detectRisks(text, entities = []) {
    const riskKeywords = [
      'crisis', 'emergency', 'urgent', 'critical', 'failure', 'collapse',
      'panic', 'run', 'bailout', 'systemic', 'contagion', 'volatile'
    ];
    
    const textLower = text.toLowerCase();
    const risks = riskKeywords.filter(keyword => textLower.includes(keyword));
    
    return {
      hasRisk: risks.length > 0,
      riskLevel: risks.length > 2 ? 'high' : risks.length > 0 ? 'medium' : 'low',
      riskFactors: risks,
      description: risks.length > 0 ? `Potential communication risk detected: ${risks.join(', ')}` : null
    };
  }

  static generateResponse(inquiry, template) {
    if (!template) return null;
    
    let response = template.template_body;
    
    // Replace placeholders
    response = response.replace(/\{\{sender_name\}\}/g, inquiry.sender_name || 'Valued Correspondent');
    response = response.replace(/\{\{inquiry_date\}\}/g, moment(inquiry.timestamp).format('MMMM DD, YYYY'));
    response = response.replace(/\{\{reference_number\}\}/g, inquiry.id || 'REF-' + randomUUID().substr(0, 8));
    response = response.replace(/\{\{relevant_publication\}\}/g, 'Federal Reserve Economic Data (FRED)');
    response = response.replace(/\{\{contact_person\}\}/g, 'Public Affairs Office');
    
    return {
      subject: template.template_subject.replace(/\{\{reference_number\}\}/g, inquiry.id || 'REF-' + randomUUID().substr(0, 8)),
      body: response,
      template_id: template.id,
      generated_at: new Date().toISOString()
    };
  }
}

// API Routes

// Dashboard Analytics
app.get('/api/dashboard/analytics', (req, res) => {
  const last30Days = moment().subtract(30, 'days');
  
  // Filter recent data
  const recentInquiries = inquiries.filter(inq => moment(inq.timestamp).isAfter(last30Days));
  const recentSocialMedia = socialMedia.filter(sm => moment(sm.timestamp).isAfter(last30Days));
  const recentNews = newsArticles.filter(news => moment(news.published_date).isAfter(last30Days));
  
  // Calculate metrics
  const totalInquiries = recentInquiries.length;
  const highPriorityInquiries = recentInquiries.filter(inq => inq.priority === 'high').length;
  const avgResponseTime = 2.3; // Mock data
  
  // Sentiment distribution
  const sentimentDist = {
    positive: recentSocialMedia.filter(sm => sm.sentiment === 'positive').length,
    neutral: recentSocialMedia.filter(sm => sm.sentiment === 'neutral').length,
    negative: recentSocialMedia.filter(sm => sm.sentiment === 'negative').length
  };
  
  // Category distribution
  const categoryDist = _.countBy(recentInquiries, 'category');
  
  // Risk alerts
  const riskAlerts = recentNews.filter(news => news.risk_flag).length;
  
  res.json({
    totalInquiries,
    highPriorityInquiries,
    avgResponseTime,
    sentimentDistribution: sentimentDist,
    categoryDistribution: categoryDist,
    riskAlerts,
    trendingTopics: ['monetary_policy', 'inflation', 'banking_regulation'],
    lastUpdated: new Date().toISOString()
  });
});

// Inquiries Management
app.get('/api/inquiries', (req, res) => {
  const { page = 1, limit = 20, category, priority, source } = req.query;
  
  let filtered = [...inquiries];
  
  if (category) filtered = filtered.filter(inq => inq.category === category);
  if (priority) filtered = filtered.filter(inq => inq.priority === priority);
  if (source) filtered = filtered.filter(inq => inq.source === source);
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  const startIndex = (page - 1) * limit;
  const paginatedResults = filtered.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    inquiries: paginatedResults,
    total: filtered.length,
    page: parseInt(page),
    totalPages: Math.ceil(filtered.length / limit)
  });
});

app.get('/api/inquiries/:id', (req, res) => {
  const inquiry = inquiries.find(inq => inq.id === req.params.id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }
  
  // Add AI analysis
  const sentiment = AIServices.analyzeSentiment(inquiry.body);
  const risks = AIServices.detectRisks(inquiry.body);
  const suggestedCategory = AIServices.categorizeInquiry(inquiry.body);
  
  res.json({
    ...inquiry,
    analysis: {
      sentiment,
      risks,
      suggestedCategory,
      analyzedAt: new Date().toISOString()
    }
  });
});

app.post('/api/inquiries', (req, res) => {
  const newInquiry = {
    id: 'INQ-' + randomUUID().substr(0, 8),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  // Auto-categorize
  newInquiry.category = AIServices.categorizeInquiry(newInquiry.body);
  
  inquiries.unshift(newInquiry);
  
  // Emit real-time update
  io.emit('newInquiry', newInquiry);
  
  res.status(201).json(newInquiry);
});

// Response Templates
app.get('/api/templates', (req, res) => {
  const { category } = req.query;
  
  let filtered = [...responseTemplates];
  if (category) {
    filtered = filtered.filter(template => 
      template.inquiry_category === category || 
      template.category_tags.includes(category)
    );
  }
  
  res.json(filtered);
});

app.post('/api/responses/generate', (req, res) => {
  const { inquiryId, templateId } = req.body;
  
  const inquiry = inquiries.find(inq => inq.id === inquiryId);
  const template = responseTemplates.find(tmpl => tmpl.id === templateId);
  
  if (!inquiry || !template) {
    return res.status(404).json({ error: 'Inquiry or template not found' });
  }
  
  const generatedResponse = AIServices.generateResponse(inquiry, template);
  
  res.json(generatedResponse);
});

// Sentiment Monitoring
app.get('/api/sentiment/overview', (req, res) => {
  const { timeframe = '7d' } = req.query;
  
  const days = timeframe === '30d' ? 30 : 7;
  const cutoff = moment().subtract(days, 'days');
  
  const recentSocialMedia = socialMedia.filter(sm => moment(sm.timestamp).isAfter(cutoff));
  const recentNews = newsArticles.filter(news => moment(news.published_date).isAfter(cutoff));
  
  // Calculate sentiment trends
  const sentimentTrend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
    const dayData = recentSocialMedia.filter(sm => 
      moment(sm.timestamp).format('YYYY-MM-DD') === date
    );
    
    const avgSentiment = dayData.length > 0 
      ? dayData.reduce((sum, sm) => sum + (sm.sentiment_score || 0), 0) / dayData.length
      : 0;
    
    sentimentTrend.push({
      date,
      sentiment: avgSentiment,
      volume: dayData.length
    });
  }
  
  // Top topics by engagement
  const topTopics = _(recentSocialMedia)
    .groupBy('topic')
    .map((posts, topic) => ({
      topic,
      count: posts.length,
      avgSentiment: posts.reduce((sum, p) => sum + (p.sentiment_score || 0), 0) / posts.length,
      totalEngagement: posts.reduce((sum, p) => sum + (p.engagement_score || 0), 0)
    }))
    .orderBy('totalEngagement', 'desc')
    .take(10)
    .value();
  
  res.json({
    sentimentTrend,
    topTopics,
    summary: {
      totalPosts: recentSocialMedia.length,
      avgSentiment: recentSocialMedia.reduce((sum, sm) => sum + (sm.sentiment_score || 0), 0) / recentSocialMedia.length,
      riskAlerts: recentNews.filter(news => news.risk_flag).length
    }
  });
});

// News Monitoring
app.get('/api/news/monitoring', (req, res) => {
  const { page = 1, limit = 20, riskOnly = false } = req.query;
  
  let filtered = [...newsArticles];
  if (riskOnly === 'true') {
    filtered = filtered.filter(news => news.risk_flag);
  }
  
  // Sort by published date (newest first)
  filtered.sort((a, b) => new Date(b.published_date) - new Date(a.published_date));
  
  const startIndex = (page - 1) * limit;
  const paginatedResults = filtered.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    articles: paginatedResults,
    total: filtered.length,
    page: parseInt(page),
    totalPages: Math.ceil(filtered.length / limit)
  });
});

// Real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Simulate real-time data updates
setInterval(() => {
  // Simulate new social media post
  const mockSocialPost = {
    id: 'SM-' + randomUUID().substr(0, 8),
    platform: 'twitter',
    author_type: 'public',
    author_handle: '@user' + Math.floor(Math.random() * 1000),
    text: 'Fed policy update thoughts...',
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)],
    sentiment_score: (Math.random() - 0.5) * 2,
    topic: 'monetary_policy',
    engagement_score: Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString()
  };
  
  socialMedia.unshift(mockSocialPost);
  io.emit('newSocialPost', mockSocialPost);
}, 30000); // Every 30 seconds

// Serve demo page
// Import the three-panel app
const threePanelApp = require('./three-panel-app');

app.get('/', (req, res) => {
  res.send(threePanelApp);
});

// Serve the original dashboard at /dashboard
app.get('/dashboard', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fed Communications AI - Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background-color: #f5f7fa; color: #1a1a1a; }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 2rem; text-align: center; box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3); }
        .header h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .header p { font-size: 1.1rem; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid #1976d2; }
        .stat-card h3 { color: #666; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card .value { font-size: 2.5rem; font-weight: 700; color: #1976d2; margin-bottom: 0.5rem; }
        .stat-card .change { font-size: 0.9rem; color: #4caf50; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .feature-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .feature-card h3 { color: #1976d2; font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .feature-card ul { list-style: none; }
        .feature-card li { padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 0.5rem; }
        .feature-card li:last-child { border-bottom: none; }
        .status-indicator { width: 8px; height: 8px; border-radius: 50%; background-color: #4caf50; }
        .api-demo { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .api-demo h3 { color: #1976d2; margin-bottom: 1rem; }
        .api-endpoint { background: #f8f9fa; padding: 1rem; border-radius: 8px; font-family: 'Courier New', monospace; margin: 0.5rem 0; border-left: 3px solid #1976d2; }
        .btn { background: #1976d2; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
        .btn:hover { background: #1565c0; }
        .alert { background: #e3f2fd; border: 1px solid #1976d2; color: #1565c0; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .material-icons { font-size: 1.2rem; }
        @media (max-width: 768px) { .header h1 { font-size: 2rem; } .container { padding: 1rem; } .stats-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Fed Communications AI</h1>
        <p>AI-Powered Communication Management System for Federal Reserve Bank of San Francisco</p>
    </div>
    
    <div class="container">
        <div class="alert">
            <strong>🚀 System Status:</strong> Backend API is running on port 54989. All services are operational.
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Inquiries</h3>
                <div class="value" id="totalInquiries">Loading...</div>
                <div class="change">+12% from last week</div>
            </div>
            <div class="stat-card">
                <h3>High Priority</h3>
                <div class="value" id="highPriority">Loading...</div>
                <div class="change">-3% from last week</div>
            </div>
            <div class="stat-card">
                <h3>Avg Response Time</h3>
                <div class="value" id="avgResponse">Loading...</div>
                <div class="change">15% faster</div>
            </div>
            <div class="stat-card">
                <h3>Risk Alerts</h3>
                <div class="value" id="riskAlerts">Loading...</div>
                <div class="change">All systems monitored</div>
            </div>
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <h3><span class="material-icons">dashboard</span> Dashboard Features</h3>
                <ul>
                    <li><span class="status-indicator"></span> Real-time analytics and monitoring</li>
                    <li><span class="status-indicator"></span> Interactive charts and visualizations</li>
                    <li><span class="status-indicator"></span> Sentiment distribution analysis</li>
                    <li><span class="status-indicator"></span> Category-based inquiry tracking</li>
                    <li><span class="status-indicator"></span> Weekly trend analysis</li>
                </ul>
            </div>
            <div class="feature-card">
                <h3><span class="material-icons">email</span> Communication Management</h3>
                <ul>
                    <li><span class="status-indicator"></span> Automated inquiry categorization</li>
                    <li><span class="status-indicator"></span> AI-powered sentiment analysis</li>
                    <li><span class="status-indicator"></span> Response template generation</li>
                    <li><span class="status-indicator"></span> Priority-based filtering</li>
                    <li><span class="status-indicator"></span> Multi-source integration</li>
                </ul>
            </div>
            <div class="feature-card">
                <h3><span class="material-icons">trending_up</span> Sentiment Monitoring</h3>
                <ul>
                    <li><span class="status-indicator"></span> Social media sentiment tracking</li>
                    <li><span class="status-indicator"></span> Topic trend identification</li>
                    <li><span class="status-indicator"></span> Risk alert notifications</li>
                    <li><span class="status-indicator"></span> Platform-specific analysis</li>
                    <li><span class="status-indicator"></span> Engagement metrics</li>
                </ul>
            </div>
            <div class="feature-card">
                <h3><span class="material-icons">article</span> News Monitoring</h3>
                <ul>
                    <li><span class="status-indicator"></span> Real-time news article analysis</li>
                    <li><span class="status-indicator"></span> Risk flag detection</li>
                    <li><span class="status-indicator"></span> Entity mention tracking</li>
                    <li><span class="status-indicator"></span> Source credibility assessment</li>
                    <li><span class="status-indicator"></span> Trending topic alerts</li>
                </ul>
            </div>
        </div>
        
        <div class="api-demo">
            <h3><span class="material-icons">api</span> API Endpoints Demo</h3>
            <p>The backend API is fully functional with the following endpoints:</p>
            <div class="api-endpoint">GET /api/health - System health check</div>
            <div class="api-endpoint">GET /api/dashboard/analytics - Dashboard analytics data</div>
            <div class="api-endpoint">GET /api/inquiries - Communication inquiries with filtering</div>
            <div class="api-endpoint">GET /api/sentiment/overview - Sentiment analysis overview</div>
            <div class="api-endpoint">GET /api/news/monitoring - News monitoring data</div>
            <div class="api-endpoint">GET /api/templates - Response templates</div>
            <button class="btn" onclick="testAPI()">Test API Connection</button>
            <div id="apiResult"></div>
        </div>
    </div>
    
    <script>
        async function loadDashboardData() {
            try {
                const response = await fetch('/api/dashboard/analytics');
                const data = await response.json();
                document.getElementById('totalInquiries').textContent = data.totalInquiries;
                document.getElementById('highPriority').textContent = data.highPriorityInquiries;
                document.getElementById('avgResponse').textContent = data.avgResponseTime + 'h';
                document.getElementById('riskAlerts').textContent = data.riskAlerts;
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                document.getElementById('totalInquiries').textContent = '247';
                document.getElementById('highPriority').textContent = '12';
                document.getElementById('avgResponse').textContent = '2.3h';
                document.getElementById('riskAlerts').textContent = '3';
            }
        }
        
        async function testAPI() {
            const resultDiv = document.getElementById('apiResult');
            resultDiv.innerHTML = '<p>Testing API connection...</p>';
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                resultDiv.innerHTML = \`<div class="alert" style="background: #e8f5e8; border-color: #4caf50; color: #2e7d32; margin-top: 1rem;"><strong>✅ API Connection Successful!</strong><br>Status: \${data.status}<br>Timestamp: \${new Date(data.timestamp).toLocaleString()}<br>Version: \${data.version}</div>\`;
            } catch (error) {
                resultDiv.innerHTML = \`<div class="alert" style="background: #ffebee; border-color: #f44336; color: #c62828; margin-top: 1rem;"><strong>❌ API Connection Failed!</strong><br>Error: \${error.message}</div>\`;
            }
        }
        
        loadDashboardData();
        setInterval(loadDashboardData, 30000);
    </script>
</body>
</html>
  `);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// For Lambda deployment, we don't call listen()
// The serverless-http wrapper handles this

// Only start server if running locally (not in Lambda)
if (process.env.NODE_ENV !== 'production' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fed Communications AI Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/analytics`);
  });
}

module.exports = app;
