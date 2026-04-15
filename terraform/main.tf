# Federal Reserve Communications AI - Terraform Deployment
# This script deploys the application to AWS using ECS Fargate

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider
provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# VPC Configuration
resource "aws_vpc" "fed_communications_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "fed-communications-vpc"
    Environment = var.environment
    Project     = "fed-communications-ai"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "fed_communications_igw" {
  vpc_id = aws_vpc.fed_communications_vpc.id

  tags = {
    Name        = "fed-communications-igw"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public_subnets" {
  count             = 2
  vpc_id            = aws_vpc.fed_communications_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "fed-communications-public-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Private Subnets
resource "aws_subnet" "private_subnets" {
  count             = 2
  vpc_id            = aws_vpc.fed_communications_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name        = "fed-communications-private-subnet-${count.index + 1}"
    Environment = var.environment
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.fed_communications_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.fed_communications_igw.id
  }

  tags = {
    Name        = "fed-communications-public-rt"
    Environment = var.environment
  }
}

# Route Table Associations
resource "aws_route_table_association" "public_rta" {
  count          = length(aws_subnet.public_subnets)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group for ALB
resource "aws_security_group" "alb_sg" {
  name_prefix = "fed-communications-alb-"
  vpc_id      = aws_vpc.fed_communications_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "fed-communications-alb-sg"
    Environment = var.environment
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_sg" {
  name_prefix = "fed-communications-ecs-"
  vpc_id      = aws_vpc.fed_communications_vpc.id

  ingress {
    from_port       = 53788
    to_port         = 53788
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "fed-communications-ecs-sg"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "fed_communications_alb" {
  name               = "fed-communications-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public_subnets[*].id

  enable_deletion_protection = false

  tags = {
    Name        = "fed-communications-alb"
    Environment = var.environment
  }
}

# Target Group
resource "aws_lb_target_group" "fed_communications_tg" {
  name        = "fed-communications-tg"
  port        = 53788
  protocol    = "HTTP"
  vpc_id      = aws_vpc.fed_communications_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "fed-communications-tg"
    Environment = var.environment
  }
}

# ALB Listener
resource "aws_lb_listener" "fed_communications_listener" {
  load_balancer_arn = aws_lb.fed_communications_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fed_communications_tg.arn
  }
}

# ECR Repository
resource "aws_ecr_repository" "fed_communications_repo" {
  name                 = "fed-communications-ai"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "fed-communications-ai"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "fed_communications_cluster" {
  name = "fed-communications-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "fed-communications-cluster"
    Environment = var.environment
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "fed_communications_task" {
  family                   = "fed-communications-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "fed-communications-app"
      image = "${aws_ecr_repository.fed_communications_repo.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 53788
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = var.environment
        },
        {
          name  = "PORT"
          value = "53788"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.fed_communications_logs.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      essential = true
    }
  ])

  tags = {
    Name        = "fed-communications-task"
    Environment = var.environment
  }
}

# ECS Service
resource "aws_ecs_service" "fed_communications_service" {
  name            = "fed-communications-service"
  cluster         = aws_ecs_cluster.fed_communications_cluster.id
  task_definition = aws_ecs_task_definition.fed_communications_task.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_sg.id]
    subnets          = aws_subnet.private_subnets[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.fed_communications_tg.arn
    container_name   = "fed-communications-app"
    container_port   = 53788
  }

  depends_on = [aws_lb_listener.fed_communications_listener]

  tags = {
    Name        = "fed-communications-service"
    Environment = var.environment
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "fed_communications_logs" {
  name              = "/ecs/fed-communications-ai"
  retention_in_days = 7

  tags = {
    Name        = "fed-communications-logs"
    Environment = var.environment
  }
}

# IAM Role for ECS Execution
resource "aws_iam_role" "ecs_execution_role" {
  name = "fed-communications-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "fed-communications-ecs-execution-role"
    Environment = var.environment
  }
}

# IAM Role Policy Attachment for ECS Execution
resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# IAM Role for ECS Task
resource "aws_iam_role" "ecs_task_role" {
  name = "fed-communications-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "fed-communications-ecs-task-role"
    Environment = var.environment
  }
}

# NAT Gateway for private subnets (optional - for outbound internet access)
resource "aws_eip" "nat_eip" {
  count  = var.enable_nat_gateway ? 1 : 0
  domain = "vpc"

  tags = {
    Name        = "fed-communications-nat-eip"
    Environment = var.environment
  }
}

resource "aws_nat_gateway" "nat_gw" {
  count         = var.enable_nat_gateway ? 1 : 0
  allocation_id = aws_eip.nat_eip[0].id
  subnet_id     = aws_subnet.public_subnets[0].id

  tags = {
    Name        = "fed-communications-nat-gw"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.fed_communications_igw]
}

# Route table for private subnets
resource "aws_route_table" "private_rt" {
  count  = var.enable_nat_gateway ? 1 : 0
  vpc_id = aws_vpc.fed_communications_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw[0].id
  }

  tags = {
    Name        = "fed-communications-private-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "private_rta" {
  count          = var.enable_nat_gateway ? length(aws_subnet.private_subnets) : 0
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rt[0].id
}
