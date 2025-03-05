require("./instrument");
const Sentry = require("@sentry/node");

const express = require('express');
const dotenv = require('dotenv');

const cors = require('cors');

dotenv.config();

const { getAccessToken, getToken, downloadVoicemail } = require('./lib/yeastar');
const { syncVoiceMails, voiceMailModel, getPaginatedVoicemails, listenForNewVoicemails } = require('./lib/helper');
const connectToDatabase = require('./lib/mongodb');

const app = express();
const port = 3001;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// Enable CORS for all routes
app.use(cors());
 

// Add this after all routes,
// but before any and other error-handling middlewares are defined
Sentry.setupExpressErrorHandler(app);

app.use((req, res, next) => {
    //console.log('Time:', Date.now())
    const token = req.headers["authorization"];
 
    if (token == "Bearer QstN8_18LmILpl37r2zvdDCp5JjWPCNh") {
        return next();
    }

    res.sendStatus(401);
})
 
/* (async () => {

    const token = getToken();

    if (!token) {
        await getAccessToken();
    }

    await connectToDatabase(); 
  })(); */
 

app.get("/sync", async (req, res) => {
    await getAccessToken();
    
    const result = await syncVoiceMails();
    res.json(result);
});

app.get("/process", async (req, res) => {
    await getAccessToken();
    
    const result = await voiceMailModel.find({ s3_file_path: { $exists: false } })
        .then(async documents => {
            for (let document of documents) {
                const response = await downloadVoicemail(document.msg_id);
 
                if (response.Location) {
                     
                    //update document   

                    await voiceMailModel.updateOne({ msg_id: document.msg_id }, { 
                            s3_file_path: response.Location 
                        })
                        /*.then(result => {
                            console.log('Document updated:', result);
                        })*/
                        .catch(error => {
                            console.error('Error updating document:', error);
                            
                            return {
                                "operation": "error",
                                "message": 'Error updating document:' + error
                            };
                        });
                }
            }
        })
        .catch(error => {
            console.error('Error finding documents:', error);
            //process.exit();
            return {
                "operation": "error",
                "message": 'Error finding documents:' + error
            };
        });   

    res.json(result);    
})

app.get("/list", async (req, res) => {
    const { page, limit } = req.query;
    const result = await getPaginatedVoicemails(page, limit);
    res.json(result);
});
 
app.get('/view/:id', async (req, res) => {
    const vmId = req.params.id;
    res.json(await getVoicemail(vmId));
});

app.get('/download/:id', async (req, res) => {
    await getAccessToken();

    const vmId = req.params.id;
    const result = await downloadVoicemail(vmId);
    res.json(result);
});

//listen on any IPv4 address (0.0.0.0) or IPv6 address (::) 
app.listen(port, '::', async () => {
    await connectToDatabase();

    //listen to events 
    //listenForNewVoicemails();

    console.log(`App listening at http://localhost:${port}`);
});