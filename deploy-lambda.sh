
#!/bin/bash

# Fed Communications AI - Lambda Deployment Script

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    print_error "Serverless Framework not found. Installing..."
    npm install -g serverless
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    print_error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

print_status "🚀 Starting Lambda deployment for Fed Communications AI..."

# Install dependencies
print_status "Installing dependencies..."
npm install

# Deploy to AWS Lambda
print_status "Deploying to AWS Lambda..."
serverless deploy

# Get the endpoint URL
print_success "Deployment completed!"
print_status "Getting service information..."
serverless info

print_success "🎉 Fed Communications AI is now live on AWS Lambda!"
print_warning "💡 Note: Socket.IO real-time features are disabled in Lambda."
print_warning "💡 The app uses polling for updates instead."

