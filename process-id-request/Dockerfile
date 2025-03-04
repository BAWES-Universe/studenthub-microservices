# Start with the official Golang image to build the Go application
FROM golang:1.23 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod tidy

# Copy the rest of the application source code
COPY . .

# Build the Go application
RUN GOOS=linux GOARCH=386 go build -o process-id-request 
# arm
# ref: https://www.digitalocean.com/community/tutorials/how-to-build-go-executables-for-multiple-platforms-on-ubuntu-16-04

# Use a minimal base image for the final image
FROM alpine:latest

# Install cron
RUN apk add --no-cache cron

# Set the working directory inside the container
WORKDIR /app

# Copy the Go executable from the builder stage
COPY --from=builder /app/process-id-request .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the executable or keep container running
CMD ["service", "cron", "start", "&&", "crontab", "./cron/cronlist", "&&", "tail", "-f", "/dev/null"]