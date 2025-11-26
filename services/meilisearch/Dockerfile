# Meilisearch Dockerfile for Admitly Platform
# Based on official Meilisearch image

FROM getmeili/meilisearch:v1.6

# Expose default port
EXPOSE 7700

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD curl -f http://localhost:7700/health || exit 1

# Start Meilisearch
CMD ["meilisearch"]
