# VideoShareMEAN - DevOps Edition

This is a video sharing platform project written in the MEAN stack with DevOps elements created for the Cloud and DevOps Basics course.\
Used tools: Terraform, Jenkins, Prometheus, Grafana, Zabbix

## Requirements

Docker

## Setup

After cloning the project and switching to the feature/devops_terraform branch

### Create path variable for terraform (For Windows)

Create a terraform.bat file somewhere on your computer.\
Copy this code in there:\
\
@echo off\
cd /d path_to_repository\VideoShareMEAN\
docker run -it --rm -v "%cd%:/workspace" -v /var/run/docker.sock:/var/run/docker.sock -w /workspace hashicorp/terraform:light %*\
\
Add the path to the terraform.bat file to Environment path variables.\
\
To check if it works, open a new cmd or powershell and use "terraform" command

### SSH key and jenkins_home

Navigate to repository folder\
In repository folder make two new folders: keys, jenkins_home\
\
Generate ssh key (no passphrase needed):\
ssh-keygen -t rsa -b 4096 -f path_to_keys_folder/keys/jenkins_deploy_key

### Change absolute path

There is one absolute path that needs to be changed.\
Navigate to terraform_modules/jenkins\
In main.tf in volumes host path, change that to the absolute path to the jenkins_home folder you created.\

### Start containers

Navigate to repository folder and give command:\
\
terraform init\
terraform apply (yes)\

### Jenkins setup

In your browser navigate to localhost:8080.\
In find initial password in docker logs or exec into container.\
Select "Select plugins to install". Plugins required: SSH Agent, Git, NodeJS, Pipeline (Extra: Locale)\
Setup user.\
Leave Jenkins URL.\
\
Setup NodeJS:\
Dashboard - Manage Jenkins - Tools - Add NodeJS\
Name: NodeJS 20\
Version: 20.12.2\
Save\
\
Add private SSH key:\
Dashboard - Manage Jenkins - Credentials - System - Global credentials - Add Credentials\
Kind: SSH\
ID: jenkins-deploy-key\
Description: jenkins-deploy-key\
Username: deploy\
Private key - Enter directly: Copy private SSH key here\
Save\
\
Pipeline:\
Dashboard - New Item - Pipeline (give some name) - Save\
Pipeline:\
Definition: Pipeline script from SCM\
SCM: Git\
Repository URL: https://github.com/Laceeee/VideoShareMEAN.git\
Branch: feature/devops_terraform\
Save\
\
Build the pipeline to start deployment on prf-project-deploy-env "server"\

### Prometheus

Wait for Jenkins pipeline to run. You can start using Prometheus on localhost:9090.\

### Grafana

Wait for Jenkins pipeline to run. You can start using Grafana on localhost:4000.\
Username: admin\
Password: admin\
Add new Password.\
Connections - Data sources - Add data source - Prometheus\
Connection: http://172.32.0.6:9090\
Save & test\
\
Dashboards - Create dashboard - Add visualization - prometheus\
Now you can start making queries.\

### Zabbix

You can start using Grafana on localhost:8085.\
Username: Admin\
Password: zabbix\
Monitoring - Hosts - Create host\
Host name: prf-project-deploy-env\
Templates: Select - Templates/Operating systems - Linux by Zabbix agent\
Host groups: Select - Linux servers\
Interfaces: Add - Agent\
    IP address: 172.32.0.3\
Add

### The main app

The main app still works flawlessly after Jenkins pipeline build under localhost:4200.\
Users for here can be found in db_dump - Users.txt
