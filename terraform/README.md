# Uyirkappan — Terraform Infrastructure (Azure)

Provisions the complete Azure infrastructure to deploy the Uyirkappan emergency ambulance platform. **Optimized for Azure for Students ($100 free credits).**

## Architecture

```
Internet
   │
   ▼
┌──────────────────────────────────────────────────┐
│         Azure Container Apps Environment          │
│                                                   │
│  ┌─────────────────┐    ┌──────────────────────┐ │
│  │    Frontend      │    │      Backend         │ │
│  │   Container App  │    │   Container App      │ │
│  │   (Nginx)        │    │   (Express +         │ │
│  │   Port 80        │    │    Socket.IO)         │ │
│  │   0-2 replicas   │    │   Port 5001           │ │
│  │   (scale to 0!)  │    │   1-2 replicas        │ │
│  └─────────────────┘    └──────────────────────┘ │
│                                                   │
│  📋 Log Analytics Workspace                       │
└──────────────────────────────────────────────────┘
          ▲
          │
   ┌──────┴───────┐
   │    ACR        │
   │  (Docker      │
   │   images)     │
   └──────────────┘
```

## Resources Created

| Resource | Service | Description |
|----------|---------|-------------|
| Resource Group | — | All resources in one group (easy cleanup!) |
| Container Registry | ACR Basic | Docker image storage (~$5/mo) |
| Container Apps Env | — | Shared environment with logging |
| Frontend App | Container Apps | Nginx serving React SPA (scale-to-zero) |
| Backend App | Container Apps | Express + Socket.IO API (min 1 replica) |
| Log Analytics | — | Container logs (first 5GB/mo free) |

## Prerequisites

1. **Azure for Students** subscription activated at [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students)
2. **Azure CLI** installed: [Install Guide](https://learn.microsoft.com/cli/azure/install-azure-cli)
3. **Terraform** installed: [Install Guide](https://developer.hashicorp.com/terraform/install)
4. **Docker** installed and running

## Quick Start

```bash
# 0. Login to Azure
az login

# 1. Copy and edit variables
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — change jwt_secret!

# 2. Initialize Terraform
terraform init

# 3. Preview changes
terraform plan

# 4. Deploy infrastructure (~3-5 minutes)
terraform apply

# 5. Push Docker images (see commands below)
```

## Deploy Docker Images

After `terraform apply`, push your images to ACR:

```bash
# Login to ACR
az acr login --name uyirkappanprodacr

# Build and push frontend (from project root)
docker build -t uyirkappanprodacr.azurecr.io/uyirkappan-frontend:latest .
docker push uyirkappanprodacr.azurecr.io/uyirkappan-frontend:latest

# Build and push backend
docker build -t uyirkappanprodacr.azurecr.io/uyirkappan-backend:latest ./server
docker push uyirkappanprodacr.azurecr.io/uyirkappan-backend:latest
```

> 💡 Run `terraform output docker_push_commands` for the exact commands with your ACR name.

## Estimated Cost (Student Account)

| Resource | ~Monthly Cost |
|----------|---------------|
| ACR (Basic) | ~$5 |
| Container Apps (backend, always on) | ~$5-10 |
| Container Apps (frontend, scale-to-zero) | ~$0-3 |
| Log Analytics (first 5GB free) | ~$0 |
| **Total** | **~$10-18/month** |

> 💰 With $100 student credits, this runs for **5-10 months free!**

## Saving Credits

- Frontend scales to **zero replicas** when there's no traffic
- Backend keeps **1 minimum replica** for WebSocket connections
- Use `terraform destroy` when not actively using the app
- Quick cleanup: `az group delete --name uyirkappan-prod-rg --yes`

## Updating the App

```bash
# Rebuild and push the changed image
docker build -t <ACR_URL>/uyirkappan-backend:latest ./server
docker push <ACR_URL>/uyirkappan-backend:latest

# Create a new revision
az containerapp update \
  --name uyirkappan-backend \
  --resource-group uyirkappan-prod-rg \
  --image <ACR_URL>/uyirkappan-backend:latest
```

## Cleanup (Stop Spending Credits)

```bash
# Option 1: Destroy via Terraform (recommended)
terraform destroy

# Option 2: Delete entire resource group
az group delete --name uyirkappan-prod-rg --yes --no-wait
```
