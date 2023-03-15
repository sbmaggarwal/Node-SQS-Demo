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

module.exports = router;
