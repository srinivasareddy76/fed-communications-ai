

# Federal Reserve Communications AI - Serverless PowerShell Deployment Script
# This script deploys the application using AWS Lambda instead of containers

param(
    [Parameter(Position=0)]
    [ValidateSet("", "init", "plan", "apply", "test", "destroy")]
    [string]$Command = ""
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
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
    
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        $missingTools += "Node.js"
    }
    
    if ($missingTools.Count -gt 0) {
        Write-Error "Missing required tools: $($missingTools -join ', ')"
        Write-Status "Please install the missing tools:"
        Write-Status "- Terraform: https://www.terraform.io/downloads"
        Write-Status "- AWS CLI: https://aws.amazon.com/cli/"
        Write-Status "- Node.js: https://nodejs.org/"
        exit 1
    }
    
    Write-Success "All prerequisites are installed."
}

# Check AWS credentials
function Test-AWSCredentials {
    Write-Status "Checking AWS credentials..."
    
    try {
        $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
        $awsRegion = aws configure get region
        
        Write-Success "AWS credentials configured for account: $($identity.Account) in region: $awsRegion"
        return $true
    }
    catch {
        Write-Error "AWS credentials not configured. Please run 'aws configure' first."
        return $false
    }
}

# Install Lambda dependencies
function Install-Dependencies {
    Write-Status "Installing Lambda function dependencies..."
    
    # Install backend dependencies
    if (Test-Path "lambda/backend/package.json") {
        Set-Location lambda/backend
        npm install --production
        Set-Location ../..
        Write-Success "Backend dependencies installed."
    }
    
    # Frontend doesn't need dependencies (pure HTML/JS)
    Write-Success "Frontend is ready (no dependencies required)."
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

# Display deployment information
function Show-DeploymentInfo {
    Write-Success "=== SERVERLESS DEPLOYMENT COMPLETE ==="
    Write-Host ""
    
    try {
        $apiUrl = terraform output -raw api_gateway_url
        $frontendFunction = terraform output -raw lambda_frontend_function
        $backendFunction = terraform output -raw lambda_backend_function
        $inquiriesTable = terraform output -raw dynamodb_inquiries_table
        $templatesTable = terraform output -raw dynamodb_templates_table
        $analyticsTable = terraform output -raw dynamodb_analytics_table
        
        Write-Status "Application URL: $apiUrl"
        Write-Status "Frontend Lambda: $frontendFunction"
        Write-Status "Backend Lambda: $backendFunction"
        Write-Status "DynamoDB Tables:"
        Write-Status "  - Inquiries: $inquiriesTable"
        Write-Status "  - Templates: $templatesTable"
        Write-Status "  - Analytics: $analyticsTable"
        Write-Host ""
        Write-Warning "Note: It may take a few minutes for the API Gateway to become fully available."
        Write-Status "You can access the application at the URL above."
        Write-Host ""
        Write-Status "Cost Estimate: ~`$5-15/month (much cheaper than containers!)"
    }
    catch {
        Write-Error "Failed to retrieve deployment information: $_"
    }
}

# Test deployment
function Test-Deployment {
    Write-Status "Testing deployment..."
    
    try {
        $apiUrl = terraform output -raw api_gateway_url
        
        # Test frontend
        Write-Status "Testing frontend..."
        $frontendResponse = Invoke-WebRequest -Uri $apiUrl -Method GET -UseBasicParsing
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Success "Frontend is responding correctly."
        } else {
            Write-Warning "Frontend may not be fully ready yet."
        }
        
        # Test backend API
        Write-Status "Testing backend API..."
        $backendResponse = Invoke-WebRequest -Uri "$apiUrl/api/inquiries" -Method GET -UseBasicParsing
        if ($backendResponse.StatusCode -eq 200) {
            Write-Success "Backend API is responding correctly."
        } else {
            Write-Warning "Backend API may not be fully ready yet."
        }
    }
    catch {
        Write-Warning "Testing failed or services not ready yet: $_"
    }
}

# Main deployment function
function Start-ServerlessDeployment {
    Write-Status "Starting Federal Reserve Communications AI serverless deployment..."
    
    if (!(Test-Prerequisites)) { exit 1 }
    if (!(Test-AWSCredentials)) { exit 1 }
    Install-Dependencies
    if (!(Initialize-Terraform)) { exit 1 }
    if (!(New-TerraformPlan)) { exit 1 }
    
    # Ask for confirmation before applying
    Write-Host ""
    Write-Warning "This will create AWS Lambda functions and DynamoDB tables."
    Write-Status "Estimated monthly cost: `$5-15 (much cheaper than containers)"
    $confirmation = Read-Host "Do you want to proceed with the deployment? (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        if (!(Invoke-TerraformApply)) { exit 1 }
        Show-DeploymentInfo
        Test-Deployment
    }
    else {
        Write-Status "Deployment cancelled."
        exit 0
    }
}

# Handle script arguments
switch ($Command) {
    "init" {
        Test-Prerequisites
        Initialize-Terraform
    }
    "plan" {
        Test-Prerequisites
        Test-AWSCredentials
        Install-Dependencies
        New-TerraformPlan
    }
    "apply" {
        Test-Prerequisites
        Test-AWSCredentials
        Install-Dependencies
        Invoke-TerraformApply
    }
    "test" {
        Test-Deployment
    }
    "destroy" {
        Write-Warning "This will destroy all AWS resources created by Terraform."
        $confirmation = Read-Host "Are you sure you want to destroy the serverless infrastructure? (y/N)"
        
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            terraform destroy
        }
        else {
            Write-Status "Destroy cancelled."
        }
    }
    "" {
        Start-ServerlessDeployment
    }
    default {
        Write-Host "Usage: .\deploy-serverless.ps1 [init|plan|apply|test|destroy]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  init     - Initialize Terraform"
        Write-Host "  plan     - Plan Terraform deployment"
        Write-Host "  apply    - Apply Terraform deployment"
        Write-Host "  test     - Test deployed application"
        Write-Host "  destroy  - Destroy infrastructure"
        Write-Host "  (no arg) - Full deployment process"
        exit 1
    }
}



