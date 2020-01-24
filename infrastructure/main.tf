provider "azurerm" {
  version = "1.41.0"
}

locals {

  preview_app_service_plan        = "${var.product}-${var.component}-${var.env}"
  non_preview_app_service_plan    = "${var.product}-${var.env}"
  app_service_plan                = "${var.env == "preview" || var.env == "spreview" ? local.preview_app_service_plan : local.non_preview_app_service_plan}"

  preview_vault_name              = "${var.raw_product}-aat"
  non_preview_vault_name          = "${var.raw_product}-${var.env}"
  key_vault_name                  = "${var.env == "preview" || var.env == "spreview" ? local.preview_vault_name : local.non_preview_vault_name}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = "${var.location}"
  tags     = "${merge(var.common_tags, map("lastUpdated", "${timestamp()}"))}"
}

data "azurerm_key_vault" "ia_key_vault" {
  name                = "${local.key_vault_name}"
  resource_group_name = "${local.key_vault_name}"
}

data "azurerm_key_vault_secret" "idam-secret" {
  name      = "idam-secret"
  vault_uri = "${data.azurerm_key_vault.ia_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "addressLookupToken" {
  name      = "addressLookupToken"
  vault_uri = "${data.azurerm_key_vault.ia_key_vault.vault_uri}"
}

data "azurerm_key_vault_secret" "s2s_secret" {
  name      = "sscs-s2s-secret"
  vault_uri = "${data.azurerm_key_vault.ia_key_vault.vault_uri}"
}


module "ia_aip_frontend" {
  source               = "git@github.com:hmcts/cnp-module-webapp?ref=master"
  product              = "${var.product}-${var.component}"
  location             = "${var.location}"
  env                  = "${var.env}"
  ilbIp                = "${var.ilbIp}"
  resource_group_name  = "${azurerm_resource_group.rg.name}"
  is_frontend          = true
  subscription         = "${var.subscription}"
  additional_host_name = "${var.env != "preview" ? var.additional_hostname : "null"}"
  https_only           = "${var.env != "preview" ? "true" : "true"}"
  capacity             = "${var.capacity}"
  instance_size        = "${var.instance_size}"
  common_tags          = "${merge(var.common_tags, map("lastUpdated", "${timestamp()}"))}"
  asp_name             = "${local.app_service_plan}"
  asp_rg               = "${local.app_service_plan}"

  app_settings = {
    WEBSITE_NODE_DEFAULT_VERSION = "10.14.1"
    NODE_ENV                     = "${var.infrastructure_env}"

    REDIS_URL                    = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
    SESSION_SECRET               = "${module.redis-cache.access_key}"

    IDAM_API_URL                 = "${var.idam_url}"
    IDAM_WEB_URL                 = "${var.idam_web_url}"
    IDAM_SECRET                  = "${data.azurerm_key_vault_secret.idam-secret.value}"

    CCD_API_URL                  = "${var.ccd_api_url}"
    ADDRESS_LOOKUP_TOKEN         = "${data.azurerm_key_vault_secret.addressLookupToken.value}"

    S2S_MICROSERVICE_NAME        = "${var.s2s_microservice_name}"
    S2S_URL                      = "${var.s2s_url}"
    S2S_SECRET                   = "${data.azurerm_key_vault_secret.s2s_secret.value}"
  }
}

module "redis-cache" {
  source      = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product     = "${var.product}-redis"
  location    = "${var.location}"
  env         = "${var.env}"
  subnetid    = "${data.terraform_remote_state.core_apps_infrastructure.subnet_ids[1]}"
  common_tags = "${var.common_tags}"
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "${var.product}-redis-access-key"
  value        = "${module.redis-cache.access_key}"
  key_vault_id = "${data.azurerm_key_vault.ia_key_vault.id}"
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "${var.product}-redis-connection-string"
  value        = "redis://ignore:${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
  key_vault_id = "${data.azurerm_key_vault.ia_key_vault.id}"
}
