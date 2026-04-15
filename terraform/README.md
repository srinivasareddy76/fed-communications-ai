

# Fed Communications AI - AWS Deployment Guide

This directory contains Terraform Infrastructure as Code (IaC) to deploy the Fed Communications AI system to AWS.

## 🏗️ Architecture Overview

The deployment creates:

- **VPC** with public and private subnets across 2 AZs
- **Application Load Balancer** for high availability
- **Auto Scaling Group** with EC2 instances running the Node.js application
- **S3 Bucket** for application assets and logs
- **CloudWatch** for monitoring and logging
- **IAM Roles** with least-privilege access to AWS services
- **Security Groups** with proper network isolation

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS CLI installed and configured
- AWS account with appropriate permissions
- EC2 Key Pair created in your target region

### 2. Terraform Installation
```bash
# Install Terraform (macOS)
brew install terraform

# Install Terraform (Linux)
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Verify installation
terraform version
```

### 3. AWS CLI Configuration
```bash
# Configure AWS credentials
aws configure

# Verify access
aws sts get-caller-identity
```

## 🚀 Quick Deployment

### Step 1: Prepare Configuration
```bash
# Navigate to terraform directory
cd terraform/

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit variables (REQUIRED)
nano terraform.tfvars
```

### Step 2: Required Variables
Edit `terraform.tfvars` and set:

```hcl
# REQUIRED: Your AWS region
aws_region = "us-west-2"

# REQUIRED: Your EC2 Key Pair name (create in AWS console first)
key_pair_name = "your-key-pair-name"

# RECOMMENDED: Restrict SSH access to your IP
ssh_cidr = "YOUR.IP.ADDRESS.HERE/32"

# Optional: Customize other settings
project_name = "fed-comms-ai"
environment  = "production"
instance_type = "t3.medium"
```

### Step 3: Deploy Infrastructure
```bash
# Initialize Terraform
terraform init

# Review deployment plan
terraform plan

# Deploy infrastructure
terraform apply
```

### Step 4: Access Your Application
After deployment completes, Terraform will output the application URL:

```
Outputs:

application_url = "http://fed-comms-ai-alb-123456789.us-west-2.elb.amazonaws.com"
```

## 📊 Monitoring and Management

### CloudWatch Logs
- Application logs: `/aws/ec2/fed-comms-ai`
- System metrics: `FedCommsAI/EC2` namespace

### Health Checks
- Load Balancer: Checks `/api/health` endpoint
- Auto Scaling: ELB health checks with 5-minute grace period

### Scaling
The Auto Scaling Group automatically:
- Maintains 2 instances by default
- Scales up to 3 instances under load
- Replaces unhealthy instances

## 🔧 Customization Options

### Instance Configuration
```hcl
# In terraform.tfvars
instance_type = "t3.large"    # Larger instances
min_size      = 2             # Minimum instances
max_size      = 5             # Maximum instances
desired_capacity = 3          # Target instances
```

### Network Configuration
```hcl
# Custom VPC CIDR
vpc_cidr = "172.16.0.0/16"

# Custom subnet ranges
public_subnet_cidrs  = ["172.16.1.0/24", "172.16.2.0/24"]
private_subnet_cidrs = ["172.16.10.0/24", "172.16.20.0/24"]
```

### SSL/HTTPS Configuration
```hcl
# Add SSL certificate (create in AWS Certificate Manager first)
domain_name     = "fed-comms-ai.yourdomain.com"
certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/..."
```

## 🔒 Security Features

### Network Security
- VPC with isolated subnets
- Security groups with minimal required access
- ALB only accepts HTTP/HTTPS traffic
- EC2 instances only accept traffic from ALB

### IAM Security
- Least-privilege IAM roles
- Instance profiles for AWS service access
- No hardcoded credentials

### Data Security
- S3 bucket encryption at rest
- CloudWatch logs encryption
- VPC flow logs (optional)

## 💰 Cost Optimization

### Default Costs (us-west-2)
- **EC2 Instances**: ~$60/month (2 x t3.medium)
- **Load Balancer**: ~$20/month
- **Data Transfer**: Variable
- **CloudWatch**: ~$5/month
- **S3 Storage**: ~$1/month

### Cost Reduction Options
```hcl
# Use smaller instances
instance_type = "t3.small"

# Reduce instance count
min_size = 1
desired_capacity = 1

# Use spot instances (add to launch template)
# Note: Requires additional configuration
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Key Pair Not Found
```
Error: InvalidKeyPair.NotFound
```
**Solution**: Create EC2 Key Pair in AWS console first, then update `key_pair_name` in terraform.tfvars

#### 2. Insufficient Permissions
```
Error: AccessDenied
```
**Solution**: Ensure AWS credentials have permissions for EC2, VPC, IAM, S3, CloudWatch

#### 3. Application Not Starting
**Check**: 
- EC2 instance logs in CloudWatch
- Security group allows port 54989
- User data script execution

#### 4. Health Check Failures
**Check**:
- Application responds on `/api/health`
- Security groups allow ALB → EC2 communication
- Instance has internet access for dependencies

### Debugging Commands
```bash
# Check Terraform state
terraform show

# View specific resource
terraform state show aws_instance.example

# SSH to instance (if key pair configured)
ssh -i your-key.pem ec2-user@INSTANCE_IP

# Check application logs on instance
sudo journalctl -u fed-comms-ai -f

# Check application status
sudo systemctl status fed-comms-ai
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Update infrastructure
terraform plan
terraform apply

# Force instance refresh (rolling update)
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name fed-comms-ai-asg \
  --preferences MinHealthyPercentage=50
```

### Backup and Recovery
- S3 bucket versioning enabled
- CloudWatch logs retained for 14 days
- Infrastructure recreatable from Terraform

## 🧹 Cleanup

### Destroy Infrastructure
```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy
```

**Warning**: This will permanently delete all resources and data.

## 📚 Additional Resources

### AWS Services Used
- [EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/)
- [Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [VPC](https://docs.aws.amazon.com/vpc/latest/userguide/)
- [CloudWatch](https://docs.aws.amazon.com/cloudwatch/)
- [IAM](https://docs.aws.amazon.com/iam/)

### Terraform Resources
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)

## 🆘 Support

For deployment issues:
1. Check CloudWatch logs
2. Review Terraform plan output
3. Verify AWS permissions
4. Check security group configurations

---

**Built for Federal Reserve Bank of San Francisco Hackathon**

*Secure, scalable, and production-ready deployment*


