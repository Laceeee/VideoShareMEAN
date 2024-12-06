# modules/nodejs-app/docker/variables.tf
variable "project_name" {
  description = "Project name"
  type        = string
  default     = "prf-project"
}

variable "container_name" {
  description = "Container name"
  type        = string
  default     = "mongo-container"
}

variable "mongo_port" {
  description = "Port"
  type        = number
  default     = 27017
}

variable "image_tag" {
  description = "Docker Image Tag"
  type        = string
  default     = "latest"
}
