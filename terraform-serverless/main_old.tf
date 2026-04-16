

# Federal Reserve Communications AI - Serverless Terraform Infrastructure
# Based on the tennis coach serverless architecture

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "fed-communications-ai"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# Random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# DynamoDB table for storing inquiries
resource "aws_dynamodb_table" "inquiries" {
  name           = "${var.project_name}-inquiries-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "inquiry_id"

  attribute {
    name = "inquiry_id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  attribute {
    name = "priority"
    type = "S"
  }

  attribute {
    name = "date_created"
    type = "S"
  }

  global_secondary_index {
    name               = "category-index"
    hash_key           = "category"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "priority-index"
    hash_key           = "priority"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "date-index"
    hash_key           = "date_created"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "Fed Communications Inquiries"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for response templates
resource "aws_dynamodb_table" "response_templates" {
  name           = "${var.project_name}-templates-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "template_id"

  attribute {
    name = "template_id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name               = "category-template-index"
    hash_key           = "category"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "Fed Communications Templates"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for analytics data
resource "aws_dynamodb_table" "analytics" {
  name           = "${var.project_name}-analytics-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "metric_id"

  attribute {
    name = "metric_id"
    type = "S"
  }

  attribute {
    name = "metric_type"
    type = "S"
  }

  global_secondary_index {
    name               = "metric-type-index"
    hash_key           = "metric_type"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "Fed Communications Analytics"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for sentiment analysis results
resource "aws_dynamodb_table" "sentiment_analysis" {
  name           = "${var.project_name}-sentiment-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "analysis_id"

  attribute {
    name = "analysis_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "source"
    type = "S"
  }

  global_secondary_index {
    name               = "date-source-index"
    hash_key           = "date"
    range_key          = "source"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "Fed Communications Sentiment"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DynamoDB table for trending topics and risk indicators
resource "aws_dynamodb_table" "trending_topics" {
  name           = "${var.project_name}-trending-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "topic_id"

  attribute {
    name = "topic_id"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "trend_score"
    type = "N"
  }

  global_secondary_index {
    name               = "trending-index"
    hash_key           = "date"
    range_key          = "trend_score"
    projection_type    = "ALL"
  }

  tags = {
    Name        = "Fed Communications Trending Topics"
    Environment = var.environment
    Project     = var.project_name
  }
}

# S3 bucket for storing synthetic data files
resource "aws_s3_bucket" "synthetic_data" {
  bucket = "${var.project_name}-synthetic-data-${random_string.suffix.result}"

  tags = {
    Name        = "Fed Communications Synthetic Data"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_s3_bucket_versioning" "synthetic_data_versioning" {
  bucket = aws_s3_bucket.synthetic_data.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "synthetic_data_encryption" {
  bucket = aws_s3_bucket.synthetic_data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "synthetic_data_pab" {
  bucket = aws_s3_bucket.synthetic_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload synthetic data files to S3
resource "aws_s3_object" "communications_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "communications.json"
  source = "${path.module}/../sample_data/communications.json"
  etag   = filemd5("${path.module}/../sample_data/communications.json")

  tags = {
    Name = "Communications Sample Data"
  }
}

resource "aws_s3_object" "dashboard_analytics_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "dashboard_analytics.json"
  source = "${path.module}/../sample_data/dashboard_analytics.json"
  etag   = filemd5("${path.module}/../sample_data/dashboard_analytics.json")

  tags = {
    Name = "Dashboard Analytics Data"
  }
}

resource "aws_s3_object" "trending_topics_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "trending_topics.json"
  source = "${path.module}/../sample_data/trending_topics.json"
  etag   = filemd5("${path.module}/../sample_data/trending_topics.json")

  tags = {
    Name = "Trending Topics Data"
  }
}

resource "aws_s3_object" "ai_analytics_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "ai_analytics.json"
  source = "${path.module}/../sample_data/ai_analytics.json"
  etag   = filemd5("${path.module}/../sample_data/ai_analytics.json")

  tags = {
    Name = "AI Analytics Data"
  }
}

resource "aws_s3_object" "historical_trends_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "historical_trends.json"
  source = "${path.module}/../sample_data/historical_trends.json"
  etag   = filemd5("${path.module}/../sample_data/historical_trends.json")

  tags = {
    Name = "Historical Trends Data"
  }
}

resource "aws_s3_object" "response_templates_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "response_templates.json"
  source = "${path.module}/../sample_data/response_templates.json"
  etag   = filemd5("${path.module}/../sample_data/response_templates.json")

  tags = {
    Name = "Response Templates Data"
  }
}

resource "aws_s3_object" "sentiment_analysis_data" {
  bucket = aws_s3_bucket.synthetic_data.id
  key    = "sentiment_analysis.json"
  source = "${path.module}/../sample_data/sentiment_analysis.json"
  etag   = filemd5("${path.module}/../sample_data/sentiment_analysis.json")

  tags = {
    Name = "Sentiment Analysis Data"
  }
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "Fed Communications Lambda Role"
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM policy for Lambda functions
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.synthetic_data.arn,
          "${aws_s3_bucket.synthetic_data.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "comprehend:DetectSentiment",
          "comprehend:DetectEntities",
          "comprehend:DetectKeyPhrases",
          "comprehend:ClassifyDocument",
          "comprehend:DetectDominantLanguage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream"
        ]
        Resource = [
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
          "arn:aws:bedrock:*::foundation-model/amazon.titan-text-express-v1"
        ]
      }
    ]
  })
}

# API Gateway
resource "aws_api_gateway_rest_api" "fed_communications_api" {
  name        = "${var.project_name}-api-${var.environment}"
  description = "API for Federal Reserve Communications AI"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "Fed Communications API"
    Environment = var.environment
    Project     = var.project_name
  }
}

# API Gateway CORS configuration for root
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method = aws_api_gateway_method.options_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "options_response" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "frontend_logs" {
  name              = "/aws/lambda/${var.project_name}-frontend-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "Fed Communications Frontend Logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/aws/lambda/${var.project_name}-backend-${var.environment}"
  retention_in_days = 7

  tags = {
    Name        = "Fed Communications Backend Logs"
    Environment = var.environment
    Project     = var.project_name
  }
}


