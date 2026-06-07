terraform {
  backend "s3" {
    bucket         = "pulseboard-terraform-state-425281906859"
    key            = "pulseboard/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "pulseboard-terraform-locks"
    encrypt        = true
  }
}
