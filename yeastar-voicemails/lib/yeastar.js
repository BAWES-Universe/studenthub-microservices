const axios = require('axios');
const fs = require('fs');
const AWS = require('aws-sdk');
const { Blob } = require('buffer'); // Node.js has a global Blob class since v18.7.0
const s3 = new AWS.S3();

AWS.config.update({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret key 
    region: process.env.AWS_REGION // Replace with your desired AWS region 
});

const pbxUrl = 'bawes.ras.yeastar.com'; // Replace with your actual PBX URL
const apiPath = 'openapi/v1.0'; // Replace with your actual API path

const username = 'ndOR5OLoREhC6ybJelrTBOuB0F0PDXXu';
const password = 'gPnYGPOCheEC7tw28XX233FMX6gqSonz';

// Create a model without a schema
//const voiceMailSchema = new mongoose.Schema({}, { strict: false });
//const voiceMailModel = mongoose.model('voice_mail', voiceMailSchema); // 'events' is the collection name

const getAccessToken = async () => {
    try {
        const response = await axios.post(`https://${pbxUrl}:443/${apiPath}/get_token`, {
            username,
            password
        });
        //accessToken = response.data.access_token;
       
        saveToken(response.data);
        
        return response.data;
       
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
    }
}

const listVoicemails = async (page, page_size = 100) => {
    try {
        const response = await axios.get(`https://${pbxUrl}:443/${apiPath}/vm/query`, {
            params: { 
                access_token: getToken()?.access_token, 
                page: page,
                page_size: page_size,
                number: 6402
            }
        });
        return response.data.voicemail_list[0];
    } catch (error) {
        console.error('Error listing voicemails:', error.response?.data || error.message);
        return [];
    }
}
 
const downloadVoicemail = async (msgId) => {
    try {
      const response = await axios.get(`https://${pbxUrl}:443/${apiPath}/vm/download`, {
        params: {
          access_token: getToken()?.access_token,
          msg_id: msgId,
        },
      });

      //{ errcode: 10004, errmsg: 'TOKEN EXPIRED' }
  
      const blobResponse = await axios.get(`https://${pbxUrl}:443/${response.data.download_resource_url}`, {
        params: {
          access_token: getToken()?.access_token,
          msg_id: msgId,
        },
        responseType: 'arraybuffer',
      });
 
      const buffer = arrayBufferToBuffer(blobResponse.data);

      //const blob = new Blob([blobResponse.data], { type: 'audio/wav' });
       
      //save to s3 
 
      return await uploadBlobToS3(buffer, `voicemail/voicemail_${msgId}.wav`)

    } catch (err) {
      console.error('Failed to download voicemail', err);
      return {
        "operation": "error",
        "message": 'Failed to download voicemail: '+ err
      };
    }
};

// Function to upload the file
async function uploadBlobToS3(buffer, fileName) {
     
    const params = {
      Bucket: process.env.AWS_S3_BUCKET, // Replace with your S3 bucket name
      Key: fileName,              // Name of the file in the bucket
      Body: buffer,                 // The actual WAV file blob or buffer
      ContentType: 'audio/wav',    // MIME type for WAV files
      'ACL': 'public-read',
    };
  
    try {
      const data = await s3.upload(params).promise();
      console.log(`File uploaded successfully. ${data.Location}`, data);

      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      return {
        "operation": "error",
        "message": 'Error uploading file: '+ err
      };
    }
}
  
// Save token to a file
function saveToken(token) {
  fs.writeFileSync('token.txt', JSON.stringify(token), 'utf8');
}

// Read token from a file
function getToken() {
    const data = fs.readFileSync('token.txt', 'utf8');
  
    if (data)
      return JSON.parse(data);
}

// Convert Blob to Buffer
async function blobToBuffer(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
  // Function to convert ArrayBuffer to Buffer
const arrayBufferToBuffer = (arrayBuffer) => {
    return Buffer.from(arrayBuffer);
};

module.exports = {
    getAccessToken,
    listVoicemails,
    downloadVoicemail,
    getToken
 //   voiceMailModel
};


