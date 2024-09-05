require('dotenv').config()
const AWS = require('aws-sdk');
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
  } catch (error) {
    console.error('Error sending message:', error);
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

    if (data.Messages) {
      data.Messages.forEach(message => {
        console.log('Message received:', message.Body);

        // After processing the message, delete it from the queue
        if (deleteAfterReceive)
          deleteMessageFromSQS(message.ReceiptHandle);
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

