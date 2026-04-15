
#!/bin/bash

# Fed Communications AI - Automated Deployment Script
# This script automates the deployment process to AWS

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if terraform is installed
    if ! command_exists terraform; then
        print_error "Terraform is not installed. Please install Terraform first."
        echo "Visit: https://www.terraform.io/downloads.html"
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command_exists aws; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        echo "Visit: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_error "AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup terraform variables
setup_variables() {
    print_status "Setting up Terraform variables..."
    
    cd terraform/
    
    if [ ! -f "terraform.tfvars" ]; then
        if [ -f "terraform.tfvars.example" ]; then
            cp terraform.tfvars.example terraform.tfvars
            print_warning "Created terraform.tfvars from example file."
            print_warning "Please edit terraform.tfvars and set your key_pair_name before continuing."
            
            # Try to get current region from AWS CLI
            CURRENT_REGION=$(aws configure get region 2>/dev/null || echo "us-west-2")
            sed -i.bak "s/us-west-2/$CURRENT_REGION/g" terraform.tfvars
            
            print_status "Set AWS region to: $CURRENT_REGION"
            print_warning "IMPORTANT: You must set 'key_pair_name' in terraform.tfvars"
            print_warning "Create an EC2 Key Pair in AWS console first if you haven't already."
            
            read -p "Press Enter after you've updated terraform.tfvars with your key pair name..."
        else
            print_error "terraform.tfvars.example not found!"
            exit 1
        fi
    else
        print_success "terraform.tfvars already exists."
    fi
}

# Function to validate terraform configuration
validate_terraform() {
    print_status "Validating Terraform configuration..."
    
    # Check if key_pair_name is set
    if grep -q "your-key-pair-name" terraform.tfvars; then
        print_error "Please update key_pair_name in terraform.tfvars with your actual EC2 key pair name."
        exit 1
    fi
    
    terraform validate
    print_success "Terraform configuration is valid!"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    print_status "Initializing Terraform..."
    terraform init
    
    print_status "Creating deployment plan..."
    terraform plan -out=tfplan
    
    print_warning "Review the plan above. This will create AWS resources that may incur costs."
    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying infrastructure..."
        terraform apply tfplan
        
        # Clean up plan file
        rm -f tfplan
        
        print_success "Deployment completed!"
        
        # Get outputs
        print_status "Getting deployment outputs..."
        terraform output
        
    else
        print_status "Deployment cancelled."
        rm -f tfplan
        exit 0
    fi
}

# Function to check deployment health
check_deployment() {
    print_status "Checking deployment health..."
    
    # Get ALB URL from terraform output
    ALB_URL=$(terraform output -raw application_url 2>/dev/null || echo "")
    
    if [ -n "$ALB_URL" ]; then
        print_status "Application URL: $ALB_URL"
        print_status "Waiting for application to be ready..."
        
        # Wait for health check
        for i in {1..30}; do
            if curl -s "$ALB_URL/api/health" >/dev/null 2>&1; then
                print_success "Application is healthy and responding!"
                print_success "Access your application at: $ALB_URL"
                break
            else
                print_status "Waiting for application... (attempt $i/30)"
                sleep 10
            fi
        done
        
        if [ $i -eq 30 ]; then
            print_warning "Application may still be starting up. Check AWS console for instance status."
        fi
    else
        print_warning "Could not retrieve application URL. Check Terraform outputs manually."
    fi
}

# Function to show post-deployment information
show_post_deployment_info() {
    print_success "Deployment Summary:"
    echo "===================="
    echo
    echo "✅ Infrastructure deployed successfully"
    echo "✅ Auto Scaling Group created with EC2 instances"
    echo "✅ Application Load Balancer configured"
    echo "✅ CloudWatch monitoring enabled"
    echo "✅ S3 bucket created for assets"
    echo
    print_status "Next Steps:"
    echo "1. Access your application using the URL above"
    echo "2. Monitor logs in CloudWatch: /aws/ec2/fed-comms-ai"
    echo "3. Check Auto Scaling Group in AWS console"
    echo "4. Review security groups and adjust SSH access as needed"
    echo
    print_warning "Cost Management:"
    echo "- Monitor AWS billing dashboard"
    echo "- Consider stopping instances during non-business hours"
    echo "- Run 'terraform destroy' to clean up when done testing"
    echo
}

# Main deployment function
main() {
    echo "🏛️  Fed Communications AI - AWS Deployment"
    echo "=========================================="
    echo
    
    check_prerequisites
    setup_variables
    validate_terraform
    deploy_infrastructure
    check_deployment
    show_post_deployment_info
    
    print_success "Deployment process completed!"
}

# Handle script arguments
case "${1:-}" in
    "destroy")
        print_warning "This will destroy all AWS resources created by Terraform."
        read -p "Are you sure you want to destroy the infrastructure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd terraform/
            terraform destroy
            print_success "Infrastructure destroyed."
        else
            print_status "Destroy cancelled."
        fi
        ;;
    "plan")
        cd terraform/
        terraform plan
        ;;
    "output")
        cd terraform/
        terraform output
        ;;
    "logs")
        print_status "Opening CloudWatch logs..."
        REGION=$(aws configure get region || echo "us-west-2")
        echo "CloudWatch Logs URL:"
        echo "https://$REGION.console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups/log-group/%2Faws%2Fec2%2Ffed-comms-ai"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  (no args)  - Deploy infrastructure"
        echo "  destroy    - Destroy infrastructure"
        echo "  plan       - Show deployment plan"
        echo "  output     - Show deployment outputs"
        echo "  logs       - Show CloudWatch logs URL"
        echo "  help       - Show this help"
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run '$0 help' for usage information."
        exit 1
        ;;
esac

