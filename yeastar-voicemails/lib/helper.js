const mongoose = require('mongoose');
const { listVoicemails } = require('./yeastar');

// Create a model without a schema
const voiceMailSchema = new mongoose.Schema({}, { strict: false });
const voiceMailModel = mongoose.model('voice_mail', voiceMailSchema); // 'events' is the collection name

let page_synched = 0;

const syncPage = async (page, page_size) => {
 
    const response = await listVoicemails(page, page_size);
 
    if (!response.data) {
        //process.exit();
        return {
            "operation": "success"
        };
    }

    //await voiceMailModel.insertMany(response.data);

    const msgIds = response.data.map(doc => doc.msg_id);
 
    await voiceMailModel.find({ msg_id: { $in: msgIds } })
        .then(async existingDocs => {
            const existingMsgIds = existingDocs.map(doc => doc.msg_id);
 
            // Filter out documents that already exist
            const newDocuments = response.data.filter(doc => !existingMsgIds.includes(doc.msg_id));
 
            // Insert only the new documents
            if (newDocuments.length > 0) {
                await voiceMailModel.insertMany(newDocuments);
            } else {
                console.log('No new documents to insert.');
                //process.exit();
                return {
                    "operation": "success"
                };
            }
        })
        /*.then(result => {
            if (result) {
                console.log('New documents inserted:', result);
            }
        })*/
        .catch(error => {
            console.error('Error inserting new documents:', error);

            return {
                "operation": "error",
                "message": 'Error inserting new documents:' + error
            };
        });


    /*.then(result => {
        console.log('Documents inserted');
      })
      .catch(error => {
        console.error('Insert error:', error);
      });*/

    page_synched++; 

    //check if having more pages 
 
    if (response.total_number > page_synched * page_size) {
        return await syncPage(page_synched + 1, page_size)
    }

    //process.exit(); // all done 
    return {
        "operation": "success"
    };
}

const syncVoiceMails = async () => {
 
    //check total synched 

    const total = await voiceMailModel.countDocuments({});
     
    const page_size = 40;
    
    page_synched = total > 0 ? Math.floor(total/ page_size) : 0;
     
    await syncPage(page_synched + 1, page_size);

    return {
        "operation": "success"
    };
}

// Pagination function
const getPaginatedVoicemails = async (page, limit) => {
    try {
      // Convert page and limit to numbers
      const pageNumber = parseInt(page) || 1; // Default to page 1
      const limitNumber = parseInt(limit) || 10; // Default to 10 items per page
  
      // Calculate how many documents to skip
      const skip = (pageNumber - 1) * limitNumber;
  
      // Fetch documents using pagination
      const voicemails = await voiceMailModel.find()
        .skip(skip) // Skip previous pages
        .limit(limitNumber) // Limit the number of documents per page
        .sort({ time: -1 }); // Sort by time in descending order (latest first)
  
      // Optionally, count the total documents for pagination meta info
      const totalVoicemails = await voiceMailModel.countDocuments();
  
      // Return the data with pagination info
      return {
        total: totalVoicemails,
        page: pageNumber,
        totalPages: Math.ceil(totalVoicemails / limitNumber),
        limit: limitNumber,
        data: voicemails,
      };
    } catch (error) {
      console.error('Error fetching voicemails:', error);
      throw error;
    }
};

const getVoicemail = async (msg_id) => {
    try {
      return await voiceMailModel.findOne({
        "msg_id": {
            "$eq": msg_id
        }
      });
    } catch (error) {
      console.error('Error fetching voicemails:', error);
      throw error;
    }
};

// Function to listen for new documents in the 'voicemails' collection
const listenForNewVoicemails = () => {
    // Start a change stream on the Voicemail collection
    const changeStream = voiceMailModel.watch();
  
    // Listen for new documents (insert operations)
    changeStream.on('change', async (change) => {

        console.log("change called");

      if (change.operationType === 'insert') {
        const newDocument = change.fullDocument;
        console.log('New document inserted:', newDocument);

        if (newDocument.type == 30012 && newDocument.status == "VOICEMAIL") {
            //trigger sync 
            console.log("triggering sync");
            await getAccessToken();
            
            const result = await syncVoiceMails();
            
            console.log("result", result);
        }
      }
    });
  
    // Handle any errors
    changeStream.on('error', (err) => {
      console.error('Error in change stream:', err);
    });
  
    // Close the change stream gracefully when needed
    process.on('SIGINT', () => {
      console.log('Closing change stream...');
      changeStream.close();
      process.exit();
    });
};

module.exports = {
    syncPage,
    syncVoiceMails,
    getPaginatedVoicemails,
    getVoicemail,
    listenForNewVoicemails,
    voiceMailModel
}