# modules/nodejs-app/docker/main.tf
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
  }
}

resource "docker_image" "mongodb" {
  name = "mongodb:latest"
  build {
    context    = "."
    dockerfile = "Dockerfile_mongo"
    tag        = ["mongodb:latest"]
    no_cache   = true
  }
}

resource "docker_container" "mongodb" {
  name  = "${var.container_name}"
  hostname = "${var.container_name}"
  image = docker_image.mongodb.image_id
  
  # Port mapping
  ports {
    internal = var.mongo_port
    external = var.mongo_port
  }
  
  # Hálózat csatlakozás
  networks_advanced {
    name = "${var.project_name}-network"
    ipv4_address = "172.32.0.4"
  }
}

# Output a container_name használatához
output "container_name" {
  value = var.container_name
}