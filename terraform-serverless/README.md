


# 🚀 Federal Reserve Communications AI - Serverless Deployment

This directory contains a **serverless version** of the Federal Reserve Communications AI application using AWS Lambda, API Gateway, and DynamoDB. This approach is much simpler, cheaper, and easier to maintain than Docker containers.

## 🏗️ Architecture Overview

### Serverless Components
- **Frontend Lambda**: Serves the complete web application as HTML/CSS/JavaScript
- **Backend Lambda**: Handles all API endpoints and business logic
- **API Gateway**: Routes requests and handles CORS
- **DynamoDB**: NoSQL database for inquiries, templates, and analytics
- **CloudWatch**: Logging and monitoring

### Benefits over Container Deployment
- ✅ **Much Cheaper**: ~$5-15/month vs ~$90/month for containers
- ✅ **No Docker Required**: Pure JavaScript deployment
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Zero Server Management**: Fully managed by AWS
- ✅ **Faster Deployment**: No container builds or pushes

## 📋 Prerequisites

### Required Software
```bash
# Install Node.js (for Lambda dependencies)
# Download from: https://nodejs.org/

# Install Terraform
# Download from: https://www.terraform.io/downloads

# Install AWS CLI
# Download from: https://aws.amazon.com/cli/
```

### AWS Configuration
```bash
# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

## 🚀 Quick Deployment

### Option 1: Automated Deployment

#### Linux/Mac
```bash
cd terraform-serverless
chmod +x deploy-serverless.sh
./deploy-serverless.sh
```

#### Windows (PowerShell)
```powershell
cd terraform-serverless
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy-serverless.ps1
```

### Option 2: Manual Steps

```bash
# 1. Navigate to serverless directory
cd terraform-serverless

# 2. Install Lambda dependencies
cd lambda/backend && npm install --production && cd ../..

# 3. Initialize Terraform
terraform init

# 4. Plan deployment
terraform plan

# 5. Apply deployment
terraform apply
```

## 📁 Project Structure

```
terraform-serverless/
├── main.tf                    # Main Terraform configuration
├── lambda_functions.tf        # Lambda and API Gateway setup
├── deploy-serverless.sh       # Linux/Mac deployment script
├── deploy-serverless.ps1      # Windows deployment script
├── lambda/
│   ├── frontend/
│   │   └── index.js          # Frontend Lambda (serves website)
│   └── backend/
│       ├── index.js          # Backend Lambda (API endpoints)
│       └── package.json      # Node.js dependencies
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables (Automatic)
The Terraform deployment automatically configures:
- `DYNAMODB_INQUIRIES_TABLE`: Inquiries table name
- `DYNAMODB_TEMPLATES_TABLE`: Response templates table
- `DYNAMODB_ANALYTICS_TABLE`: Analytics data table
- `AWS_REGION`: Deployment region

### Customization Options

#### Change AWS Region
```hcl
# In main.tf
variable "aws_region" {
  default = "us-west-2"  # Change to your preferred region
}
```

#### Change Environment
```hcl
# In main.tf
variable "environment" {
  default = "dev"  # or "staging", "prod"
}
```

## 📊 API Endpoints

### Frontend
- `GET /` - Main application interface

### Backend API
- `GET /api/inquiries` - List all inquiries
- `GET /api/inquiries/{id}` - Get specific inquiry
- `POST /api/inquiries` - Create new inquiry
- `PUT /api/inquiries/{id}` - Update inquiry
- `GET /api/dashboard/analytics` - Get dashboard data

### Sample API Usage
```bash
# Get application URL
API_URL=$(terraform output -raw api_gateway_url)

# Test frontend
curl $API_URL

# Test backend API
curl $API_URL/api/inquiries

# Get dashboard analytics
curl $API_URL/api/dashboard/analytics
```

## 💾 Database Schema

### Inquiries Table
```json
{
  "inquiry_id": "uuid",
  "subject": "string",
  "body": "string",
  "category": "string",
  "priority": "string",
  "source": "string",
  "date": "ISO string",
  "status": "string",
  "sentiment": "string"
}
```

### Analytics Table
```json
{
  "metric_id": "string",
  "metric_type": "string",
  "data": "object",
  "last_updated": "ISO string"
}
```

## 🔍 Monitoring and Debugging

### CloudWatch Logs
```bash
# View frontend logs
aws logs tail /aws/lambda/fed-communications-ai-frontend-prod --follow

# View backend logs
aws logs tail /aws/lambda/fed-communications-ai-backend-prod --follow
```

### Test Deployment
```bash
# Run built-in tests
./deploy-serverless.sh test

# Manual testing
API_URL=$(terraform output -raw api_gateway_url)
curl -I $API_URL
curl $API_URL/api/inquiries
```

### Common Issues

