# ============================================================
# Stage 1: Build — Install dependencies and compile the app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies (clean install for reproducible builds)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Accept build-time environment variables
ARG VITE_API_BASE=http://localhost:5001
ARG VITE_SOCKET_URL=http://localhost:5001
ARG VITE_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
ARG VITE_OSRM_BASE=https://router.project-osrm.org
ARG VITE_NOMINATIM_BASE=https://nominatim.openstreetmap.org

# Set them as env vars so Vite can inline them at build time
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_MAP_TILE_URL=$VITE_MAP_TILE_URL
ENV VITE_OSRM_BASE=$VITE_OSRM_BASE
ENV VITE_NOMINATIM_BASE=$VITE_NOMINATIM_BASE

# Build the production bundle
RUN npm run build


# ============================================================
# Stage 2: Serve — Lightweight Nginx image to serve static files
# ============================================================
FROM nginx:1.27-alpine AS production

# Remove default Nginx config and static files
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
