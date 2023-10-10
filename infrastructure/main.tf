provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

locals {
  key_vault_name                  = "${var.product}-${var.env}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = var.location
  tags     = merge(var.common_tags, tomap({"lastUpdated" = "${timestamp()}"}))
}

data "azurerm_key_vault" "ia_key_vault" {
  name                = "${local.key_vault_name}"
  resource_group_name = "${local.key_vault_name}"
}

module "redis-cache" {
  source      = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product     = "${var.product}"
  location    = var.location
  env         = var.env
  private_endpoint_enabled = true
  redis_version = "6"
  business_area = "cft" # cft or sds
  public_network_access_enabled = false
  common_tags = var.common_tags
  sku_name                      = var.sku_name
family                        = var.family
capacity                      = var.capacity

}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "${var.product}-redis-access-key"
  value        = "${module.redis-cache.access_key}"
  key_vault_id = "${data.azurerm_key_vault.ia_key_vault.id}"
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "${var.product}-redis-connection-string"
  value        = "redis://${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
  key_vault_id = "${data.azurerm_key_vault.ia_key_vault.id}"
}