#### 1. Lambda Function Not Found
```bash
# Check if functions exist
aws lambda list-functions --query 'Functions[?contains(FunctionName, `fed-communications`)]'

# Redeploy if missing
terraform apply
```

#### 2. API Gateway 502 Error
```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/fed-communications"

# Check function configuration
aws lambda get-function --function-name fed-communications-ai-backend-prod
```

#### 3. DynamoDB Access Issues
```bash
# Check table exists
aws dynamodb list-tables --query 'TableNames[?contains(@, `fed-communications`)]'

# Check IAM permissions
aws iam get-role-policy --role-name fed-communications-ai-lambda-role-prod --policy-name fed-communications-ai-lambda-policy-prod
```

## 💰 Cost Analysis

### Monthly AWS Costs (us-east-1)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda Requests | 1M requests | ~$0.20 |
| Lambda Compute | 100GB-seconds | ~$1.67 |
| API Gateway | 1M requests | ~$3.50 |
| DynamoDB | On-demand, light usage | ~$2.50 |
| CloudWatch Logs | 1GB logs | ~$0.50 |
| **Total** | | **~$8.37** |

### Cost Comparison
- **Serverless**: ~$8/month
- **Container (ECS)**: ~$90/month
- **Savings**: ~$82/month (91% cheaper!)

### Cost Optimization Tips
1. Use DynamoDB on-demand billing for variable workloads
2. Set CloudWatch log retention to 7 days
3. Monitor Lambda memory usage and optimize
4. Use API Gateway caching for frequently accessed data

## 🔄 Updates and Maintenance

### Update Application Code
```bash
# 1. Modify Lambda functions in lambda/ directory
# 2. Redeploy
terraform apply

# Lambda functions are automatically updated
```

### Update Dependencies
```bash
# Update backend dependencies
cd lambda/backend
npm update
cd ../..

# Redeploy
terraform apply
```

### Scaling Configuration
```bash
# Lambda automatically scales, but you can set limits
aws lambda put-provisioned-concurrency-config \
  --function-name fed-communications-ai-backend-prod \
  --qualifier '$LATEST' \
  --provisioned-concurrency-config ProvisionedConcurrencyConfig=10
```

## 🔐 Security Features

### Built-in Security
- **IAM Roles**: Least-privilege access for Lambda functions
- **VPC**: Optional VPC deployment for enhanced security
- **HTTPS**: All traffic encrypted via API Gateway
- **CORS**: Properly configured cross-origin requests

### Security Best Practices
1. Regularly rotate AWS access keys
2. Enable CloudTrail for audit logging
3. Use AWS WAF for API Gateway protection
4. Implement request rate limiting

## 🧪 Development and Testing

### Local Development
```bash
# Test Lambda functions locally (requires SAM CLI)
sam local start-api

# Or test individual functions
sam local invoke BackendFunction --event test-event.json
```

### Environment Management
```bash
# Deploy to different environments
terraform workspace new dev
terraform workspace select dev
terraform apply -var="environment=dev"

terraform workspace new prod
terraform workspace select prod
terraform apply -var="environment=prod"
```

## 🗑️ Cleanup

### Destroy Infrastructure
```bash
# Using script
./deploy-serverless.sh destroy

# Manual cleanup
terraform destroy

# Verify cleanup
aws lambda list-functions --query 'Functions[?contains(FunctionName, `fed-communications`)]'
aws dynamodb list-tables --query 'TableNames[?contains(@, `fed-communications`)]'
```

## 🆚 Serverless vs Container Comparison

| Feature | Serverless (Lambda) | Container (ECS) |
|---------|-------------------|-----------------|
| **Cost** | ~$8/month | ~$90/month |
| **Complexity** | Low | High |
| **Scaling** | Automatic | Manual configuration |
| **Cold Starts** | 1-3 seconds | Always warm |
| **Deployment** | Simple (zip upload) | Complex (Docker build/push) |
| **Maintenance** | Minimal | Regular updates needed |
| **Vendor Lock-in** | AWS Lambda | Portable containers |

## 📞 Support and Resources

### Useful Commands
```bash
# Get all outputs
terraform output

# Check application status
curl -I $(terraform output -raw api_gateway_url)

# View recent logs
aws logs tail /aws/lambda/fed-communications-ai-backend-prod --since 1h

# Check DynamoDB tables
aws dynamodb scan --table-name $(terraform output -raw dynamodb_inquiries_table) --max-items 5
```

### AWS Console Links
- [Lambda Console](https://console.aws.amazon.com/lambda/)
- [API Gateway Console](https://console.aws.amazon.com/apigateway/)
- [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)

### Documentation
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**🎉 Congratulations!** You now have a fully serverless Federal Reserve Communications AI application that's cost-effective, scalable, and easy to maintain!



