FROM nginx:stable-alpine

# Supprimer la page d'accueil par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers statiques dans le répertoire de Nginx
COPY . /usr/share/nginx/html

# Exposer le port
EXPOSE 40001

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]