const Consumer = require('sqs-consumer').Consumer;
const sqs = require("../utils/aws");

// delay example function
const delay = time => new Promise(res => setTimeout(res, time));

const app = Consumer.create({
    queueUrl: process.env.QUEUE_URL,
    handleMessage: async (message) => {
        console.log(`1st consumer message: '${JSON.stringify(message.Body, null, '\t')}'.`);
    },
    sqs: sqs,
    waitTimeSeconds: 0.1,
});

app.on('error', (err) => {
    console.error(`Error: ${err.message}`);
});

app.on('processing_error', (err) => {
    console.error(err.message);
});

app.on('timeout_error', (err) => {
    console.error(err.message);
});

app.start();