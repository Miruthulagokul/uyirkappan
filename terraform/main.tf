# ─────────────────────────────────────────────────────────────────────────────
# Uyirkappan — Terraform Infrastructure (Azure)
# Deploys frontend + backend as containers on Azure Container Apps
# Optimized for Azure for Students ($100 free credits)
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Uncomment to use Azure Blob Storage for remote state
  # backend "azurerm" {
  #   resource_group_name  = "uyirkappan-tfstate-rg"
  #   storage_account_name = "uyirkappantfstate"
  #   container_name       = "tfstate"
  #   key                  = "prod.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}

  # Azure Student subscriptions use this
  # subscription_id = var.subscription_id
}
