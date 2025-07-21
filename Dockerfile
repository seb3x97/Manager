FROM node:20-slim

WORKDIR /app

# Installer le serveur statique
RUN npm install -g serve

# Copier les fichiers statiques
COPY . .

# Exposer le port que tu veux (ex. 40001)
EXPOSE 40001

# Lancer le serveur
CMD ["serve", ".", "-l", "40001"]
