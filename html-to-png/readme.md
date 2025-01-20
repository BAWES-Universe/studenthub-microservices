# cron to process 

   * * * * * ./var/www/studenthub-microservices/html-to-png/build/process-id-request-dev >> /var/www/studenthub-microservices/html-to-png/logs/dev.log 2>&1

   * * * * * ./var/www/studenthub-microservices/html-to-png/build/process-id-request-prod >> /var/www/studenthub-microservices/html-to-png/logs/prod.log 2>&1

## dev server
cp .env.dev-server-docker .env.local && go build -o build/process-id-request-dev .

## prod server
cp .env.prod-server-docker .env.local && go build -o build/process-id-request-prod .

# TODO
- on failure, mark as failed
- on pick mark as processing so other cron jobs don't pick it up
