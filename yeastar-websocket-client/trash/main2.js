const io = require("socket.io-client");

const pbxUrl = "bawes.ras.yeastar.com";
const api_path = "openapi/v1.0";
const accessToken = "mKbdxTNs4FfYrLCL671I8iTNO7jqsUju";
//const refreshToken = "AGiWAapeCT7RbbuOPt7LYdy2mYbuvNZI";

// Connect to the Socket.IO server

const url = `wss://${pbxUrl}:443/${api_path}/subscribe?access_token=${accessToken}`;

console.log(url);

const socket = io(url, {
  autoConnect: true,
  secure: true, // Enables SSL/TLS
  rejectUnauthorized: false, // Only for development; allows self-signed certificates
  auth: {
    token: accessToken
  },
}); // Replace with your server URL

// Listen for events from the server
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
  console.log("connected", socket.connected); // true

  if (socket.recovered) {
    console.log("recovered");
    // any event missed during the disconnection period will be received now
  } else {
    // new or unrecoverable session
    console.log("new or unrecoverable session");

    setHeartbeat();
  }

  const engine = socket.io.engine;
  console.log(engine.transport.name); // in most cases, prints "polling"

  engine.once("upgrade", () => {
    // called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
    console.log(engine.transport.name); // in most cases, prints "websocket"
  });

  engine.on("packet", ({ type, data }) => {
    // called for each packet received
    
  });

  engine.on("packetCreate", ({ type, data }) => {
    // called for each packet sent
  });

  engine.on("drain", () => {
    // called when the write buffer is drained
  });

  engine.on("close", (reason) => {
    // called when the underlying connection is closed
  });
});

socket.io.on("connect_error", (error) => {
    if (socket.active) {
      // temporary failure, the socket will automatically try to reconnect
      console.log(error.message);
      //console.log("temporary failure", error);
    } else {
      // the connection was denied by the server
      // in that case, `socket.connect()` must be manually called in order to reconnect
      console.log(error.message);
    }
  });

socket.on("connect_error", (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
    console.log(error.message);
    //console.log("temporary failure", error);
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    console.log(error.message);
  }
});

socket.io.on("reconnect_attempt", (attempt) => {
  // ...
  console.log("reconnect_attempt");
});

socket.io.on("reconnect_error", (error) => {
  // ...
  console.log("reconnect_error");
});

socket.io.on("reconnect_failed", () => {
  // ...
  console.log("reconnect_failed");
});

// Listen for any event from the server
socket.onAny((event, ...args) => {
    console.log(`Received event: ${event}`, args);   
});

socket.on("disconnect", (reason, details) => {
  if (socket.active) {
    // temporary disconnection, the socket will automatically try to reconnect
    console.log("temporary disconnection", reason);
  } else {
    // the connection was forcefully closed by the server or the client itself
    // in that case, `socket.connect()` must be manually called in order to reconnect
    console.log(reason);
  }
});

let interval;

function clearHeartbeat() {
    clearInterval(interval);
    interval = null;
}

function setHeartbeat() {
    interval = setInterval(() => {
        socket.emit('heartbeat', (data) => {
            console.log('Message from server:', data);
        });
    }, 1000);
}


/*socket.on('message', (data) => {
  console.log('Message from server:', data);
});*/

// Emit an event to the server
//socket.emit('message', 'Hello from client!');


