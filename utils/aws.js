const AWS = require("aws-sdk");
AWS.config.update({region: 'eu-west-1'});

function getAuthObject() {
  let awsAuth = {};
  if (process.env.NODE_ENV == "local") {
    awsAuth = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      apiVersion: "2012-11-05", // this line is important for upload to be performed synchronously
    };
  } else {
    awsAuth = {
      apiVersion: "2012-11-05",
    };
  }
  return awsAuth;
}

const sqs = new AWS.SQS(getAuthObject());

module.exports = sqs;
