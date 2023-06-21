import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { middyfy } from '@libs/lambda';

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect: ', event)

  const connectionId = event.requestContext.connectionId
  const timestamp = new Date().toISOString()
  await saveConnectionId(connectionId, timestamp)

  return {
      statusCode: 200,
      body: ''
  }
}

export const main = middyfy(handler);

async function saveConnectionId(connectionId: string, timestamp: string) {
  var newItem = {
      id: connectionId,
      timestamp
  };
  var params = {
      TableName : connectionsTable,
      Item: newItem
  };
  console.log('Put params: ', params)

  await docClient.put(params).promise()
  return newItem
}