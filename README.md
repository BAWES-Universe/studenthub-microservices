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
