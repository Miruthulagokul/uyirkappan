# ─────────────────────────────────────────────────────────────────────────────
# Azure Container Registry (ACR)
# Stores Docker images for frontend and backend
# ─────────────────────────────────────────────────────────────────────────────

resource "azurerm_container_registry" "main" {
  name                = replace("${var.project_name}${var.environment}acr", "-", "")
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true # Required for Container Apps to pull images

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
