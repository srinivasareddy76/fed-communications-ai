

@echo off
echo.
echo 🚀 Fed Communications AI - Lambda Deployment
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS credentials not configured. Please run 'aws configure' first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

REM Install Serverless Framework if not present
serverless --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Serverless Framework...
    npm install -g serverless
)

echo 📦 Installing project dependencies...
npm install

echo.
echo 🚀 Deploying to AWS Lambda...
serverless deploy

echo.
echo 📊 Getting service information...
serverless info

echo.
echo 🎉 Deployment completed!
echo 💡 Your Fed Communications AI app is now live on AWS Lambda!
echo.
pause


