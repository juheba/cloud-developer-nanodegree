const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  // Use these variables to record metric values
  let endTime
  let requestWasSuccessful

  const startTime = timeInMs()
  try {
    await axios.get(url)
    requestWasSuccessful = true;
  } catch (error) {
    requestWasSuccessful = false;
  } finally {
    endTime = timeInMs()
  }

  // Record time it took to get a response
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds',
        Value: endTime - startTime
      }
    ],
    Namespace: 'Udacity/Serverless'
  }).promise()

  // Record if a response was successful or not
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Successful',
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Count',
        Value: requestWasSuccessful ? 1 : 0
      }
    ],
    Namespace: 'Udacity/Serverless'
  }).promise()
}

function timeInMs() {
  return new Date().getTime()
}
