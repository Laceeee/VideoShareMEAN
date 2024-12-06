# modules/zabbix/variables.tf
variable "network" {
  description = "Docker network name"
  type        = string
}

variable "zabbix_mysql_password" {
  description = "Password for Zabbix MySQL user"
  type        = string
  default     = "zabbix_pwd"
}

variable "mysql_root_password" {
  description = "Root password for MySQL"
  type        = string
  default     = "root_pwd"
}