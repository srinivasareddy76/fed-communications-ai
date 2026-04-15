#!/bin/bash

# Fed Communications AI - EC2 User Data Script
# This script sets up the Node.js application on EC2 instances

# Update system
yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Git
yum install -y git

# Install CloudWatch agent
yum install -y amazon-cloudwatch-agent

# Create application directory
mkdir -p /opt/fed-comms-ai
cd /opt/fed-comms-ai

# Clone the application code (you'll need to update this with your actual repo)
# For now, we'll create the application structure directly

# Create package.json
cat > package.json << 'EOF'
{
  "name": "fed-comms-ai-backend",
  "version": "1.0.0",
  "description": "Fed Communications AI Backend Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "sentiment": "^5.0.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Install dependencies
npm install

# Download application files from S3 (if using S3 deployment)
# aws s3 sync s3://${s3_bucket}/app/ /opt/fed-comms-ai/ --region ${region}

# Create basic server.js if not downloaded from S3
cat > server.js << 'EOF'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 54989;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Sample data
const sampleInquiries = [
    {
        id: 1,
        subject: "Interest Rate Policy Question",
        body: "What is the Federal Reserve's current stance on interest rates?",
        timestamp: new Date().toISOString(),
        category: "Monetary Policy",
        priority: "high",
        source: "email"
    },
    {
        id: 2,
        subject: "Banking Regulation Inquiry",
        body: "Can you explain the new banking regulations?",
        timestamp: new Date().toISOString(),
        category: "Banking Regulation",
        priority: "medium",
        source: "phone"
    }
];

// API Routes
app.get('/api/inquiries', (req, res) => {
    res.json({ inquiries: sampleInquiries });
});

app.get('/api/dashboard/analytics', (req, res) => {
    res.json({
        sentiment: { positive: 60, neutral: 30, negative: 10 },
        topics: ["Interest Rates", "Banking", "Employment"],
        alerts: []
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Fed Communications AI</title></head>
        <body>
            <h1>🏛️ Fed Communications AI</h1>
            <p>System is running on AWS!</p>
            <p>Health Check: <a href="/api/health">/api/health</a></p>
            <p>Inquiries API: <a href="/api/inquiries">/api/inquiries</a></p>
        </body>
        </html>
    `);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Fed Communications AI Server running on port ${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
EOF

# Create systemd service
cat > /etc/systemd/system/fed-comms-ai.service << 'EOF'
[Unit]
Description=Fed Communications AI Node.js Application
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/fed-comms-ai
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=54989

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fed-comms-ai

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R ec2-user:ec2-user /opt/fed-comms-ai
chmod +x /opt/fed-comms-ai/server.js

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/fed-comms-ai",
                        "log_stream_name": "{instance_id}/system"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "FedCommsAI/EC2",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": [
                    "used_percent"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Enable and start the application service
systemctl daemon-reload
systemctl enable fed-comms-ai
systemctl start fed-comms-ai

# Wait for service to start
sleep 10

# Check service status
systemctl status fed-comms-ai

echo "Fed Communications AI deployment completed!"
EOF

