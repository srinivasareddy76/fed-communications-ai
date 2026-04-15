
# Federal Reserve Communications AI - PowerShell Deployment Script
# This script automates the deployment process for Windows users

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("init", "plan", "apply", "build", "destroy", "full")]
    [string]$Action = "full"
)

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if required tools are installed
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    $missingTools = @()
    
    if (!(Get-Command terraform -ErrorAction SilentlyContinue)) {
        $missingTools += "Terraform"
    }
    
    if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
        $missingTools += "AWS CLI"
    }
    
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        $missingTools += "Docker"
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools: $($missingTools -join ', ')"
        Write-Status "Please install the missing tools and try again."
        Write-Status "Installation links:"
        Write-Status "- Terraform: https://www.terraform.io/downloads.html"
        Write-Status "- AWS CLI: https://aws.amazon.com/cli/"
        Write-Status "- Docker: https://www.docker.com/products/docker-desktop"
        exit 1
    }
    
    Write-Success "All prerequisites are installed."
}

# Check AWS credentials
function Test-AWSCredentials {
    Write-Status "Checking AWS credentials..."
    
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        $awsAccountId = $identity.Account
        $awsRegion = aws configure get region
        
        Write-Success "AWS credentials configured for account: $awsAccountId in region: $awsRegion"
        return $true
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure' first."
        return $false
    }
}

# Initialize Terraform
function Initialize-Terraform {
    Write-Status "Initializing Terraform..."
    
    try {
        terraform init
        Write-Success "Terraform initialized successfully."
        return $true
    }
    catch {
        Write-Error "Failed to initialize Terraform: $_"
        return $false
    }
}

# Plan Terraform deployment
function New-TerraformPlan {
    Write-Status "Planning Terraform deployment..."
    
    try {
        terraform plan -out=tfplan
        Write-Success "Terraform plan created successfully."
        return $true
    }
    catch {
        Write-Error "Failed to create Terraform plan: $_"
        return $false
    }
}

# Apply Terraform deployment
function Invoke-TerraformApply {
    Write-Status "Applying Terraform deployment..."
    
    try {
        terraform apply tfplan
        Write-Success "Terraform deployment completed successfully."
        return $true
    }
    catch {
        Write-Error "Failed to apply Terraform deployment: $_"
        return $false
    }
}

# Build and push Docker image
function Build-AndPushImage {
    Write-Status "Building and pushing Docker image..."
    
    try {
        # Get ECR repository URL from Terraform output
        $ecrRepoUrl = terraform output -raw ecr_repository_url
        $awsRegion = terraform output -raw aws_region
        
        Write-Status "ECR Repository: $ecrRepoUrl"
        
        # Login to ECR
        $loginCommand = aws ecr get-login-password --region $awsRegion
        $loginCommand | docker login --username AWS --password-stdin $ecrRepoUrl
        
        # Build Docker image
        Write-Status "Building Docker image..."
        Set-Location ..
        docker build -t fed-communications-ai .
        
        # Tag image for ECR
        docker tag fed-communications-ai:latest "$ecrRepoUrl`:latest"
        
        # Push image to ECR
        Write-Status "Pushing image to ECR..."
        docker push "$ecrRepoUrl`:latest"
        
        Set-Location terraform
        Write-Success "Docker image built and pushed successfully."
        return $true
    }
    catch {
        Write-Error "Failed to build and push Docker image: $_"
        Set-Location terraform
        return $false
    }
}

# Update ECS service
function Update-ECSService {
    Write-Status "Updating ECS service..."
    
    try {
        $clusterName = terraform output -raw ecs_cluster_name
        $serviceName = terraform output -raw ecs_service_name
        
        aws ecs update-service --cluster $clusterName --service $serviceName --force-new-deployment
        
        Write-Success "ECS service update initiated."
        return $true
    }
    catch {
        Write-Error "Failed to update ECS service: $_"
        return $false
    }
}

