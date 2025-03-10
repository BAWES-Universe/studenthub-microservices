Sync voicemails 

`node console/sync.js`

Process voicemails 

`node console/process.js`

events not having sufficient/ required data to sync voicemails so using crons 

to run app 

`node main.js`

path in linux 

node /var/www/studenthub-microservices/yeastar-voicemails/console/sync.js
node /var/www/studenthub-microservices/yeastar-voicemails/console/process.js

cron 
*/5 * * * * /usr/bin/node /var/www/studenthub-microservices/yeastar-voicemails/console/sync.js && /usr/bin/node /var/www/studenthub-microservices/yeastar-voicemails/console/process.js

TODO: 
- studenthub update
- cron job setup in server
- handling token expiry 

# Railway 

## staging 

`RAILWAY_DOCKERFILE_PATH=./yeastar-voicemails/Dockerfile-staging`

## prod 

`RAILWAY_DOCKERFILE_PATH=./yeastar-voicemails/Dockerfile`
