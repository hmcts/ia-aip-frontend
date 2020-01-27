variable "product" {
  type = "string"
}

variable "raw_product" {
  default = "ia"
  // jenkins-library overrides product for PRs and adds e.g. pr-123-ia
}

variable "component" {
  type = "string"
}

variable "location" {
  type    = "string"
  default = "UK South"
}

variable "env" {
  type = "string"
}

variable "infrastructure_env" {
  default     = "dev"
  description = "Infrastructure environment to point to"
}

variable "subscription" {
  type = "string"
}

variable "ilbIp" {}

variable "common_tags" {
  type = "map"
}

variable "capacity" {
  default = "1"
}

variable "instance_size" {
  default = "I1"
}

variable "additional_hostname" {
  default = "ia-apfr.sandbox.platform.hmcts.net"
}

variable "idam_url" {
  description = "Url of the idam api"
  type = "string"
}

variable "idam_web_url" {
  description = "Url of the idam login pages"
  type = "string"
}

variable "ccd_api_url" {
  description = "Url of the ccd api"
  type = "string"
}

variable "s2s_microservice_name" {
  description = "microservice name for s2s"
  type = "string"
}

variable "s2s_url" {
  description = "Url of the s2s api"
  type = "string"
}

variable "ia_aip_frontend_external_cert_name" {
  description = "SSL Certificate name"
}

variable "external_cert_vault_uri" {
  description = "url of the certificate vault"
}