# Wait for deployment to complete
function Wait-ForDeployment {
    Write-Status "Waiting for deployment to complete..."
    
    try {
        $clusterName = terraform output -raw ecs_cluster_name
        $serviceName = terraform output -raw ecs_service_name
        
        aws ecs wait services-stable --cluster $clusterName --services $serviceName
        
        Write-Success "Deployment completed successfully."
        return $true
    }
    catch {
        Write-Error "Deployment failed or timed out: $_"
        return $false
    }
}

# Display deployment information
function Show-DeploymentInfo {
    Write-Success "=== DEPLOYMENT COMPLETE ==="
    Write-Host ""
    
    try {
        $appUrl = terraform output -raw application_url
        $lbDns = terraform output -raw load_balancer_dns
        $ecrRepo = terraform output -raw ecr_repository_url
        $ecsCluster = terraform output -raw ecs_cluster_name
        $logGroup = terraform output -raw cloudwatch_log_group_name
        
        Write-Status "Application URL: $appUrl"
        Write-Status "Load Balancer DNS: $lbDns"
        Write-Status "ECR Repository: $ecrRepo"
        Write-Status "ECS Cluster: $ecsCluster"
        Write-Status "CloudWatch Logs: $logGroup"
        Write-Host ""
        Write-Warning "Note: It may take a few minutes for the load balancer to become healthy."
        Write-Status "You can check the status in the AWS Console or using AWS CLI."
    }
    catch {
        Write-Warning "Could not retrieve all deployment information. Check Terraform outputs manually."
    }
}

# Destroy infrastructure
function Remove-Infrastructure {
    Write-Warning "This will destroy all AWS resources created by Terraform."
    $confirmation = Read-Host "Are you sure you want to destroy the infrastructure? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        try {
            terraform destroy -auto-approve
            Write-Success "Infrastructure destroyed successfully."
        }
        catch {
            Write-Error "Failed to destroy infrastructure: $_"
        }
    }
    else {
        Write-Status "Destroy cancelled."
    }
}

# Main deployment function
function Start-FullDeployment {
    Write-Status "Starting Federal Reserve Communications AI deployment..."
    
    # Check if terraform.tfvars exists
    if (!(Test-Path "terraform.tfvars")) {
        Write-Warning "terraform.tfvars not found."
        Write-Status "Please copy terraform.tfvars.example to terraform.tfvars and customize it."
        return $false
    }
    
    if (!(Test-Prerequisites)) { return $false }
    if (!(Test-AWSCredentials)) { return $false }
    if (!(Initialize-Terraform)) { return $false }
    if (!(New-TerraformPlan)) { return $false }
    
    # Ask for confirmation before applying
    Write-Host ""
    Write-Warning "This will create AWS resources that may incur costs."
    $confirmation = Read-Host "Do you want to proceed with the deployment? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        if (!(Invoke-TerraformApply)) { return $false }
        if (!(Build-AndPushImage)) { return $false }
        if (!(Update-ECSService)) { return $false }
        if (!(Wait-ForDeployment)) { return $false }
        Show-DeploymentInfo
        return $true
    }
    else {
        Write-Status "Deployment cancelled."
        return $false
    }
}

# Main script execution
switch ($Action) {
    "init" {
        Test-Prerequisites
        Initialize-Terraform
    }
    "plan" {
        Test-Prerequisites
        Test-AWSCredentials
        New-TerraformPlan
    }
    "apply" {
        Test-Prerequisites
        Test-AWSCredentials
        Invoke-TerraformApply
    }
    "build" {
        Test-Prerequisites
        Test-AWSCredentials
        Build-AndPushImage
    }
    "destroy" {
        Remove-Infrastructure
    }
    "full" {
        Start-FullDeployment
    }
    default {
        Write-Host "Usage: .\deploy.ps1 [-Action <init|plan|apply|build|destroy|full>]"
        Write-Host ""
        Write-Host "Actions:"
        Write-Host "  init     - Initialize Terraform"
        Write-Host "  plan     - Plan Terraform deployment"
        Write-Host "  apply    - Apply Terraform deployment"
        Write-Host "  build    - Build and push Docker image"
        Write-Host "  destroy  - Destroy infrastructure"
        Write-Host "  full     - Full deployment process (default)"
    }
}


