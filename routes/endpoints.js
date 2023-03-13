const express = require('express');
const sqs = require("../utils/aws");

const router = express.Router();

router.post('/message', express.json(), async function (req, res) {
    try {

        const {billNumber, paymentId} = req.body;
        const message = JSON.stringify(req.body);
        console.log(`Body: '${JSON.stringify(req.body, null, '\t')}'.`);
        const params = {
            MessageBody: message,
            MessageDeduplicationId: String(paymentId),  // Required for FIFO queues
            MessageGroupId: billNumber,  // Required for FIFO queues
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

module.exports = router;
