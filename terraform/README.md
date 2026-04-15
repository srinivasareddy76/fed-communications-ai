
# Federal Reserve Communications AI - Terraform Deployment

This directory contains Terraform infrastructure-as-code for deploying the Federal Reserve Communications AI application to AWS using ECS Fargate.

## 🏗️ Architecture Overview

The Terraform deployment creates:

- **VPC** with public and private subnets across 2 AZs
- **Application Load Balancer** for high availability
- **ECS Fargate Cluster** for containerized application
- **ECR Repository** for Docker images
- **CloudWatch Logs** for monitoring
- **Security Groups** with least-privilege access
- **IAM Roles** for ECS tasks
- **NAT Gateway** for outbound internet access (optional)

## 📋 Prerequisites

### Required Tools
```bash
# Install Terraform
# Windows (PowerShell as Administrator):
choco install terraform

# Or download from: https://www.terraform.io/downloads

# Install AWS CLI
# Windows:
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
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

### 1. Configure Variables
```bash
# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your settings
notepad terraform.tfvars  # Windows
```

### 2. Deploy Infrastructure
```bash
# Navigate to terraform directory
cd terraform

# Make deploy script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment
./deploy.sh                    # Linux/Mac
# OR
powershell -ExecutionPolicy Bypass -File deploy.ps1  # Windows
```

### 3. Access Application
After deployment completes, access your application at the provided URL.

## 📝 Manual Deployment Steps

### Step 1: Initialize Terraform
```bash
cd terraform
terraform init
```

### Step 2: Plan Deployment
```bash
terraform plan -out=tfplan
```

### Step 3: Apply Infrastructure
```bash
terraform apply tfplan
```

### Step 4: Build and Push Docker Image
```bash
# Get ECR repository URL
ECR_REPO=$(terraform output -raw ecr_repository_url)
AWS_REGION=$(terraform output -raw aws_region)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO

# Build and push image
cd ..
docker build -t fed-communications-ai .
docker tag fed-communications-ai:latest $ECR_REPO:latest
docker push $ECR_REPO:latest
```

### Step 5: Update ECS Service
```bash
cd terraform
CLUSTER=$(terraform output -raw ecs_cluster_name)
SERVICE=$(terraform output -raw ecs_service_name)

aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

## ⚙️ Configuration Options

### terraform.tfvars Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `aws_region` | AWS deployment region | `us-east-1` | Any AWS region |
| `environment` | Environment name | `prod` | `dev`, `staging`, `prod` |
| `task_cpu` | ECS task CPU units | `512` | `256`, `512`, `1024`, `2048`, `4096` |
| `task_memory` | ECS task memory (MB) | `1024` | `512`, `1024`, `2048`, `4096`, `8192` |
| `desired_count` | Number of running tasks | `2` | Any positive integer |
| `enable_nat_gateway` | Enable NAT Gateway | `true` | `true`, `false` |

### Cost Optimization
```hcl
# Low-cost configuration
task_cpu = "256"
task_memory = "512"
desired_count = 1
enable_nat_gateway = false  # Saves ~$45/month
```

### High-availability configuration
```hcl
# Production configuration
task_cpu = "1024"
task_memory = "2048"
desired_count = 3
enable_nat_gateway = true
```

## 📊 Monitoring and Logs

### CloudWatch Logs
```bash
# View logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/fed-communications"

# Stream logs
aws logs tail /ecs/fed-communications-ai --follow
```

### ECS Service Status
```bash
# Check service status
CLUSTER=$(terraform output -raw ecs_cluster_name)
SERVICE=$(terraform output -raw ecs_service_name)

aws ecs describe-services --cluster $CLUSTER --services $SERVICE
```

### Application Health
```bash
# Check load balancer health
ALB_DNS=$(terraform output -raw load_balancer_dns)
curl -I http://$ALB_DNS
```

## 🔧 Troubleshooting

### Common Issues

#### 1. ECS Tasks Not Starting
```bash
# Check task definition
aws ecs describe-task-definition --task-definition fed-communications-task

# Check service events
aws ecs describe-services --cluster $CLUSTER --services $SERVICE --query 'services[0].events'
```

#### 2. Load Balancer Health Check Failing
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn $(terraform output -raw target_group_arn)
```

#### 3. Docker Image Issues
```bash
# Verify image exists in ECR
aws ecr describe-images --repository-name fed-communications-ai
```

### Debug Commands
```bash
# Get all Terraform outputs
terraform output

# Check AWS resources
aws ecs list-clusters
aws ecs list-services --cluster $CLUSTER
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=fed-communications-vpc"
```

## 🔄 Updates and Maintenance

### Update Application Code
```bash
# Build new image
docker build -t fed-communications-ai .
docker tag fed-communications-ai:latest $ECR_REPO:latest
docker push $ECR_REPO:latest

# Force new deployment
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
```

### Update Infrastructure
```bash
# Modify terraform.tfvars or *.tf files
# Then apply changes
terraform plan
terraform apply
```

### Scale Application
```bash
# Update desired_count in terraform.tfvars
desired_count = 5

# Apply changes
terraform apply
```

## 💰 Cost Estimation

### Monthly AWS Costs (us-east-1)
- **ECS Fargate** (2 tasks, 512 CPU, 1GB RAM): ~$25
- **Application Load Balancer**: ~$18
- **NAT Gateway**: ~$45 (if enabled)
- **CloudWatch Logs**: ~$1
- **ECR Storage**: ~$1

**Total**: ~$45-90/month depending on configuration

### Cost Optimization Tips
1. Set `enable_nat_gateway = false` if outbound internet not needed
2. Use smaller task sizes for development
3. Reduce `desired_count` for non-production environments
4. Set shorter log retention periods

## 🗑️ Cleanup

### Destroy Infrastructure
```bash
# Destroy all resources
terraform destroy

# Or use the script
./deploy.sh destroy                    # Linux/Mac
powershell -File deploy.ps1 destroy   # Windows
```

**Warning**: This will permanently delete all AWS resources created by Terraform.

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

## 📞 Support

### AWS Resources Created
- VPC: `fed-communications-vpc`
- ECS Cluster: `fed-communications-cluster`
- Load Balancer: `fed-communications-alb`
- ECR Repository: `fed-communications-ai`

### Useful AWS Console Links
- [ECS Console](https://console.aws.amazon.com/ecs/)
- [ECR Console](https://console.aws.amazon.com/ecr/)
- [CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
- [VPC Console](https://console.aws.amazon.com/vpc/)

For issues or questions, check the troubleshooting section above or review AWS CloudWatch logs.

