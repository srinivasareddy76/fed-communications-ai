const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');
const moment = require('moment');
const _ = require('lodash');
const Sentiment = require('sentiment');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for Lambda
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Load sample data
let inquiries = [];
let responseTemplates = [];

// Load data from JSON files with fallback
try {
  const communicationsPath = path.join(__dirname, 'sample_data/communications.json');
  const templatesPath = path.join(__dirname, 'sample_data/response_templates.json');
  
  if (fs.existsSync(communicationsPath)) {
    inquiries = JSON.parse(fs.readFileSync(communicationsPath, 'utf8'));
    console.log('✅ Loaded communications data from JSON file');
  }
  
  if (fs.existsSync(templatesPath)) {
    responseTemplates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    console.log('✅ Loaded templates data from JSON file');
  }
} catch (error) {
  console.log('⚠️ Sample data files not found, using Federal Reserve fallback data');
}

// Fallback Federal Reserve inquiries if no data loaded
if (inquiries.length === 0) {
  inquiries = [
    {
      id: 1,
      subject: 'Request for Current Interest Rate Policy Statement',
      sender: 'financial.reporter@wsj.com',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      content: 'Dear Federal Reserve Communications Team, I am writing to request the most recent policy statement regarding the current federal funds rate. Could you please provide information about the rationale behind the current 5.25-5.50% rate range and any anticipated changes in the upcoming FOMC meetings?',
      priority: 'high',
      category: 'Media Inquiry',
      status: 'pending'
    },
    {
      id: 2,
      subject: 'Congressional Request: Inflation Data and Projections',
      sender: 'staff@banking.house.gov',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      content: 'The House Committee on Financial Services requests detailed information on current inflation metrics, including Core PCE data, and the Fed\'s projections for the next 12 months. This information is needed for upcoming hearings on monetary policy effectiveness.',
      priority: 'high',
      category: 'Congressional',
      status: 'pending'
    },
    {
      id: 3,
      subject: 'Academic Research: Employment Data Access',
      sender: 'research@economics.stanford.edu',
      date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      content: 'Hello, I am conducting research on the relationship between Federal Reserve policy and employment outcomes. Could you provide access to historical employment data used in FOMC decision-making processes? This is for academic publication purposes.',
      priority: 'medium',
      category: 'Academic',
      status: 'pending'
    }
  ];
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
      score: result.score / 10,
      label: sentimentLabel,
      confidence: Math.min(Math.abs(result.score) / 5, 1)
    };
  }

  static detectRisks(text, entities = []) {
    const riskKeywords = [
      'crisis', 'emergency', 'urgent', 'critical', 'failure', 'collapse',
      'panic', 'crash', 'recession', 'depression', 'bailout', 'default'
    ];
    
    const textLower = text.toLowerCase();
    const risks = riskKeywords.filter(keyword => textLower.includes(keyword));
    
    return {
      level: risks.length > 2 ? 'high' : risks.length > 0 ? 'medium' : 'low',
      keywords: risks,
      score: Math.min(risks.length / 3, 1)
    };
  }
}

// API Routes

// Dashboard Analytics
app.get('/api/dashboard/analytics', (req, res) => {
  try {
    const recentInquiries = inquiries.slice(0, 10);
    const totalInquiries = recentInquiries.length;
    const highPriorityInquiries = recentInquiries.filter(inq => inq.priority === 'high').length;
    const avgResponseTime = 2.3;
    
    const sentimentDist = {
      positive: 65,
      neutral: 25,
      negative: 10
    };
    
    const categoryDist = _.countBy(recentInquiries, 'category');
    const riskAlerts = 2;
    
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
  } catch (error) {
    console.error('Error in /api/dashboard/analytics:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Inquiries Management
app.get('/api/inquiries', (req, res) => {
  try {
    const { page = 1, limit = 20, category, priority, source } = req.query;
    
    let filtered = [...inquiries];
    
    if (category) filtered = filtered.filter(inq => inq.category === category);
    if (priority) filtered = filtered.filter(inq => inq.priority === priority);
    if (source) filtered = filtered.filter(inq => inq.source === source);
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const startIndex = (page - 1) * limit;
    const paginatedResults = filtered.slice(startIndex, startIndex + parseInt(limit));
    
    const transformedResults = paginatedResults.map(inq => ({
      ...inq,
      body: inq.content || inq.body,
      sender_name: inq.sender || inq.sender_name || 'Unknown',
      sender_organization: inq.sender_organization || 'N/A',
      channel: inq.channel || inq.source || 'email'
    }));
    
    res.json({
      inquiries: transformedResults,
      total: filtered.length,
      page: parseInt(page),
      totalPages: Math.ceil(filtered.length / limit)
    });
  } catch (error) {
    console.error('Error in /api/inquiries:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get single inquiry
app.get('/api/inquiries/:id', (req, res) => {
  try {
    const inquiry = inquiries.find(inq => inq.id == req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    const sentimentAnalysis = AIServices.analyzeSentiment(inquiry.content || inquiry.body || '');
    const risks = AIServices.detectRisks(inquiry.content || inquiry.body || '');
    const suggestedCategory = AIServices.categorizeInquiry(inquiry.content || inquiry.body || '');
    
    res.json({
      ...inquiry,
      analysis: {
        sentiment: sentimentAnalysis,
        risks,
        suggestedCategory,
        analyzedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in /api/inquiries/:id:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'lambda'
  });
});

// Serve main application
app.get('/', (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'backend/three-panel-app.js');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const htmlMatch = htmlContent.match(/return `([\s\S]*?)`;/);
      if (htmlMatch) {
        res.send(htmlMatch[1]);
      } else {
        res.status(500).send('Error: Could not extract HTML content');
      }
    } else {
      res.status(404).send('Application not found');
    }
  } catch (error) {
    console.error('Error serving main page:', error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
