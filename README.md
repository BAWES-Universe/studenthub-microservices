# studenthub-microservices

## setup 

github repo setup 
---------------------------
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
&& sudo mkdir -p -m 755 /etc/apt/keyrings \
&& wget -qO- https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
&& sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& sudo apt update \
&& sudo apt install gh -y

sudo chmod a+rw /var/www

gh auth login

gh repo clone plugnio/studenthub-microservices

### to reset file
git checkout -- yeastar-voicemails/token.txt

node.js
------------------
sudo apt-get install -y nodejs
sudo apt-get install -y npm

to set production env
------------------
cp .env.production .env

fix npm for non-docker use 
------------------
sudo chmod -R a+rw /home/ubuntu/.npm


# docker 
------------------
sudo apt install -y docker.io
docker build -t yeastar-websote-client .
docker run yeastar-websote-client //-p 3000:3000


## stop & update 

docker pull <image_name>:<tag> or git pull && docker build -t yeastar-websote-client .

docker ps 
docker stop <container_name_or_id>
docker rm <container_name_or_id>

docker run -d yeastar-websote-client //-p 3000:3000

## pm2 

npm install pm2@latest -g
pm2 start main.js --name yeaster 

### To ensure pm2 restarts your Node.js app when the server reboots, use:
pm2 startup
pm2 save

### Useful pm2 Commands:
List running processes: pm2 list
Restart an app: pm2 restart my-app
Stop an app: pm2 stop my-app
View logs: pm2 logs

# nginx 

sudo vim /etc/nginx/sites-available/default

## Configuration for listening on port 80 for /yeastar-voicemails path
server {
    listen 80;
    listen [::]:80; 

    location /yeastar-voicemails/ {
        proxy_pass http://localhost:3001/;  # Example: Forwarding requests to an API running on port 3001
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /linear/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /bawes-doc-updater/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
 
## Default server block for other traffic (optional)
server {
    listen 80;
    
    location / {
        root /var/www/html;
        index index.html;
    }
}

#railway 

server {
    listen 80;
    listen [::]:80;

    location /linear/ {
        proxy_pass http://linear.railway.internal:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /yeastar-voicemails/ {
        proxy_pass http://yeastar-voicemails.railway.internal:3001/;  # Example: Forwarding requests to an API running on port proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

## ubuntu firewall 

sudo ufw allow 8080
sudo ufw allow 8090

## test config 

sudo nginx -t

## restart nginx 

sudo systemctl restart nginx

## test 

curl --location 'https://microservices.studenthub.co/yeastar-voicemails/list' \
--header 'Authorization: Bearer QstN8_18LmILpl37r2zvdDCp5JjWPCNh'

# ssh into docker container 

`docker exec -it fb30d490b5e2 /bin/bash`

