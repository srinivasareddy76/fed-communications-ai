# Fed Communications AI - Cloud Deployment Guide

## 🚀 AWS Deployment (Recommended)

### Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI installed and configured (`aws configure`)
3. Terraform installed (>= 1.0)
4. EC2 Key Pair created in your target AWS region

### Step-by-Step Deployment

#### 1. Prepare Your Environment
```bash
# Clone your repository
git clone <your-repo-url>
cd fed-communications-ai

# Make deployment script executable
chmod +x deploy.sh
```

#### 2. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and Output format
```

#### 3. Create EC2 Key Pair (if not exists)
```bash
# Create a new key pair in AWS
aws ec2 create-key-pair --key-name fed-comms-ai-key --query 'KeyMaterial' --output text > fed-comms-ai-key.pem
chmod 400 fed-comms-ai-key.pem
```

#### 4. Deploy Infrastructure
```bash
# Run the automated deployment script
./deploy.sh
```

The script will:
- ✅ Check prerequisites
- ✅ Setup Terraform variables
- ✅ Create VPC, subnets, security groups
- ✅ Deploy Auto Scaling Group with EC2 instances
- ✅ Configure Application Load Balancer
- ✅ Setup CloudWatch monitoring
- ✅ Deploy your application

#### 5. Access Your Application
After deployment, you'll get an Application Load Balancer URL:
```
https://fed-comms-ai-alb-xxxxxxxxx.us-west-2.elb.amazonaws.com
```

### Infrastructure Components
- **VPC**: Isolated network environment
- **Auto Scaling Group**: 1-3 EC2 instances (t3.medium)
- **Application Load Balancer**: High availability and SSL termination
- **CloudWatch**: Monitoring and logging
- **S3 Bucket**: Static assets storage
- **Security Groups**: Network security

### Cost Estimation (Monthly)
- EC2 instances (2x t3.medium): ~$60-80
- Application Load Balancer: ~$20
- Data transfer: ~$10-20
- **Total: ~$90-120/month**

---

## 🐳 Docker Deployment Options

### Option A: Docker Compose (Local/VPS)
```yaml
# docker-compose.yml
version: '3.8'
services:
  fed-comms-ai:
    build: .
    ports:
      - "80:53788"
    environment:
      - NODE_ENV=production
      - PORT=53788
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

### Option B: Docker with Cloud Providers

#### AWS ECS Fargate
```bash
# Build and push to ECR
aws ecr create-repository --repository-name fed-comms-ai
docker build -t fed-comms-ai .
docker tag fed-comms-ai:latest <account-id>.dkr.ecr.<region>.amazonaws.com/fed-comms-ai:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/fed-comms-ai:latest
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/<project-id>/fed-comms-ai
gcloud run deploy fed-comms-ai --image gcr.io/<project-id>/fed-comms-ai --platform managed
```

#### Azure Container Instances
```bash
# Build and deploy
az acr build --registry <registry-name> --image fed-comms-ai .
az container create --resource-group <rg-name> --name fed-comms-ai --image <registry-name>.azurecr.io/fed-comms-ai
```

---

## ☁️ Platform-as-a-Service Options

### Heroku
```bash
# Install Heroku CLI and login
heroku create fed-comms-ai-app
git push heroku main
heroku open
```

### Vercel (Frontend + Serverless Functions)
```bash
npm install -g vercel
vercel --prod
```

### Railway
```bash
# Connect GitHub repo to Railway
# Auto-deploys on git push
```

### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: fed-comms-ai
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/fed-communications-ai
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 53788
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Production settings
NODE_ENV=production
PORT=53788

# Optional: Database connections
# DATABASE_URL=postgresql://user:pass@host:port/db
# REDIS_URL=redis://host:port

# Optional: External API keys
# OPENAI_API_KEY=your-openai-key
# AWS_ACCESS_KEY_ID=your-aws-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret
```

### SSL/HTTPS Setup
For production deployments, ensure HTTPS:
- **AWS**: Use ACM (AWS Certificate Manager)
- **Cloudflare**: Free SSL proxy
- **Let's Encrypt**: Free SSL certificates

---

## 📊 Monitoring & Maintenance

### Health Checks
Your application includes health check endpoint:
```
GET /api/health
```

### Logging
- **AWS**: CloudWatch Logs
- **Docker**: Container logs
- **Application**: Console logs with timestamps

### Scaling Considerations
- **Horizontal**: Add more instances behind load balancer
- **Vertical**: Increase instance size (CPU/RAM)
- **Database**: Consider adding persistent storage for production data

---

## 🔒 Security Checklist

### Pre-Production Security
- [ ] Change default ports if needed
- [ ] Restrict SSH access to your IP only
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Enable security headers (Helmet.js already included)
- [ ] Set up monitoring and alerting
- [ ] Regular security updates

### Production Hardening
```bash
# Update security groups to restrict access
# Enable AWS GuardDuty for threat detection
# Set up AWS WAF for web application firewall
# Configure backup strategies
```

---

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure port 53788 is available
2. **Memory issues**: Increase instance size if needed
3. **SSL certificate**: Verify domain and certificate configuration
4. **Health check failures**: Check application logs

### Useful Commands
```bash
# Check deployment status
./deploy.sh output

# View logs
./deploy.sh logs

# Destroy infrastructure (cleanup)
./deploy.sh destroy
```

---

## 📞 Support

For deployment issues:
1. Check CloudWatch logs (AWS)
2. Verify security group settings
3. Test health check endpoint
4. Review Terraform state

Choose the deployment option that best fits your requirements, budget, and technical expertise!
