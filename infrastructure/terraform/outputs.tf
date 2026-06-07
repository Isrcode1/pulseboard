output "instance_public_ip" {
  description = "Public IP of PulseBoard server"
  value       = aws_instance.pulseboard.public_ip
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "Public subnet ID"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.pulseboard.id
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.pulseboard.id
}
