
#Env setup 

## dev 

`RAILWAY_DOCKERFILE_PATH=./process-id-request/Dockerfile-dev`

### prebuild command 
`cp .env.dev-server-railway .env.local`  
`cp .env.dev-server-railway /.env.local`
`cp .env.dev-server-railway /app/.env.local`

### start command
`service cron start && crontab ./cron/cronlist && tail -f /dev/null`

## prod 

`RAILWAY_DOCKERFILE_PATH=./process-id-request/Dockerfile-prod`

### prebuild command 
`cp .env.prod-server-railway .env.local`  
`cp .env.prod-server-railway /.env.local`
`cp .env.prod-server-railway /app/.env.local` 

### start command
`service cron start && crontab ./cron/cronlist && tail -f /dev/null`