# Fed Communications AI - AWS Lambda Deployment Guide

## 🚀 **Lambda Deployment (Serverless - Recommended)**

Lambda is perfect for your application! Much simpler, cheaper, and no EC2 management needed.

---

## **📊 Cost Comparison**

| Deployment Type | Monthly Cost | Complexity | Scalability |
|----------------|--------------|------------|-------------|
| **EC2 (Current)** | $90-120 | High | Manual |
| **Lambda (New)** | $5-15 | Low | Automatic |

---

## **🏗️ Architecture Changes**

**Current:** EC2 + Load Balancer + Auto Scaling
**New:** Lambda + API Gateway + CloudFront (optional)

---

## **Method 1: Serverless Framework (Easiest)**

### Step 1: Install Serverless Framework
```bash
npm install -g serverless
```

### Step 2: Create Serverless Configuration
```yaml
# serverless.yml
service: fed-communications-ai

provider:
  name: aws
  runtime: nodejs18.x
  region: us-west-2
  stage: ${opt:stage, 'prod'}
  memorySize: 512
  timeout: 30
  environment:
    NODE_ENV: production
    STAGE: ${self:provider.stage}

functions:
  app:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline

custom:
  serverless-offline:
    httpPort: 3000
```

### Step 3: Create Lambda Handler
```javascript
// lambda.js
const serverless = require('serverless-http');
const app = require('./backend/server');

module.exports.handler = serverless(app);
```

### Step 4: Modify Package.json
```json
{
  "name": "fed-communications-ai-lambda",
  "version": "1.0.0",
  "dependencies": {
    "serverless-http": "^3.2.0",
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "sentiment": "^5.0.2"
  },
  "devDependencies": {
    "serverless": "^3.38.0",
    "serverless-offline": "^13.3.0"
  }
}
```

### Step 5: Deploy
```bash
# Install dependencies
npm install

# Deploy to AWS
serverless deploy

# Get the API Gateway URL
serverless info
```

---

## **Method 2: AWS SAM (AWS Native)**

### Step 1: Install AWS SAM CLI
```bash
# Windows (using Chocolatey)
choco install aws-sam-cli

# Or download from: https://aws.amazon.com/serverless/sam/
```

### Step 2: Create SAM Template
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 512
    Runtime: nodejs18.x

Resources:
  FedCommsAiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: lambda.handler
      Events:
        ApiGateway:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
        RootApi:
          Type: Api
          Properties:
            Path: /
            Method: ANY

Outputs:
  ApiGatewayUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/"
```

### Step 3: Deploy with SAM
```bash
# Build
sam build

# Deploy
sam deploy --guided

# Follow prompts for stack name, region, etc.
```

---

## **Method 3: Direct Lambda + API Gateway**

### Step 1: Create Lambda Function
```javascript
// index.js (Lambda function)
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Import your existing routes
const threePanelApp = require('./three-panel-app');

// Routes
app.get('/', (req, res) => {
  res.send(threePanelApp);
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'AWS Lambda'
  });
});

// Add your other API routes here...

module.exports.handler = serverless(app);
```

### Step 2: Package and Deploy
```bash
# Create deployment package
zip -r fed-comms-ai.zip . -x "*.git*" "node_modules/.cache/*"

# Upload via AWS CLI
aws lambda create-function \
  --function-name fed-communications-ai \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://fed-comms-ai.zip
```

---

## **🔧 Code Modifications Needed**

### 1. Remove Socket.IO (Lambda Limitation)
Lambda doesn't support persistent connections. Replace with:
- **Polling**: Client polls API every 30 seconds
- **WebSockets**: Use API Gateway WebSocket API (separate setup)
- **Server-Sent Events**: For real-time updates

### 2. Modify Server.js
```javascript
// Remove server.listen() - Lambda handles this
// Remove Socket.IO setup
// Keep Express app and export it

// At the end of server.js:
module.exports = app; // Export for Lambda
```

### 3. Handle Static Files
```javascript
// For static assets, use S3 + CloudFront
// Or embed small assets directly in Lambda
```

---

## **🚀 Quick Lambda Deployment (Simplest)**

### Option A: Vercel (Easiest)
```bash
npm install -g vercel
vercel --prod
```

### Option B: Netlify Functions
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option C: AWS Lambda (Manual)
1. **Zip your code**
2. **Upload to Lambda console**
3. **Create API Gateway**
4. **Connect them**

---

## **📋 Lambda Deployment Checklist**

### Before Deployment:
- [ ] Remove Socket.IO or replace with polling
- [ ] Export Express app (don't call listen())
- [ ] Add serverless-http wrapper
- [ ] Test locally with serverless-offline
- [ ] Configure environment variables

### After Deployment:
- [ ] Test API Gateway URL
- [ ] Configure custom domain (optional)
- [ ] Set up CloudWatch monitoring
- [ ] Configure CORS if needed

---

## **🎯 Recommended Approach**

**For your use case, I recommend:**

1. **Serverless Framework** (Method 1) - Most flexible
2. **Remove Socket.IO** - Use polling for updates
3. **Keep existing API structure** - Minimal changes needed
4. **Deploy to Lambda + API Gateway**

**Benefits:**
- ✅ **99% cost reduction** ($5-15 vs $90-120)
- ✅ **No server management**
- ✅ **Auto-scaling**
- ✅ **No key pairs needed**
- ✅ **Deploy in 5 minutes**

---

## **🚀 Quick Start Command**

```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml (copy from above)
# Create lambda.js (copy from above)
# Modify server.js to export app

# Deploy
serverless deploy
```

**Result:** Your app will be live at an API Gateway URL in ~5 minutes!

Would you like me to help you implement any of these Lambda deployment methods?

