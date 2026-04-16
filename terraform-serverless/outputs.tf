
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

output "s3_data_bucket" {
  description = "S3 bucket storing synthetic data"
  value = aws_s3_bucket.synthetic_data.bucket
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
