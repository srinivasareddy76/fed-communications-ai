
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Sample Federal Reserve inquiries (fallback data)
const sampleInquiries = [
  {
    id: 1,
    subject: 'Federal Reserve Interest Rate Policy Inquiry',
    sender: 'financial.reporter@wsj.com',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    content: 'Request for information regarding the Federal Reserve\'s current monetary policy stance and future rate projections...',
    priority: 'high',
    category: 'Monetary Policy',
    status: 'pending'
  },
  {
    id: 2,
    subject: 'Inflation Data Request',
    sender: 'staff@banking.house.gov',
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    content: 'Media inquiry requesting latest inflation metrics and Federal Reserve\'s assessment of price stability...',
    priority: 'medium',
    category: 'Economic Data',
    status: 'pending'
  },
  {
    id: 3,
    subject: 'Banking Supervision Guidelines',
    sender: 'citizen.inquiry@gmail.com',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    content: 'Request for clarification on recent banking supervision guidelines and regulatory compliance requirements...',
    priority: 'medium',
    category: 'Banking',
    status: 'pending'
  }
];

// Load data with fallback
let inquiries = sampleInquiries;
try {
  const dataPath = path.join(__dirname, '../sample_data/communications.json');
  if (fs.existsSync(dataPath)) {
    inquiries = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('✅ Loaded data from communications.json');
  } else {
    console.log('⚠️  Using fallback sample data');
  }
} catch (error) {
  console.log('⚠️  Error loading data, using fallback:', error.message);
}

// API endpoints
app.get('/api/inquiries', (req, res) => {
  try {
    const transformedInquiries = inquiries.map(inq => ({
      id: inq.id,
      subject: inq.subject,
      sender: inq.sender || inq.sender_name || 'Unknown',
      date: inq.date || inq.timestamp,
      content: inq.content || inq.body,
      priority: inq.priority || 'medium',
      category: inq.category || 'General',
      status: inq.status || 'pending'
    }));
    
    res.json({
      inquiries: transformedInquiries,
      total: transformedInquiries.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Error in /api/inquiries:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/dashboard/analytics', (req, res) => {
  try {
    res.json({
      totalInquiries: inquiries.length,
      highPriorityInquiries: inquiries.filter(inq => inq.priority === 'high').length,
      avgResponseTime: 2.3,
      sentimentDistribution: { positive: 65, neutral: 25, negative: 10 },
      categoryDistribution: { 'Monetary Policy': 3, 'Economic Data': 2, 'Banking': 1 },
      riskAlerts: 2,
      trendingTopics: ['monetary_policy', 'inflation', 'banking_regulation'],
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in /api/dashboard/analytics:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  try {
    const htmlPath = path.join(__dirname, 'three-panel-app.js');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      // Extract the HTML content from the module.exports
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
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fed Communications AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏠 Application: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

