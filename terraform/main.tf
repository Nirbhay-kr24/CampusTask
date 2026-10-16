terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

variable "aws_region" {
  description = "AWS region for the infrastructure"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "campustask"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for the two public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for the subnets"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes"
  type        = string
  default     = "t3.micro"
}

variable "desired_capacity" {
  description = "Desired number of EKS worker nodes"
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum number of EKS worker nodes"
  type        = number
  default     = 3
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "campustask" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "campustask-vpc"
    Environment = "capstone"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "campustask" {
  vpc_id = aws_vpc.campustask.id

  tags = {
    Name = "campustask-igw"
  }
}

# Two public subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.campustask.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                               = "campustask-public-subnet-${count.index + 1}"
    Environment                        = "capstone"
    Tier                               = "public"
    "kubernetes.io/role/elb"           = "1"
    "kubernetes.io/cluster/campustask" = "shared"
  }
}

# Public route table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.campustask.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.campustask.id
  }

  tags = {
    Name = "campustask-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# EKS cluster
resource "aws_eks_cluster" "campustask" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn
  version  = "1.35"

  vpc_config {
    subnet_ids              = aws_subnet.public[*].id
    endpoint_private_access = false
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster
  ]

  tags = {
    Environment = "capstone"
  }
}

# EKS worker node group
resource "aws_eks_node_group" "campustask" {
  cluster_name    = aws_eks_cluster.campustask.name
  node_group_name = "campustask-workers"
  node_role_arn   = aws_iam_role.node.arn
  subnet_ids      = aws_subnet.public[*].id
  instance_types  = [var.node_instance_type]

  scaling_config {
    desired_size = var.desired_capacity
    max_size     = var.max_capacity
    min_size     = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.node-worker,
    aws_iam_role_policy_attachment.node-cni,
    aws_iam_role_policy_attachment.node-registry
  ]

  tags = {
    Environment = "capstone"
  }
}

# IAM role for EKS control plane
resource "aws_iam_role" "cluster" {
  name = "campustask-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

# IAM role for worker nodes
resource "aws_iam_role" "node" {
  name = "campustask-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "node-worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node-cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node-registry" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node.name
}

# Outputs
output "vpc_id" {
  description = "ID of the CampusTask VPC"
  value       = aws_vpc.campustask.id
}

output "cluster_name" {
  description = "Name of the EKS cluster"
  value       = aws_eks_cluster.campustask.name
}

output "cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = aws_eks_cluster.campustask.endpoint
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "node_group_name" {
  description = "Name of the EKS worker node group"
  value       = aws_eks_node_group.campustask.node_group_name
}
