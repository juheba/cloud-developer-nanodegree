import { SNSHandler, SNSEvent, S3Event } from "aws-lambda";
import { middyfy } from '@libs/lambda';
import { deleteConnectionId } from '@functions/websocket/disconnectHandler/handler'

const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const region = process.env.REGION
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.${region}.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event: ', JSON.stringify(event))

  for (const record of event.Records) {
    const s3EventStr = record.Sns.Message
    console.log('Processing S3 event: ', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)
    await processS3Event(s3Event)
  }
}

async function processS3Event(event: S3Event) {
  for (const record of event.Records) {
    const key = record.s3.object.key
    console.log('Processing S3 item with key: ', key)

    const connections = await getConnectionIds()

    const payload = {
      imageId: key
    }

    for (const connection of connections.Items) {
      const connectionId = connection.id
      await sendMessageToClient(connectionId, payload)
    }
  }

}

export const main = middyfy(handler);

async function sendMessageToClient(connectionId: string, payload: object) {
  try {
    console.log('Sending message to connection: ', connectionId)
    const postParams = {
      ConnectionId: connectionId,
      Data: JSON.stringify(payload)
    }
    console.log('Post params: ', postParams)
    return await apiGateway.postToConnection(postParams).promise()
  } catch (e) {
    console.log('Failed to send message: ', JSON.stringify(e))
    if (e.statusCode === 410) {  // 410 GONE: when a connectionId is still in the db but the client disconnected.
      console.log(`Stale connection - connectionId ${deleteConnectionId} found but client is disconnected.`)
      await deleteConnectionId(connectionId)
    }
  }
}

async function getConnectionIds() {

  const scanParams = {
    TableName: connectionsTable
  }
  console.log('Scan params: ', scanParams)

  return await docClient.scan(scanParams).promise()
}
