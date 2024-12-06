# modules/nodejs-app/docker/variables.tf
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "prf-project"
}

variable "container_name" {
  description = "Container name"
  type        = string
  default     = "jenkins-container"
}

variable "jenkins_port" {
  description = "Port"
  type        = number
  default     = 8080
}

variable "extra_port" {
  description = "Port"
  type        = number
  default     = 50000
}

variable "image_tag" {
  description = "Docker Image Tag"
  type        = string
  default     = "latest"
}
