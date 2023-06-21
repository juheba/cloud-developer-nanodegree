import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { middyfy } from '@libs/lambda';

const AWS = require('aws-sdk');
const elasticsearch = require('elasticsearch')
const awsHttpClient = require('http-aws-es')

// https://stackoverflow.com/a/53087961
// There is a problem with the elasticsearch client where it's not able to the pick the region which we specifed in amazonES.region
AWS.config.region = process.env.AWS_REGION;

const es = elasticsearch.Client({
    host: process.env.ES_ENDPOINT,
    connectionClass: awsHttpClient,
    /*amazonES: {
        region: process.env.AWS_REGION,
        credentials: new AWS.Credentials(process.env.MY_AWS_ACCESS_KEY_ID, process.env.MY_AWS_SECRET_ACCESS_KEY)
    }*/
});

const IMAGE_INDEX_NAME = 'images-index'
const IMAGE_MAPPING_TYPE = 'images'

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  // Only for testing purposes - might remove later.
  /*es.ping({
    requestTimeout: 30000,
  }, function (error) {
    if (error) {
      console.error(error)
      console.error('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });*/

  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    if (record.eventName !== 'INSERT') {
      continue
    }
    
    const newItem = record.dynamodb.NewImage
    const imageId = newItem.imageId.S
    const body = {
      imageId: imageId,
      groupId: newItem.groupId.S,
      imageUrl: newItem.imageUrl.S,
      title: newItem.title.S,
      timestamp: newItem.timestamp.S
    }

    await es.index({
      index: IMAGE_INDEX_NAME,
      type: IMAGE_MAPPING_TYPE,
      id: imageId,
      body
    })

  }
}

export const main = middyfy(handler);