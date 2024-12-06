# modules/nodejs-app/docker/main.tf
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
  }
}

resource "docker_image" "deploy-env" {
  name = "deploy-env:latest"
  build {
    context    = "."
    dockerfile = "Dockerfile_deploy-env"
    tag        = ["deploy-env:latest"]
    no_cache   = true
  }
}

resource "docker_container" "deploy-env" {
  name  = "${var.container_name}"
  hostname = "${var.container_name}"
  image = docker_image.deploy-env.image_id
  
  # Port mapping
  ports {
    internal = var.angular_port
    external = var.angular_port
  }

  ports {
    internal = var.ssh_port
    external = 2222
  }

  ports {
    internal = var.server_port
    external = var.server_port
  }

  ports {
    internal = var.zabbix_port
    external = var.zabbix_port
  }
  
  # Hálózat csatlakozás
  networks_advanced {
    name = "${var.project_name}-network"
    ipv4_address = "172.32.0.3"
  }
}

# Output a container_name használatához
output "container_name" {
  value = var.container_name
}