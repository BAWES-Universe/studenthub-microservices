# Setup 

## dev server
cp .env.dev-server-docker .env.local && go build -o build/process-id-request-dev .

## prod server
cp .env.prod-server-docker .env.local && go build -o build/process-id-request-prod .

## cron to process 

   * * * * * ./var/www/studenthub-microservices/html-to-png/build/process-id-request-dev >> /var/www/studenthub-microservices/html-to-png/logs/dev.log 2>&1

   * * * * * ./var/www/studenthub-microservices/html-to-png/build/process-id-request-prod >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1

# Go environment
nano ~/.bashrc

export GOPATH=$HOME/go
export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin

source ~/.bashrc

# pre-requisites
- install chromium-browser in microservice server
- allow mysql access from main EC2 instance for dev server
  `sudo ufw status`
  `sudo ufw enable`
  `sudo ufw allow 3307/tcp`
  `sudo ufw reload`
  
## ssh into musql   
`mysql -u root -pstudenthub -h localhost -P 3306 `

`mysql -u root -pstudenthub -h ec2-35-179-168-33.eu-west-2.compute.amazonaws.com -P 3307 `

# TODO
- on failure, mark as failed
- on pick mark as processing so other cron jobs don't pick it up
