
#Env setup 

`RAILWAY_DOCKERFILE_PATH=./process-id-request/Dockerfile`

## dev 

### prebuild command 
`cp .env.dev-server-railway .env.local`  

### start command
`service cron start && crontab ./cron/cronlist && tail -f /dev/null`

## prod 

### prebuild command 
`cp .env.prod-server-railway .env.local`  

### start command
`service cron start && crontab ./cron/cronlist && tail -f /dev/null`