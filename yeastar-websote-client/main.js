const io = require("socket.io-client");

const pbxUrl = "bawes.ras.yeastar.com";
const api_path = "openapi/v1.0";
const accessToken = "p7XeW03Xg0coOVWwPkf0wdIF4DLrbkOu";
const refreshToken = "AGiWAapeCT7RbbuOPt7LYdy2mYbuvNZI";

// server.js

const WebSocket = require('ws');

// Create a WebSocket server on port 8080

const url = `wss://${pbxUrl}:443/${api_path}/subscribe?access_token=${accessToken}`;

//const wss = new WebSocket(url);//{ port: 443 }

 // Connect to the secure WebSocket server
 const socket = new WebSocket(url, {
  
  rejectUnauthorized: false, // Only for development; allows self-signed certificates
 });
 

 // Connection opened
 socket.addEventListener('open', (event) => {
   console.log('Connected to the Secure WebSocket server');
 });

 // Listen for messages
 socket.addEventListener('message', (event) => {
   console.log('Message from server:', event.data);
   const li = document.createElement('li');
   li.textContent = event.data;
   document.getElementById('messages').appendChild(li);
 });

 // Send a message to the WebSocket server
 function sendMessage() {
   const input = document.getElementById('messageInput');
   const message = input.value;
   socket.send(message);
   input.value = '';
 }

 // Handle WebSocket errors
 socket.addEventListener('error', (event) => {
   console.error('WebSocket error observed:', event.message);
 });

 // Handle connection closed
 socket.addEventListener('close', (event) => {
   console.log('WebSocket connection closed:', event.message);
 });
/*
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received message:', message);

    // Send a message back to the client
    ws.send(`Hello, you sent -> ${message}`);
  });

  ws.onAny((event, ...args) => {
    console.log(`Received event: ${event}`, args);   
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');
});

// Handle errors
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});

console.log('WebSocket server is running on ws://localhost:8080');
*/

