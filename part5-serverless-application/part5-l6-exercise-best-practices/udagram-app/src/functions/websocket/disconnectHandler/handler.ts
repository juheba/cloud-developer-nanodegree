import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { middyfy } from '@libs/lambda';

const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket disconnect: ', event)

  const connectionId = event.requestContext.connectionId
  await deleteConnectionId(connectionId)

  return {
      statusCode: 200,
      body: ''
  }
}

export const main = middyfy(handler);

export async function deleteConnectionId(connectionId: string) {

  var params = {
      TableName : connectionsTable,
      Key: {
          id: connectionId
      }
  };
  console.log('Delete params: ', params)

  await docClient.delete(params).promise()
}