FROM nginx:stable-alpine

# Replace default nginx config with our SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output (assumes this folder already contains the Angular build files)
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
