

# 🚀 Federal Reserve Communications AI - Deployment Guide

This guide provides comprehensive instructions for deploying the Federal Reserve Communications AI application using Terraform on AWS.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Configuration Options](#configuration-options)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Cost Management](#cost-management)
8. [Security Considerations](#security-considerations)

## 🛠️ Prerequisites

### Required Software

#### Windows Users
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required tools
choco install terraform
choco install awscli
choco install docker-desktop
```

#### Linux/Mac Users
```bash
# Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Docker
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

### AWS Account Setup

1. **Create AWS Account**: https://aws.amazon.com/
2. **Create IAM User** with programmatic access
3. **Attach Policies**:
   - `AmazonECS_FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonVPCFullAccess`
   - `ElasticLoadBalancingFullAccess`
   - `CloudWatchFullAccess`
   - `IAMFullAccess`

4. **Configure AWS CLI**:
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your preferred region (e.g., us-east-1)
# Enter output format (json)
```

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd fed-communications-ai/terraform
```

### 2. Configure Variables
```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars

# Edit configuration (use your preferred editor)
notepad terraform.tfvars    # Windows
nano terraform.tfvars       # Linux
```

### 3. Deploy

#### Windows (PowerShell)
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\deploy.ps1
```

#### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Detailed Deployment Steps

### Step 1: Infrastructure Planning

#### Review terraform.tfvars
```hcl
# Basic Configuration
aws_region = "us-east-1"
environment = "prod"
project_name = "fed-communications-ai"

# Resource Sizing
task_cpu = "512"        # 256, 512, 1024, 2048, 4096
task_memory = "1024"    # 512, 1024, 2048, 4096, 8192
desired_count = 2       # Number of running containers

# Cost Optimization
enable_nat_gateway = true  # Set false to save ~$45/month

# Monitoring
log_retention_days = 7
enable_container_insights = true
```

### Step 2: Initialize Terraform
```bash
cd terraform
terraform init
```

### Step 3: Plan Deployment
```bash
terraform plan -out=tfplan
```

Review the plan output to understand what resources will be created:
- VPC with public/private subnets
- Application Load Balancer
- ECS Fargate cluster
- ECR repository
- Security groups
- IAM roles
- CloudWatch log groups

### Step 4: Apply Infrastructure
```bash
terraform apply tfplan
```

This creates all AWS infrastructure components.

### Step 5: Build and Deploy Application
```bash
# Get ECR repository URL
ECR_REPO=$(terraform output -raw ecr_repository_url)
AWS_REGION=$(terraform output -raw aws_region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

# Build and push Docker image
cd ..
docker build -t fed-communications-ai .
docker tag fed-communications-ai:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Update ECS service
cd terraform
CLUSTER=$(terraform output -raw ecs_cluster_name)
SERVICE=$(terraform output -raw ecs_service_name)
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

### Step 6: Verify Deployment
```bash
# Check service status
aws ecs describe-services --cluster $CLUSTER --services $SERVICE

# Get application URL
terraform output application_url

# Test application
curl -I $(terraform output -raw application_url)
```

## ⚙️ Configuration Options

### Environment Configurations

#### Development Environment
```hcl
# terraform.tfvars for development
aws_region = "us-east-1"
environment = "dev"
task_cpu = "256"
task_memory = "512"
desired_count = 1
enable_nat_gateway = false  # Save costs
log_retention_days = 3
```

#### Production Environment
```hcl
# terraform.tfvars for production
aws_region = "us-east-1"
environment = "prod"
task_cpu = "1024"
task_memory = "2048"
desired_count = 3
enable_nat_gateway = true
log_retention_days = 30
```

### Scaling Configuration

#### Auto Scaling (Advanced)
Add to `main.tf`:
```hcl
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.fed_communications_cluster.name}/${aws_ecs_service.fed_communications_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "fed-communications-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

## 📊 Monitoring and Maintenance

### CloudWatch Monitoring

#### View Logs
```bash
# Stream application logs
aws logs tail /ecs/fed-communications-ai --follow

# View specific log group
aws logs describe-log-groups --log-group-name-prefix "/ecs/fed-communications"
```

#### Set Up Alarms
```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "fed-communications-high-cpu" \
  --alarm-description "High CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Application Updates

#### Deploy New Version
```bash
# Build new image
docker build -t fed-communications-ai .
docker tag fed-communications-ai:latest $ECR_REPO:$(date +%Y%m%d-%H%M%S)
docker tag fed-communications-ai:latest $ECR_REPO:latest

# Push to ECR
docker push $ECR_REPO:$(date +%Y%m%d-%H%M%S)
docker push $ECR_REPO:latest

# Force new deployment
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

#### Rolling Back
```bash
# List available images
aws ecr describe-images --repository-name fed-communications-ai

# Update task definition with previous image
# Then update service
aws ecs update-service --cluster $CLUSTER --service $SERVICE --task-definition fed-communications-task:PREVIOUS_REVISION
```

## 🔧 Troubleshooting

### Common Issues

#### 1. ECS Tasks Not Starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition fed-communications-task

# Check service events
aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query 'services[0].events'

# Check task logs
aws logs tail /ecs/fed-communications-ai --since 1h
```

#### 2. Load Balancer Health Check Failing
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn $(aws elbv2 describe-target-groups --names fed-communications-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

# Check security groups
aws ec2 describe-security-groups --filters "Name=group-name,Values=fed-communications-*"
```

#### 3. Docker Build Issues
```bash
# Check Docker daemon
docker version

# Build with verbose output
docker build -t fed-communications-ai . --progress=plain

# Check image size
docker images fed-communications-ai
```

#### 4. Terraform Issues
```bash
# Refresh state
terraform refresh

# Check for drift
terraform plan

# Debug with detailed logs
export TF_LOG=DEBUG
terraform apply
```

### Debug Commands

#### ECS Debugging
```bash
# List all clusters
aws ecs list-clusters

# List services in cluster
aws ecs list-services --cluster $CLUSTER

# Describe running tasks
aws ecs list-tasks --cluster $CLUSTER --service-name $SERVICE
aws ecs describe-tasks --cluster $CLUSTER --tasks TASK_ARN
```

#### Network Debugging
```bash
# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=fed-communications-vpc"

# Check subnets
aws ec2 describe-subnets --filters "Name=tag:Name,Values=fed-communications-*"

# Check route tables
aws ec2 describe-route-tables --filters "Name=tag:Name,Values=fed-communications-*"
```

## 💰 Cost Management

### Monthly Cost Breakdown (us-east-1)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| ECS Fargate | 2 tasks, 512 CPU, 1GB RAM | ~$25 |
| Application Load Balancer | Standard | ~$18 |
| NAT Gateway | 1 gateway | ~$45 |
| CloudWatch Logs | 7-day retention | ~$1 |
| ECR Storage | <1GB | ~$1 |
| **Total** | | **~$90** |

### Cost Optimization Strategies

#### 1. Disable NAT Gateway for Development
```hcl
# In terraform.tfvars
enable_nat_gateway = false  # Saves ~$45/month
```

#### 2. Use Smaller Task Sizes
```hcl
# Development configuration
task_cpu = "256"
task_memory = "512"
desired_count = 1
```

#### 3. Shorter Log Retention
```hcl
log_retention_days = 3  # Instead of 7 or 30
```

#### 4. Scheduled Scaling
```bash
# Scale down during off-hours
aws ecs update-service --cluster $CLUSTER --service $SERVICE --desired-count 1

# Scale up during business hours
aws ecs update-service --cluster $CLUSTER --service $SERVICE --desired-count 3
```

### Cost Monitoring
```bash
# Set up billing alerts
aws budgets create-budget --account-id $(aws sts get-caller-identity --query Account --output text) --budget '{
  "BudgetName": "fed-communications-budget",
  "BudgetLimit": {
    "Amount": "100",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}'
```

## 🔐 Security Considerations

### Network Security
- Application runs in private subnets
- Load balancer in public subnets only
- Security groups restrict access to necessary ports
- NAT Gateway for secure outbound access

### Container Security
- Non-root user in Docker container
- Minimal base image (Alpine Linux)
- Health checks enabled
- Resource limits enforced

### IAM Security
- Least-privilege IAM roles
- Separate execution and task roles
- No hardcoded credentials
- Regular credential rotation

### Data Security
- All traffic encrypted in transit
- CloudWatch logs encrypted
- ECR images scanned for vulnerabilities

### Compliance Considerations
- All resources tagged for compliance tracking
- CloudTrail logging enabled
- VPC Flow Logs available
- Regular security assessments recommended

## 🗑️ Cleanup

### Destroy Infrastructure
```bash
# Using script
./deploy.sh destroy          # Linux/Mac
.\deploy.ps1 -Action destroy # Windows

# Manual cleanup
terraform destroy
```

### Verify Cleanup
```bash
# Check for remaining resources
aws ecs list-clusters
aws ec2 describe-vpcs --filters "Name=tag:Project,Values=fed-communications-ai"
aws ecr describe-repositories --repository-names fed-communications-ai
```

## 📞 Support and Resources

### AWS Console Links
- [ECS Console](https://console.aws.amazon.com/ecs/)
- [ECR Console](https://console.aws.amazon.com/ecr/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- [VPC Console](https://console.aws.amazon.com/vpc/)
- [Cost Explorer](https://console.aws.amazon.com/cost-management/)

### Useful Commands Reference
```bash
# Get all Terraform outputs
terraform output

# Check application health
curl -I $(terraform output -raw application_url)

# View recent logs
aws logs tail /ecs/fed-communications-ai --since 1h

# Check service status
aws ecs describe-services --cluster $(terraform output -raw ecs_cluster_name) --services $(terraform output -raw ecs_service_name)
```

### Documentation Links
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Note**: This deployment creates real AWS resources that incur costs. Always review the Terraform plan before applying and clean up resources when no longer needed.


