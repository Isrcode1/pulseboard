terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region
}

# ── VPC ──────────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project}-vpc-${var.environment}"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ── INTERNET GATEWAY ─────────────────────────────────────
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name      = "${var.project}-igw-${var.environment}"
    Project   = var.project
    ManagedBy = "terraform"
  }
}

# ── PUBLIC SUBNET ────────────────────────────────────────
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name      = "${var.project}-subnet-public-${var.environment}"
    Project   = var.project
    ManagedBy = "terraform"
  }
}

# ── ROUTE TABLE ──────────────────────────────────────────
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name      = "${var.project}-rt-public-${var.environment}"
    Project   = var.project
    ManagedBy = "terraform"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ── SECURITY GROUP ───────────────────────────────────────
resource "aws_security_group" "pulseboard" {
  name        = "${var.project}-sg-${var.environment}"
  description = "PulseBoard security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
    from_port   = 2200
    to_port     = 2200
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
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
    Name      = "${var.project}-sg-${var.environment}"
    Project   = var.project
    ManagedBy = "terraform"
  }
}

# ── KEY PAIR ─────────────────────────────────────────────
resource "aws_key_pair" "pulseboard" {
  key_name   = "${var.project}-key-${var.environment}"
  public_key = file(var.ssh_public_key_path)

  tags = {
    Project   = var.project
    ManagedBy = "terraform"
  }
}

# ── EC2 INSTANCE ─────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_instance" "pulseboard" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.pulseboard.id]
  key_name               = aws_key_pair.pulseboard.key_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name        = "${var.project}-server-${var.environment}"
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
