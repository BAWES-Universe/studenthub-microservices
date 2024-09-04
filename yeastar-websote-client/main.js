require('dotenv').config()


//const Kafka = require('node-rdkafka');
const mongoose = require("mongoose");
const io = require("socket.io-client");
const connectToDatabase = require("./lib/mongodb");
const { sendMessageToSQS } = require("./lib/sqs");

const WebSocket = require('ws');

const pbxUrl = "bawes.ras.yeastar.com";
const api_path = "openapi/v1.0";
let accessToken = "xfwkyUO5eGzWDdM8FCyBEtR2LrVAbDZr";
let refreshToken = "AGiWAapeCT7RbbuOPt7LYdy2mYbuvNZI";

connectToDatabase();

// Create a model without a schema
var eventSchema = new mongoose.Schema({}, { strict: false });
const eventModel = mongoose.model('events', eventSchema); // 'events' is the collection name

let socket;

let interval;

//init();

connect();

function init() {
  auth().then(res => {
    console.log("auth then", res, res.errcode);

    if (res.errcode == 0) {
      accessToken = res.access_token;
      refreshToken = res.refresh_token;
      //"access_token_expire_time": 1800,
      //"refresh_token_expire_time": 86400,

      connect();
    } else {
      //todo: handle auth error
      console.error("error", res);
    }
  }).catch(err => {
    console.error("caught error", err);
  });
}

function connect() {

  // Create a WebSocket server on port 8080

  const url = `wss://${pbxUrl}:443/${api_path}/subscribe?access_token=${accessToken}`;

  //const wss = new WebSocket(url);//{ port: 443 }

  // Connect to the secure WebSocket server
  socket = new WebSocket(url, {
    rejectUnauthorized: false, // Only for development; allows self-signed certificates
  });

  if (!socket) {
    console.error("error initialising client");
    return;
  }

  // Connection opened
  socket.addEventListener('open', (event) => {
    console.log('Connected to the Secure WebSocket server');

    setHeartbeat();
    subscribeToTopics();
  });

  // Listen for messages
  socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
 
    if (event.data.indexOf("type") > -1) {
      const data = JSON.parse(event.data);

      processEvent(data);
    }
  });

  // Handle WebSocket errors
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error observed:', event.message);
  });

  // Handle connection closed
  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event);

    console.log("close code", event.code)
    console.log("close reason", event.reason)
    console.log("close wasClean", event.wasClean)

    clearHeartbeat();
    //removeEventListeners()
    
    //todo: restart on server down, exponentially? 
    if (event.code == 1006) {
      init();
    }
  });

  socket.addEventListener("any", (event, ...args) => {
    console.log(`Received event: ${event}`, args);
  });
}

function removeEventListeners() {
  
    // If you used addEventListener, you must also manually remove each one as needed
    // socket.removeEventListener('open', listenerFunctionName);
    // ws.removeEventListener('message', listenerFunctionName);
    // ws.removeEventListener('error', listenerFunctionName);
    // ws.removeEventListener('close', listenerFunctionName);
  
}

function clearHeartbeat() {
  clearInterval(interval);
  interval = null;
}

function setHeartbeat() {
  console.log("setHeartbeat");

  interval = setInterval(() => {
    
    socket.send('heartbeat', (data) => {
      console.log('Reply from server:', data);
    });

    /*socket.emit('heartbeat', (data) => {
      console.log('Reply from server:', data);
    });*/
  }, 55 * 1000);// need interaction in 60 seconds
}

function subscribeToTopics() {

  const payload = {
    "topic_list": [30005, 30006, 30007, 30008, 30009, 30010, 30011, 30012, 30013, 30014, 30015, 30016, 30017, 30018, 30019, 30020, 30022, 30023, 30024, 30025, 30026]
  };

  socket.send(JSON.stringify(payload), (error) => {
    console.log('subscribeToTopics reply:', error);
  });
}

function auth() {

  const url = `https://${pbxUrl}:443/${api_path}/get_token`;

  const raw = JSON.stringify({
    "username": "ndOR5OLoREhC6ybJelrTBOuB0F0PDXXu",
    "password": "gPnYGPOCheEC7tw28XX233FMX6gqSonz"
  });

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  return fetch(url, requestOptions)
    .then((response) => response.json())
  //.then((result) => console.log(result))
  //.catch((error) => console.error(error));
}

async function processEvent(data) {
  console.log("processEvent", data, JSON.stringify(data));

  const params = Object.assign(JSON.parse(data.msg), { 
    type: data.type,
    sn: data.sn
  });

  console.log("final", params);

  //save to db 

  try {
    // Create a new document (with any structure)
    const newDocument = new eventModel(params);

    // Save the document to the database
    const savedDocument = await newDocument.save();
    console.log('Document saved without schema:', savedDocument);
  } catch (error) {
    console.error('Error saving document:', error);
  }

  //send event 

  sendMessageToSQS(params)
}