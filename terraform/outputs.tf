# ─────────────────────────────────────────────────────────────────────────────
# Outputs
# ─────────────────────────────────────────────────────────────────────────────

# ── URLs ──────────────────────────────────────────────────────────────────────

output "frontend_url" {
  description = "Frontend application URL"
  value       = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "api_health_url" {
  description = "Backend health check URL"
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}/api/health"
}

# ── Container Registry ───────────────────────────────────────────────────────

output "acr_login_server" {
  description = "Azure Container Registry login server"
  value       = azurerm_container_registry.main.login_server
}

output "acr_admin_username" {
  description = "ACR admin username"
  value       = azurerm_container_registry.main.admin_username
}

# ── Resource Group ────────────────────────────────────────────────────────────

output "resource_group_name" {
  description = "Resource group name"
  value       = azurerm_resource_group.main.name
}

# ── Deploy Commands ───────────────────────────────────────────────────────────

output "docker_push_commands" {
  description = "Commands to build and push Docker images to ACR"
  value       = <<-EOT

    # 1. Login to Azure Container Registry
    az acr login --name ${azurerm_container_registry.main.name}

    # 2. Build and push frontend
    docker build -t ${azurerm_container_registry.main.login_server}/${var.project_name}-frontend:latest .
    docker push ${azurerm_container_registry.main.login_server}/${var.project_name}-frontend:latest

    # 3. Build and push backend
    docker build -t ${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest ./server
    docker push ${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest

    # 4. Restart apps to pick up new images
    az containerapp revision restart -n ${azurerm_container_app.backend.name} -g ${azurerm_resource_group.main.name} --revision $(az containerapp revision list -n ${azurerm_container_app.backend.name} -g ${azurerm_resource_group.main.name} --query "[0].name" -o tsv)
    az containerapp revision restart -n ${azurerm_container_app.frontend.name} -g ${azurerm_resource_group.main.name} --revision $(az containerapp revision list -n ${azurerm_container_app.frontend.name} -g ${azurerm_resource_group.main.name} --query "[0].name" -o tsv)

  EOT
}

# ── Cleanup Command ──────────────────────────────────────────────────────────

output "cleanup_command" {
  description = "Command to delete ALL resources (saves credits!)"
  value       = "az group delete --name ${azurerm_resource_group.main.name} --yes --no-wait"
}
