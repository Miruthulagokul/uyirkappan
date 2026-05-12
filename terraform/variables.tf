# ─────────────────────────────────────────────────────────────────────────────
# Input Variables
# ─────────────────────────────────────────────────────────────────────────────

# ── General ───────────────────────────────────────────────────────────────────

variable "project_name" {
  description = "Project name used for resource naming (lowercase, no special chars)"
  type        = string
  default     = "uyirkappan"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region to deploy into"
  type        = string
  default     = "centralindia" # Closest to Chennai
}

# ── Container Apps ────────────────────────────────────────────────────────────

variable "frontend_cpu" {
  description = "CPU cores for frontend container (0.25, 0.5, 1, 2, 4)"
  type        = number
  default     = 0.25
}

variable "frontend_memory" {
  description = "Memory (Gi) for frontend container (0.5, 1, 2, 4)"
  type        = string
  default     = "0.5Gi"
}

variable "frontend_min_replicas" {
  description = "Minimum number of frontend replicas"
  type        = number
  default     = 0 # Scales to zero when idle — saves credits
}

variable "frontend_max_replicas" {
  description = "Maximum number of frontend replicas"
  type        = number
  default     = 2
}

variable "backend_cpu" {
  description = "CPU cores for backend container"
  type        = number
  default     = 0.25
}

variable "backend_memory" {
  description = "Memory (Gi) for backend container"
  type        = string
  default     = "0.5Gi"
}

variable "backend_min_replicas" {
  description = "Minimum number of backend replicas"
  type        = number
  default     = 1 # Keep at least 1 for WebSocket connections
}

variable "backend_max_replicas" {
  description = "Maximum number of backend replicas"
  type        = number
  default     = 2
}

# ── Application ───────────────────────────────────────────────────────────────

variable "frontend_port" {
  description = "Port the frontend container listens on"
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "Port the backend container listens on"
  type        = number
  default     = 5001
}

variable "jwt_secret" {
  description = "JWT secret for backend authentication"
  type        = string
  sensitive   = true
  default     = "change-me-in-production-use-a-strong-secret"
}

# ── Container Registry ───────────────────────────────────────────────────────

variable "acr_sku" {
  description = "Azure Container Registry SKU (Basic is cheapest)"
  type        = string
  default     = "Basic" # ~$5/month — best for student accounts
}
