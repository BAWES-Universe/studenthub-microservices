# Setup 

## dev server
cp .env.dev-server-docker ./build/dev/.env.local && go build -o build/dev/process-id-request .

## prod server
cp .env.prod-server-docker ./build/prod/.env.local && go build -o build/prod/process-id-request .

## cron to process 

   `* * * * * cd /var/www/studenthub-microservices/html-to-png/build/dev && ./process-id-request > /dev/null 2>&1
   
   * * * * * sleep 20; cd /var/www/studenthub-microservices/html-to-png/build/dev && ./process-id-request > /dev/null 2>&1

   * * * * * sleep 40; cd /var/www/studenthub-microservices/html-to-png/build/dev && ./process-id-request > /dev/null 2>&1
   `

   `* * * * * cd /var/www/studenthub-microservices/html-to-png/build/prod && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1     
* * * * * sleep 10; cd /var/www/studenthub-microservices/html-to-png/build/prod  && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1
* * * * * sleep 20; cd /var/www/studenthub-microservices/html-to-png/build/prod && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1
* * * * * sleep 30; cd /var/www/studenthub-microservices/html-to-png/build/prod && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1   
* * * * * sleep 40; cd /var/www/studenthub-microservices/html-to-png/build/prod  && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1
* * * * * sleep 50; cd /var/www/studenthub-microservices/html-to-png/build/prod && ./process-id-request >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1
`



  - https://www.checkmateq.com/blog/schedule-a-cron-job-for-seconds#:~:text=By%20default%20cronjob%20cannot%20be,to%20schedule%20it%20for%20seconds. 

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
`sudo apt install mysql-client-core-8.0`

`mysql -u root -pstudenthub -h localhost -P 3306 `

`mysql -u root -pstudenthub -h ec2-35-179-168-33.eu-west-2.compute.amazonaws.com -P 3307 `

`mysql -u bawes -p'bawes12student!hub' -h studenthub-prod.cluster-c8mekjvvbygf.eu-west-2.rds.amazonaws.com` 

# TODO
- on failure, mark as failed
- on pick mark as processing so other cron jobs don't pick it up
