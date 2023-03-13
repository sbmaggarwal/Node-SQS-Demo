const express = require("express");
const app = express();
const endpoint = require("./routes/endpoints");
require("./consumer/sqsConsumer");
require("./consumer/sqsConsumer2");

let nodeEnv = process.env.NODE_ENV;
const isDev = nodeEnv === "development" || nodeEnv === "local";

const cors = require('cors');

app.use(cors());
app.options('*', cors());
app.use("/api/v1/data", endpoint);

app.listen(3005, () => {
    console.log("Server started on port 3005");
});

module.exports = app;
