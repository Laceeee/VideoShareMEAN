# modules/nodejs-app/docker/main.tf
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
  }
}

resource "docker_image" "jenkins" {
  name = "jenkins:latest"
  build {
    context    = "."
    dockerfile = "Dockerfile_jenkins"
    tag        = ["jenkins:latest"]
    no_cache   = true
  }
}

resource "docker_container" "jenkins" {
  name  = "${var.container_name}"
  hostname = "${var.container_name}"
  image = docker_image.jenkins.image_id
  
  # Port mapping
  ports {
    internal = var.jenkins_port
    external = var.jenkins_port
  }

  ports {
    internal = var.extra_port
    external = var.extra_port
  }

  # Change jenkins_home route
  volumes {
    host_path      = "C:/Users/aprol/Desktop/Uni/3_felev/felho/VideoShareMEAN/jenkins_home"
    container_path = "/var/jenkins_home"
  }
  
  # Hálózat csatlakozás
  networks_advanced {
    name = "${var.project_name}-network"
    ipv4_address = "172.32.0.2"
  }
}

# Output a container_name használatához
output "container_name" {
  value = var.container_name
}