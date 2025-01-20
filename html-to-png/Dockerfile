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
RUN GOOS=linux GOARCH=386 go build -o png-linux 
# arm
# ref: https://www.digitalocean.com/community/tutorials/how-to-build-go-executables-for-multiple-platforms-on-ubuntu-16-04

# Use a minimal base image for the final image
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the Go executable from the builder stage
COPY --from=builder /app/png-linux .

# Expose the port the app runs on
#EXPOSE 8080

# Command to run the executable
#CMD ["./png-linux"]