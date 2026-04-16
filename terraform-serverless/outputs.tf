
# Output the API Gateway URL for accessing the application
output "application_url" {
  description = "URL to access the Federal Reserve Communications AI application"
  value       = "https://${aws_api_gateway_rest_api.fed_communications_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.fed_communications_api.id
}

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = "https://${aws_api_gateway_rest_api.fed_communications_api.id}.execute-api.${var.aws_region}.amazonaws.com/${var.environment}"
}

output "dynamodb_tables" {
  description = "DynamoDB table names"
  value = {
    inquiries         = aws_dynamodb_table.inquiries.name
    response_templates = aws_dynamodb_table.response_templates.name
    analytics         = aws_dynamodb_table.analytics.name
    sentiment_analysis = aws_dynamodb_table.sentiment_analysis.name
    trending_topics   = aws_dynamodb_table.trending_topics.name
  }
}

output "lambda_functions" {
  description = "Lambda function names"
  value = {
    frontend = aws_lambda_function.frontend.function_name
    backend  = aws_lambda_function.backend.function_name
  }
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    environment = var.environment
    region     = var.aws_region
    timestamp  = timestamp()
  }
}
