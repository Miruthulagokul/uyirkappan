# ─────────────────────────────────────────────────────────────────────────────
# Azure Container Apps Environment + Apps
# Serverless container platform — pay only for what you use
# ─────────────────────────────────────────────────────────────────────────────

# ── Container Apps Environment ────────────────────────────────────────────────
# Shared environment for both apps (networking, logging)

resource "azurerm_container_app_environment" "main" {
  name                       = "${var.project_name}-${var.environment}-env"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Backend Container App ─────────────────────────────────────────────────────
# Must be created first so frontend can reference its FQDN

resource "azurerm_container_app" "backend" {
  name                         = "${var.project_name}-backend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.main.admin_password
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  ingress {
    external_enabled = true
    target_port      = var.backend_port
    transport        = "auto" # Supports both HTTP and WebSocket

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.backend_min_replicas
    max_replicas = var.backend_max_replicas

    container {
      name   = "backend"
      image  = "${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest"
      cpu    = var.backend_cpu
      memory = var.backend_memory

      env {
        name  = "PORT"
        value = tostring(var.backend_port)
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret"
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://${var.project_name}-frontend.${azurerm_container_app_environment.main.default_domain}"
      }

      liveness_probe {
        transport = "HTTP"
        path      = "/api/health"
        port      = var.backend_port

        initial_delay    = 10
        interval_seconds = 30
        timeout          = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport = "HTTP"
        path      = "/api/health"
        port      = var.backend_port

        interval_seconds = 10
        timeout          = 5
        failure_count_threshold = 3
      }
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# ── Frontend Container App ────────────────────────────────────────────────────

resource "azurerm_container_app" "frontend" {
  name                         = "${var.project_name}-frontend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.main.admin_password
  }

  ingress {
    external_enabled = true
    target_port      = var.frontend_port
    transport        = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = var.frontend_min_replicas
    max_replicas = var.frontend_max_replicas

    container {
      name   = "frontend"
      image  = "${azurerm_container_registry.main.login_server}/${var.project_name}-frontend:latest"
      cpu    = var.frontend_cpu
      memory = var.frontend_memory

      liveness_probe {
        transport = "HTTP"
        path      = "/"
        port      = var.frontend_port

        initial_delay    = 10
        interval_seconds = 30
        timeout          = 5
        failure_count_threshold = 3
      }
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}
