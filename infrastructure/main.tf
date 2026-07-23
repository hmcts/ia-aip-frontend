provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

locals {
  key_vault_name = "${var.product}-${var.env}"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.product}-${var.component}-${var.env}"
  location = var.location
  tags     = merge(var.common_tags, tomap({ "lastUpdated" = "${timestamp()}" }))
}

data "azurerm_key_vault" "ia_key_vault" {
  name                = local.key_vault_name
  resource_group_name = local.key_vault_name
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name  = "core-infra-${var.env}"
}

module "redis-cache" {
  source                        = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product                       = var.product
  location                      = var.location
  env                           = var.env
  private_endpoint_enabled      = true
  redis_version                 = "6"
  business_area                 = "cft" # cft or sds
  public_network_access_enabled = false
  common_tags                   = var.common_tags
  sku_name                      = var.sku_name
  family                        = var.family
  capacity                      = var.capacity
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "${var.product}-redis-access-key"
  value        = module.redis-cache.access_key
  key_vault_id = data.azurerm_key_vault.ia_key_vault.id
}

resource "azurerm_key_vault_secret" "redis_connection_string" {
  name         = "${var.product}-redis-connection-string"
  value        = "redis://${urlencode(module.redis-cache.access_key)}@${module.redis-cache.host_name}:${module.redis-cache.redis_port}?tls=true"
  key_vault_id = data.azurerm_key_vault.ia_key_vault.id
}

module "redis_cache_managed_redis" {
  # foreach conditional allows selective deployment to desired environments
  for_each = toset(contains(["sandbox", "aat", "ithc", "perftest"], var.env) ? [var.env] : [])
  source   = "git@github.com:hmcts/terraform-module-azure-managed-redis?ref=main"

  product     = var.product
  component   = var.component
  env         = var.env
  location    = var.location
  common_tags = var.common_tags

  # Performance:
  sku_name = var.managed_redis_sku

  # Networking:
  public_network_access   = "Disabled"
  create_private_endpoint = true
  subnet_id               = data.azurerm_subnet.core_infra_redis_subnet.id
  private_dns_zone_ids    = ["/subscriptions/${var.private_dns_subscription_id}/resourceGroups/core-infra-intsvc-rg/providers/Microsoft.Network/privateDnsZones/privatelink.redis.azure.net"]

  access_keys_authentication_enabled = true

  # Backup (persistence) options:
  persistence_rdb_backup_frequency = "6h"
  # other available options (https://learn.microsoft.com/en-gb/azure/redis/how-to-persistence`):
  ## persistence_aof_backup_frequency
  ## geo_replication_group_name
}

# Create a new secret for the new managed redis instance, this allows for ease of rollback via Flux
resource "azurerm_key_vault_secret" "managed_redis_connection_string" {
  name         = "managed-redis-connection-string"
  value        = "rediss://:${urlencode(module.redis_cache_managed_redis.access_key)}@${module.redis_cache_managed_redis.host_name}:${module.redis_cache_managed_redis.redis_port}?tls=true"
  key_vault_id = data.azurerm_key_vault.ia_key_vault.id
}
