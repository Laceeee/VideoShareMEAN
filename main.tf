terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.0"
    }
  }
}

resource "docker_network" "app_network" {
  name = "${var.project_name}-network"
  driver = "bridge"
  ipam_config {
    subnet = "172.32.0.0/16"
    gateway = "172.32.0.1"
  }
  internal = false
}

module "deploy" {
  source = "./terraform_modules/deploy"
  
  container_name = "${var.project_name}-deploy-env"
}

module "jenkins" {
  source = "./terraform_modules/jenkins"
  
  container_name = "${var.project_name}-jenkins"
}

module "mongo" {
  source = "./terraform_modules/mongo"
  
  container_name = "${var.project_name}-mongodb"
}

output "network_info" {
  value = {
    network_id   = docker_network.app_network.id
    network_name = docker_network.app_network.name
  }
}