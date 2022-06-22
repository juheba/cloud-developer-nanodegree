import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { middyfy } from '@libs/lambda';
//import 'source-map-support/register'

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB: ', JSON.stringify(event))
  // Process a batch of records
  for (const record of event.Records) {
    console.log('Processing record: ', JSON.stringify(record))
    /*
    const newItem = record.dynamodb.NewImage  // Modified item
    const id = newItem.id.S  // String attribute
    const count = newItem.count.N  // Number attribute
    // Process a stream record
    */
  }
}

export const main = middyfy(handler);