FROM node:24-alpine

WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances en production
RUN npm ci --omit=dev

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 8080

# Health check - vérifier que le processus Node.js est running
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD ps aux | grep -v grep | grep "node server.js" > /dev/null || exit 1

# Démarrer l'application
CMD ["node", "server.js"]
