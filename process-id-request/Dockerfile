# Start with the official Golang image to build the Go application
FROM golang:1.23 AS builder

# Install cron with cleanup in the same layer to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod tidy

# Copy the rest of the application source code
COPY . .

# Build the Go application with optimizations
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o process-id-request

#GOOS=linux GOARCH=386 
# arm
# ref: https://www.digitalocean.com/community/tutorials/how-to-build-go-executables-for-multiple-platforms-on-ubuntu-16-04

# Use a minimal base image for the final image
#FROM alpine:latest

# Install cron
#RUN apk add --no-cache cron

# Set the working directory inside the container
#WORKDIR /app

# Copy the Go executable from the builder stage
#COPY --from=builder /app/process-id-request .

# Expose the port the app runs on
#EXPOSE 8080

RUN touch /var/log/cron.log

# Command to run the executable or keep container running
CMD ["sh", "-c", "service cron start && crontab ./cron/cronlist && tail -f /var/log/cron.log"]


