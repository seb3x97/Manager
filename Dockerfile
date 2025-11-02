FROM node:20-slim

WORKDIR /app

# Installer le serveur statique
RUN npm install -g serve

# Copier les fichiers statiques
COPY . .

# Exposer le port
EXPOSE 4100

# Lancer le serveur
CMD ["serve", ".", "-l", "4100"]
