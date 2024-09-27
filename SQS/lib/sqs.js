require('dotenv').config()
const AWS = require('aws-sdk');
const { getAccessToken, downloadVoicemail } = require('../../yeastar-voicemails/lib/yeastar');
const { syncVoiceMails, voiceMailModel } = require('../../yeastar-voicemails/lib/helper');
const connectToDatabase = require('../../yeastar-voicemails/lib/mongodb');
const sqs = new AWS.SQS({});//apiVersion: '2012-11-05'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your access key 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your secret key 
  region: process.env.AWS_REGION // Replace with your desired AWS region 
});

//To send a message to an SQS queue, use the `sendMessage` method. You need to specify the `QueueUrl` and `MessageBody` at a minimum.

const sendMessageToSQS = async (message, queue = process.env.AWS_SQS_QUEUE) => {

  const url = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${queue}`;

  const params = {
    QueueUrl: url, // Replace with your SQS Queue URL
    MessageBody: JSON.stringify(message),
    DelaySeconds: 0 // Optional delay in seconds
  };

  try {
    const data = await sqs.sendMessage(params).promise();
    console.log('Message sent, MessageId:', data.MessageId);
    return {
      operation: "success",
      data: data
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      operation: "error",
      message: error
    };
  }
};

// Call the function to send a message
//sendMessageToSQS(message);

const receiveMessagesFromSQS = async (queue = process.env.AWS_SQS_QUEUE, deleteAfterReceive = false) => {

  console.log("receiveMessagesFromSQS called", queue, deleteAfterReceive);

  const url = `https://sqs.${process.env.AWS_REGION}.amazonaws.com/${queue}`;

  const params = {
    QueueUrl: url, 
    MaxNumberOfMessages: 10, // Max number of messages to retrieve
    VisibilityTimeout: 20, // Visibility timeout in seconds
    WaitTimeSeconds: 10 // Long polling wait time in seconds
  };

  try {
    const data = await sqs.receiveMessage(params).promise();

    //console.log(data.Messages);

    if (data.Messages) {
      data.Messages.forEach(async message => {

        const data = JSON.parse(message.Body);

        console.log('Message received:', data);//message.Body

        // After processing the message, delete it from the queue
        if (deleteAfterReceive)
          deleteMessageFromSQS(message.ReceiptHandle);

        if (data.type == 30012 && data.status == "VOICEMAIL") {
          //trigger sync 
          console.log("triggering sync");
          await getAccessToken();
          await connectToDatabase();
          const result = await syncVoiceMails();
          
          console.log("sync result", result);

          /*const downloadResult = await voiceMailModel.find({ s3_file_path: { $exists: false } })
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
                            })*
                            .catch(error => {
                                console.error('Error updating document:', error);
                                
                                /*return {
                                    "operation": "error",
                                    "message": 'Error updating document:' + error
                                };*
                            });
                    }
                }
            })
            .catch(error => {
                console.error('Error finding documents:', error);
                //process.exit();
                /*return {
                    "operation": "error",
                    "message": 'Error finding documents:' + error
                };*
            });   

          console.log("download result", downloadResult);  */
      }
      });
 
    } else {
      console.log('No messages to receive');
    }
  } catch (error) {
    console.error('Error receiving messages:', error);
    
  } finally {
    // Continue polling
    setImmediate(receiveMessagesFromSQS);
  }
};

const deleteMessageFromSQS = async (receiptHandle) => {
  const deleteParams = {
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/YourQueueName', // Replace with your SQS Queue URL
    ReceiptHandle: receiptHandle
  };

  try {
    await sqs.deleteMessage(deleteParams).promise();
    console.log('Message deleted successfully');
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};

// Call the function to receive messages
//receiveMessagesFromSQS();

module.exports = {
  sendMessageToSQS,
  receiveMessagesFromSQS,
  deleteMessageFromSQS
}

