//const { receiveMessagesFromSQS } = require("./lib/sqs");
//receiveMessagesFromSQS();
//require("./instrument");
//const Sentry = require("@sentry/node");

const express = require('express');
const dotenv = require('dotenv');
const { sendMessageToSQS } = require('./lib/sqs');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// Enable CORS for all routes
app.use(cors());

// Add this after all routes,
// but before any and other error-handling middlewares are defined
//Sentry.setupExpressErrorHandler(app);

app.use((req, res, next) => {
    //console.log('Time:', Date.now())
    const token = req.headers["authorization"];
 
    if (token == "Bearer QstN8_18LmILpl37r2zvdDCp5JjWPCNh") {
        return next();
    }

    res.sendStatus(401);
})
   

// Add error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('Bad JSON:', err.message);
      return res.status(400).send({ status: 400, message: 'Bad JSON' });
    }
    next();
  });
app.post("/send", async (req, res) => {
    if (!req.body || !req.body.message || !req.body.queue) {
        res.status(400).json({ error: "Message and queue are required" });
        return;
    }
    res.json({
        operation: "success ",
        message: "Message sent to SQS"
    });
    await sendMessageToSQS(req.body.message, req.body.queue);
    //const result = 
    //res.json(result);
});

app.get("/receive", async (req, res) => {
    const result = await receiveMessagesFromSQS(req.body.queue, req.body.deleteAfterReceive);
    res.json(result);
});

//listen on any IPv4 address (0.0.0.0) or IPv6 address (::) 
app.listen(port, '::', () => {
    console.log(`Server running on port ${port} (IPv4 and IPv6)`);
  }).on('error', (err) => {
    if (err.syscall !== 'listen') {
      throw err;
    }
    
    // If IPv6 fails, fallback to IPv4
    if (err.code === 'EADDRNOTAVAIL') {
      app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port} (IPv4 only)`);
      });
    } else {
      throw err;
    }
  });