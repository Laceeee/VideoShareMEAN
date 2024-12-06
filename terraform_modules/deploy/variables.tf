# modules/nodejs-app/docker/variables.tf
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "prf-project"
}

variable "container_name" {
  description = "Container name"
  type        = string
  default     = "deploy-container"
}

variable "angular_port" {
  description = "Angular port"
  type        = number
  default     = 4200
}

variable "ssh_port" {
  description = "SSH port"
  type        = number
  default     = 22
}

variable "server_port" {
  description = "Server port"
  type        = number
  default     = 5000
}

variable "zabbix_port" {
  description = "pm2 port"
  type        = number
  default     = 10050
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}
