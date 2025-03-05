FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx/proxy.conf /etc/nginx/conf.d/proxy.conf

# Create directory for serving static files (if needed)
RUN mkdir -p /var/www/html

# Optional: Add a basic index.html for testing
RUN echo "Hello from Nginx!" > /var/www/html/index.html

#   setup ssl to listen to 443 for domain microservices.dev.studenthub.co   
#RUN mkdir -p /etc/nginx/ssl
#RUN openssl genrsa -out /etc/nginx/ssl/microservices.dev.studenthub.co.key 2048
#RUN openssl req -new -key /etc/nginx/ssl/microservices.dev.studenthub.co.key -out /etc/nginx/ssl/microservices.dev.studenthub.co.csr -subj "/CN=microservices.dev.studenthub.co"
#RUN openssl x509 -req -days 365 -in /etc/nginx/ssl/microservices.dev.studenthub.co.csr -signkey /etc/nginx/ssl/microservices.dev.studenthub.co.key -out /etc/nginx/ssl/microservices.dev.studenthub.co.crt

EXPOSE 80
#EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]