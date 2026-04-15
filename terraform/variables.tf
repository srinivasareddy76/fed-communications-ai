
# Variables for Federal Reserve Communications AI Terraform Deployment

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "fed-communications-ai"
}

variable "task_cpu" {
  description = "CPU units for ECS task (256, 512, 1024, 2048, 4096)"
  type        = string
  default     = "512"
}

variable "task_memory" {
  description = "Memory for ECS task (512, 1024, 2048, 4096, 8192)"
  type        = string
  default     = "1024"
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 2
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway for private subnets (costs extra)"
  type        = bool
  default     = true
}

variable "container_port" {
  description = "Port the container listens on"
  type        = number
  default     = 53788
}

variable "health_check_path" {
  description = "Health check path for load balancer"
  type        = string
  default     = "/"
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 7
}

variable "enable_container_insights" {
  description = "Enable CloudWatch Container Insights"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default = {
    Project     = "fed-communications-ai"
    Owner       = "federal-reserve"
    Environment = "production"
  }
}

