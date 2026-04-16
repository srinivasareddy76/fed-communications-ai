# Deployment Troubleshooting Guide

## Common "Internal Server Error" Causes

### 1. **Node.js Version Compatibility**
Check your Node.js version:
```bash
node --version
npm --version
```
Required: Node.js 16+ (recommended 18+)

### 2. **Missing Dependencies**
Install all dependencies:
```bash
cd backend
npm install
```

### 3. **Environment Variables**
Create a `.env` file in the backend directory:
```bash
PORT=3000
NODE_ENV=production
```

### 4. **File Paths Issues**
The app tries to load sample data from `../sample_data/`. Ensure these files exist:
- `sample_data/communications.json`
- `sample_data/response_templates.json`

### 5. **Port Conflicts**
Default port is 53788. Change if needed:
```bash
PORT=3000 npm start
```

## Diagnostic Steps

### Step 1: Check Server Logs
```bash
cd backend
npm start
# Look for error messages in the console
```

### Step 2: Test Basic Endpoints
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/inquiries
```

### Step 3: Check File Permissions
```bash
ls -la backend/
ls -la sample_data/
```

## Quick Fix Script

Run this script to diagnose issues:

```bash
#!/bin/bash
echo "=== Fed Communications AI Deployment Diagnostics ==="

echo "1. Checking Node.js version..."
node --version

echo "2. Checking if backend directory exists..."
ls -la backend/

echo "3. Checking package.json..."
cat backend/package.json

echo "4. Installing dependencies..."
cd backend && npm install

echo "5. Checking sample data files..."
ls -la ../sample_data/

echo "6. Testing server startup..."
timeout 10s npm start || echo "Server startup test completed"
```

## Production Deployment Checklist

- [ ] Node.js 16+ installed
- [ ] All npm dependencies installed
- [ ] Sample data files present
- [ ] Correct file permissions
- [ ] Environment variables set
- [ ] Port not in use
- [ ] Firewall allows the port
- [ ] Process manager (PM2) configured if needed

## Platform-Specific Notes

### Heroku
Add to `package.json`:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### AWS/Docker
Ensure the container has access to sample_data directory.

### Vercel/Netlify
May need serverless function configuration.
