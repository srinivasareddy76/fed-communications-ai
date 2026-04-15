#!/bin/bash

# Federal Reserve Communications AI - Terraform Deployment Script
# This script automates the deployment process

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
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
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

# Build and push Docker image
build_and_push_image() {
    print_status "Building and pushing Docker image..."
    
    # Get ECR repository URL from Terraform output
    ECR_REPO_URL=$(terraform output -raw ecr_repository_url)
    AWS_REGION=$(terraform output -raw aws_region)
    
    print_status "ECR Repository: $ECR_REPO_URL"
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL
    
    # Build Docker image
    print_status "Building Docker image..."
    cd ..
    docker build -t fed-communications-ai .
    
    # Tag image for ECR
    docker tag fed-communications-ai:latest $ECR_REPO_URL:latest
    
    # Push image to ECR
    print_status "Pushing image to ECR..."
    docker push $ECR_REPO_URL:latest
    
    cd terraform
    print_success "Docker image built and pushed successfully."
}

# Update ECS service to use new image
update_ecs_service() {
    print_status "Updating ECS service..."
    
    CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
    SERVICE_NAME=$(terraform output -raw ecs_service_name)
    
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --force-new-deployment
    
    print_success "ECS service update initiated."
}

# Wait for deployment to complete
wait_for_deployment() {
    print_status "Waiting for deployment to complete..."
    
    CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
    SERVICE_NAME=$(terraform output -raw ecs_service_name)
    
    aws ecs wait services-stable --cluster $CLUSTER_NAME --services $SERVICE_NAME
    
    print_success "Deployment completed successfully."
}

# Display deployment information
show_deployment_info() {
    print_success "=== DEPLOYMENT COMPLETE ==="
    echo ""
    print_status "Application URL: $(terraform output -raw application_url)"
    print_status "Load Balancer DNS: $(terraform output -raw load_balancer_dns)"
    print_status "ECR Repository: $(terraform output -raw ecr_repository_url)"
    print_status "ECS Cluster: $(terraform output -raw ecs_cluster_name)"
    print_status "CloudWatch Logs: $(terraform output -raw cloudwatch_log_group_name)"
    echo ""
    print_warning "Note: It may take a few minutes for the load balancer to become healthy."
    print_status "You can check the status in the AWS Console or using AWS CLI."
}

# Main deployment function
main() {
    print_status "Starting Federal Reserve Communications AI deployment..."
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Please copy terraform.tfvars.example to terraform.tfvars and customize it."
        exit 1
    fi
    
    check_prerequisites
    check_aws_credentials
    init_terraform
    plan_terraform
    
    # Ask for confirmation before applying
    echo ""
    print_warning "This will create AWS resources that may incur costs."
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apply_terraform
        build_and_push_image
        update_ecs_service
        wait_for_deployment
        show_deployment_info
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
        plan_terraform
        ;;
    "apply")
        check_prerequisites
        check_aws_credentials
        apply_terraform
        ;;
    "build")
        check_prerequisites
        check_aws_credentials
        build_and_push_image
        ;;
    "destroy")
        print_warning "This will destroy all AWS resources created by Terraform."
        read -p "Are you sure you want to destroy the infrastructure? (y/N): " -n 1 -r
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
        echo "Usage: $0 [init|plan|apply|build|destroy]"
        echo ""
        echo "Commands:"
        echo "  init     - Initialize Terraform"
        echo "  plan     - Plan Terraform deployment"
        echo "  apply    - Apply Terraform deployment"
        echo "  build    - Build and push Docker image"
        echo "  destroy  - Destroy infrastructure"
        echo "  (no arg) - Full deployment process"
        exit 1
        ;;
esac

