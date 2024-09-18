const dotenv = require('dotenv');

dotenv.config();

const { getAccessToken, getToken, downloadVoicemail } = require('../lib/yeastar');
const { voiceMailModel } = require('../lib/helper');
const connectToDatabase = require('../lib/mongodb');
 
(async () => {

    //const token = getToken();

    //if (!token) {
        await getAccessToken();
    //}

    await connectToDatabase(); 

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

        console.log("result", result);   

    process.exit();
})(); 
