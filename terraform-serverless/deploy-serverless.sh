
#!/bin/bash

# Federal Reserve Communications AI - Serverless Deployment Script
# This script deploys the application using AWS Lambda instead of containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    print_success "All prerequisites are installed."
}

# Check AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    AWS_REGION=$(aws configure get region)
    
    print_success "AWS credentials configured for account: $AWS_ACCOUNT_ID in region: $AWS_REGION"
}

# Install Lambda dependencies
install_dependencies() {
    print_status "Installing Lambda function dependencies..."
    
    # Install backend dependencies
    if [ -f "lambda/backend/package.json" ]; then
        cd lambda/backend
        npm install --production
        cd ../..
        print_success "Backend dependencies installed."
    fi
    
    # Frontend doesn't need dependencies (pure HTML/JS)
    print_success "Frontend is ready (no dependencies required)."
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    terraform init
    print_success "Terraform initialized successfully."
}

# Plan Terraform deployment
plan_terraform() {
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    print_success "Terraform plan created successfully."
}

# Apply Terraform deployment
apply_terraform() {
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    print_success "Terraform deployment completed successfully."
}

# Display deployment information
show_deployment_info() {
    print_success "=== SERVERLESS DEPLOYMENT COMPLETE ==="
    echo ""
    print_status "Application URL: $(terraform output -raw api_gateway_url)"
    print_status "Frontend Lambda: $(terraform output -raw lambda_frontend_function)"
    print_status "Backend Lambda: $(terraform output -raw lambda_backend_function)"
    print_status "DynamoDB Tables:"
    print_status "  - Inquiries: $(terraform output -raw dynamodb_inquiries_table)"
    print_status "  - Templates: $(terraform output -raw dynamodb_templates_table)"
    print_status "  - Analytics: $(terraform output -raw dynamodb_analytics_table)"
    echo ""
    print_warning "Note: It may take a few minutes for the API Gateway to become fully available."
    print_status "You can access the application at the URL above."
    echo ""
    print_status "Cost Estimate: ~$5-15/month (much cheaper than containers!)"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    API_URL=$(terraform output -raw api_gateway_url)
    
    # Test frontend
    print_status "Testing frontend..."
    if curl -s -o /dev/null -w "%{http_code}" "$API_URL" | grep -q "200"; then
        print_success "Frontend is responding correctly."
    else
        print_warning "Frontend may not be fully ready yet."
    fi
    
    # Test backend API
    print_status "Testing backend API..."
    if curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/inquiries" | grep -q "200"; then
        print_success "Backend API is responding correctly."
    else
        print_warning "Backend API may not be fully ready yet."
    fi
}

# Main deployment function
main() {
    print_status "Starting Federal Reserve Communications AI serverless deployment..."
    
    check_prerequisites
    check_aws_credentials
    install_dependencies
    init_terraform
    plan_terraform
    
    # Ask for confirmation before applying
    echo ""
    print_warning "This will create AWS Lambda functions and DynamoDB tables."
    print_status "Estimated monthly cost: $5-15 (much cheaper than containers)"
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apply_terraform
        show_deployment_info
        test_deployment
    else
        print_status "Deployment cancelled."
        exit 0
    fi
}

# Handle script arguments
case "${1:-}" in
    "init")
        check_prerequisites
        init_terraform
        ;;
    "plan")
        check_prerequisites
        check_aws_credentials
        install_dependencies
        plan_terraform
        ;;
    "apply")
        check_prerequisites
        check_aws_credentials
        install_dependencies
        apply_terraform
        ;;
    "test")
        test_deployment
        ;;
    "destroy")
        print_warning "This will destroy all AWS resources created by Terraform."
        read -p "Are you sure you want to destroy the serverless infrastructure? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            terraform destroy
        else
            print_status "Destroy cancelled."
        fi
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [init|plan|apply|test|destroy]"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize Terraform"
        echo "  plan     - Plan Terraform deployment"
        echo "  apply    - Apply Terraform deployment"
        echo "  test     - Test deployed application"
        echo "  destroy  - Destroy infrastructure"
        echo "  (no arg) - Full deployment process"
        exit 1
        ;;
esac


