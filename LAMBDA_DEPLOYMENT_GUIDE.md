
# 🚀 Fed Communications AI - Lambda Deployment Guide

## 🔧 Lambda-Specific Fixes Applied

### **Problem Solved**: "Internal server error" in Lambda deployment

### **Root Cause**: 
- Original server.js included Socket.IO which doesn't work in Lambda
- High dependency versions incompatible with Lambda runtime
- Missing proper error handling for Lambda environment

### **Solution Implemented**:

1. **✅ Created Lambda-optimized server** (`lambda-server.js`)
   - Removed Socket.IO dependency
   - Simplified middleware stack
   - Added proper error handling
   - Lambda-compatible CORS configuration

2. **✅ Fixed dependency versions** (`package.json`)
   - Downgraded to stable, Lambda-compatible versions
   - Express 4.x instead of 5.x
   - Stable versions of all dependencies

3. **✅ Enhanced Lambda handler** (`lambda.js`)
   - Better error handling and logging
   - Fallback handler for debugging
   - Proper CORS headers
   - Event/context logging for troubleshooting

## 📦 Deployment Steps

### **Step 1: Install Dependencies**
```bash
npm install
```

### **Step 2: Test Locally (Optional)**
```bash
npm run dev
# Test at http://localhost:3000
```

### **Step 3: Deploy to AWS Lambda**
```bash
npm run deploy
```

### **Step 4: Check Logs**
```bash
npm run logs
```

## 🔍 Troubleshooting Your "Internal Server Error"

### **Most Likely Causes & Solutions:**

1. **Missing Dependencies in Lambda Package**
   - **Solution**: Ensure `npm install` runs in your deployment pipeline
   - **Check**: Lambda package includes `node_modules/`

2. **Lambda Timeout (30 seconds)**
   - **Solution**: Already configured in `serverless.yml`
   - **Check**: CloudWatch logs for timeout errors

3. **Memory Issues**
   - **Solution**: Increased to 512MB in `serverless.yml`
   - **Check**: CloudWatch metrics for memory usage

4. **File Path Issues**
   - **Solution**: Lambda-server uses proper path resolution
   - **Check**: Ensure `backend/three-panel-app.js` is in deployment package

5. **Environment Variables**
   - **Solution**: Set `NODE_ENV=production` in `serverless.yml`
   - **Check**: Lambda environment variables in AWS Console

## 🧪 Testing Your Lambda Deployment

### **Health Check Endpoint**
```bash
curl https://your-api-gateway-url/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-04-16T17:15:00.000Z",
  "version": "1.0.0",
  "environment": "lambda"
}
```

### **Main Application**
```bash
curl https://your-api-gateway-url/
```

**Expected**: HTML content of the three-panel application

### **API Endpoints**
```bash
curl https://your-api-gateway-url/api/inquiries
curl https://your-api-gateway-url/api/dashboard/analytics
```

## 📋 Deployment Checklist

- [ ] **Dependencies**: `npm install` completed successfully
- [ ] **Package Size**: Under 50MB (Lambda limit)
- [ ] **Node.js Version**: 18.x (matches `serverless.yml`)
- [ ] **Environment Variables**: `NODE_ENV=production` set
- [ ] **File Structure**: All required files included in package
- [ ] **Permissions**: Lambda execution role has necessary permissions
- [ ] **API Gateway**: Properly configured with CORS
- [ ] **CloudWatch**: Logs enabled for debugging

## 🔧 Key Files Modified

1. **`lambda.js`** - Enhanced error handling and logging
2. **`lambda-server.js`** - Lambda-optimized Express server (NEW)
3. **`package.json`** - Fixed dependency versions
4. **`serverless.yml`** - Proper Lambda configuration

## 🚨 Common Lambda Deployment Issues

### **Issue**: "Cannot find module"
**Solution**: Ensure all dependencies are in `package.json` and `npm install` runs during deployment

### **Issue**: "Task timed out after 30.00 seconds"
**Solution**: Check CloudWatch logs, optimize code, or increase timeout in `serverless.yml`

### **Issue**: "Internal server error" with no details
**Solution**: Check CloudWatch logs, the new Lambda handler provides detailed error logging

### **Issue**: CORS errors in browser
**Solution**: Already fixed with proper CORS headers in Lambda response

## 📊 Monitoring Your Lambda

### **CloudWatch Logs**
- Log Group: `/aws/lambda/fed-communications-ai-prod-app`
- Check for initialization errors and runtime errors

### **CloudWatch Metrics**
- Duration: Should be under 5 seconds for most requests
- Memory: Should be under 512MB
- Errors: Should be 0% for healthy deployment

## 🎯 Next Steps

1. **Deploy the updated code** using `npm run deploy`
2. **Test the health endpoint** to verify deployment
3. **Check CloudWatch logs** if issues persist
4. **Monitor performance** and adjust memory/timeout if needed

The Lambda deployment is now optimized and should resolve your "Internal server error" issue! 🎉

