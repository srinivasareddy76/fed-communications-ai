


# Lambda Functions Configuration for Federal Reserve Communications AI

# Frontend Lambda Function (serves the website)
resource "aws_lambda_function" "frontend" {
  filename         = "frontend.zip"
  function_name    = "${var.project_name}-frontend-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512

  depends_on = [data.archive_file.frontend_zip]

  environment {
    variables = {
      API_GATEWAY_URL = aws_api_gateway_rest_api.fed_communications_api.execution_arn
      ENVIRONMENT     = var.environment
      PROJECT_NAME    = var.project_name
    }
  }

  tags = {
    Name        = "Fed Communications Frontend"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Backend Lambda Function (API endpoints)
resource "aws_lambda_function" "backend" {
  filename         = "backend.zip"
  function_name    = "${var.project_name}-backend-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  memory_size     = 512

  depends_on = [data.archive_file.backend_zip]

  environment {
    variables = {
      DYNAMODB_INQUIRIES_TABLE = aws_dynamodb_table.inquiries.name
      DYNAMODB_TEMPLATES_TABLE = aws_dynamodb_table.response_templates.name
      DYNAMODB_ANALYTICS_TABLE = aws_dynamodb_table.analytics.name
      AWS_REGION              = var.aws_region
      ENVIRONMENT             = var.environment
    }
  }

  tags = {
    Name        = "Fed Communications Backend"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Archive files for Lambda deployment
data "archive_file" "frontend_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/frontend"
  output_path = "${path.module}/frontend.zip"
}

data "archive_file" "backend_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/backend"
  output_path = "${path.module}/backend.zip"
}

# API Gateway resources and methods

# /api resource
resource "aws_api_gateway_resource" "api" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  path_part   = "api"
}

# /api/inquiries resource
resource "aws_api_gateway_resource" "inquiries" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "inquiries"
}

# /api/inquiries/{id} resource
resource "aws_api_gateway_resource" "inquiry_by_id" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_resource.inquiries.id
  path_part   = "{id}"
}

# /api/analytics resource
resource "aws_api_gateway_resource" "analytics" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "analytics"
}

# /api/dashboard resource
resource "aws_api_gateway_resource" "dashboard" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_resource.api.id
  path_part   = "dashboard"
}

# /api/dashboard/analytics resource
resource "aws_api_gateway_resource" "dashboard_analytics" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  parent_id   = aws_api_gateway_resource.dashboard.id
  path_part   = "analytics"
}

# GET / - Frontend (main website)
resource "aws_api_gateway_method" "frontend_method" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "frontend_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_rest_api.fed_communications_api.root_resource_id
  http_method = aws_api_gateway_method.frontend_method.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.frontend.invoke_arn
}

# GET /api/inquiries - List all inquiries
resource "aws_api_gateway_method" "get_inquiries" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.inquiries.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_inquiries_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiries.id
  http_method = aws_api_gateway_method.get_inquiries.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.backend.invoke_arn
}

# POST /api/inquiries - Create a new inquiry
resource "aws_api_gateway_method" "post_inquiries" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.inquiries.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_inquiries_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiries.id
  http_method = aws_api_gateway_method.post_inquiries.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.backend.invoke_arn
}

# GET /api/inquiries/{id} - Get specific inquiry
resource "aws_api_gateway_method" "get_inquiry_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.inquiry_by_id.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_inquiry_by_id_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiry_by_id.id
  http_method = aws_api_gateway_method.get_inquiry_by_id.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.backend.invoke_arn
}

# PUT /api/inquiries/{id} - Update inquiry
resource "aws_api_gateway_method" "put_inquiry_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.inquiry_by_id.id
  http_method   = "PUT"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "put_inquiry_by_id_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiry_by_id.id
  http_method = aws_api_gateway_method.put_inquiry_by_id.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.backend.invoke_arn
}

# GET /api/dashboard/analytics - Get dashboard analytics
resource "aws_api_gateway_method" "get_analytics" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.dashboard_analytics.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_analytics_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.dashboard_analytics.id
  http_method = aws_api_gateway_method.get_analytics.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.backend.invoke_arn
}

# CORS for /api/inquiries
resource "aws_api_gateway_method" "inquiries_options" {
  rest_api_id   = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id   = aws_api_gateway_resource.inquiries.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "inquiries_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiries.id
  http_method = aws_api_gateway_method.inquiries_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "inquiries_options_response" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiries.id
  http_method = aws_api_gateway_method.inquiries_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "inquiries_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  resource_id = aws_api_gateway_resource.inquiries.id
  http_method = aws_api_gateway_method.inquiries_options.http_method
  status_code = aws_api_gateway_method_response.inquiries_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "frontend_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.frontend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.fed_communications_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "backend_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.fed_communications_api.execution_arn}/*/*"
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "fed_communications_deployment" {
  depends_on = [
    aws_api_gateway_method.frontend_method,
    aws_api_gateway_integration.frontend_integration,
    aws_api_gateway_method.get_inquiries,
    aws_api_gateway_integration.get_inquiries_integration,
    aws_api_gateway_method.post_inquiries,
    aws_api_gateway_integration.post_inquiries_integration,
    aws_api_gateway_method.get_analytics,
    aws_api_gateway_integration.get_analytics_integration,
    aws_api_gateway_method.inquiries_options,
    aws_api_gateway_integration.inquiries_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.fed_communications_api.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}


