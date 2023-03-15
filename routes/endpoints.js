const express = require('express');
const sqs = require("../utils/aws");

const router = express.Router();

router.post('/message', express.json(), async function (req, res) {
    try {

        const {groupId, uniqueIdentifier} = req.body;
        const message = JSON.stringify(req.body);
        console.log(`Body: '${JSON.stringify(req.body, null, '\t')}'.`);
        const params = {
            MessageBody: message,
            MessageDeduplicationId: String(uniqueIdentifier),  // Required for FIFO queues
            MessageGroupId: groupId,  // Required for FIFO queues
            QueueUrl: process.env.QUEUE_URL
        };

        sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                res.status(500).send({message: 'Error occurred', success: false});
            } else {
                console.log("Success", data.MessageId);
                res.status(200).send({message: 'Message Sent', success: true});
            }
        });

    } catch (err) {
        res.status(500).send(err)
    }
});

router.post('/check', express.json(), async function (req, res) {
    try {

        const {queueName} = req.body;

        const params = {
            QueueName: queueName
        };

        sqs.getQueueUrl(params, function (err, data) {
            if (err) res.status(500).send(err); // an error occurred
            else res.status(200).send(data);           // successful response
        });

    } catch (err) {
        res.status(500).send(err)
    }
});

router.post('/create', express.json(), async function (req, res) {
    try {

        const {queueName} = req.body;

        const params = {
            QueueName: queueName,
            Attributes: {
                'FifoQueue': 'true',
                'DeduplicationScope': 'messageGroup',
                'SqsManagedSseEnabled': 'false',
            }
        };

        sqs.createQueue(params, function (err, data) {
            if (err) res.status(500).send(err); // an error occurred
            else res.status(200).send(data);           // successful response
        });

    } catch (err) {
        res.status(500).send(err)
    }
});

router.post('/setget', express.json(), async function (req, res) {
    try {

        const {groupId, uniqueIdentifier} = req.body;
        const message = JSON.stringify(req.body);
        console.log(`Body: '${message}'.`);
        const params = {
            MessageBody: message,
            MessageDeduplicationId: String(uniqueIdentifier),  // Required for FIFO queues
            MessageGroupId: groupId,  // Required for FIFO queues
            QueueUrl: process.env.QUEUE_URL
        };

        sqs.sendMessage(params, function (err, data) {
            if (err) {
                console.log("Error", err);
                res.status(500).send({message: 'Error occurred', success: false});
            } else {
                console.log("Success", data.MessageId);

                const newMessage = receiveMessage();

                res.status(200).send(newMessage);
            }
        });

    } catch (err) {
        res.status(500).send(err)
    }
});

const receiveMessage = async () => {
    const params = {
        QueueUrl: process.env.QUEUE_URL,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 0.25
    };

    sqs.receiveMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
            return {message: 'No message found.', success: false};
        } else if (data.Messages && data.Messages.length > 0 && data.Messages[0].Body) {
            console.log(`Success: '${JSON.stringify(data.Messages[0].Body)}'.`);
            return data.Messages[0].Body;
        }
    });
}

module.exports = router;
