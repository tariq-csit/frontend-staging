server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  # Frontend React app
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Backend API
  location /auth/ {
    proxy_pass http://slash-backendstaging-a5jvpj:4000/;   # ← note the trailing slash

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
