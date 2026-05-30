FROM nginx:alpine

# Copy custom secure Nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy all static assets into the default Nginx public directory
COPY . /usr/share/nginx/html

# Expose port 80 to the outer world
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
