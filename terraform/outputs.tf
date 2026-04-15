

# Outputs for Federal Reserve Communications AI Terraform Deployment

output "application_url" {
  description = "URL of the deployed application"
  value       = "http://${aws_lb.fed_communications_alb.dns_name}"
}

output "load_balancer_dns" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.fed_communications_alb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.fed_communications_alb.zone_id
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.fed_communications_repo.repository_url
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.fed_communications_cluster.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.fed_communications_service.name
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.fed_communications_vpc.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public_subnets[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private_subnets[*].id
}

output "security_group_alb_id" {
  description = "ID of the ALB security group"
  value       = aws_security_group.alb_sg.id
}

output "security_group_ecs_id" {
  description = "ID of the ECS security group"
  value       = aws_security_group.ecs_sg.id
}

output "cloudwatch_log_group_name" {
  description = "Name of the CloudWatch log group"
  value       = aws_cloudwatch_log_group.fed_communications_logs.name
}

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "nat_gateway_ip" {
  description = "Public IP of the NAT Gateway (if enabled)"
  value       = var.enable_nat_gateway ? aws_eip.nat_eip[0].public_ip : null
}

output "aws_region" {
  description = "AWS region used for deployment"
  value       = var.aws_region
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}


