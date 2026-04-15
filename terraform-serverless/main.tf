

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
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem"
        ]
        Resource = [
          aws_dynamodb_table.inquiries.arn,
          "${aws_dynamodb_table.inquiries.arn}/index/*",
          aws_dynamodb_table.response_templates.arn,
          "${aws_dynamodb_table.response_templates.arn}/index/*",
          aws_dynamodb_table.analytics.arn,
          "${aws_dynamodb_table.analytics.arn}/index/*"
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


