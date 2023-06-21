import { SNSHandler, SNSEvent, S3Event } from "aws-lambda";
import * as AWS  from 'aws-sdk'
import { middyfy } from '@libs/lambda';

var Jimp = require('jimp');

const s3 = new AWS.S3({signatureVersion: 'v4'})

const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

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
    const bucket = record.s3.bucket.name
    const downloadParams = {
      Bucket: bucket,
      Key: key,
    }

    console.log('Processing S3 item: ', downloadParams)
    var body = null
    try {
      const response = await s3.getObject(downloadParams).promise()
      console.log('Body:', response.Body)
      body = response.Body
    } catch (err) {
        console.log(err)
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`
        console.log(message);
        throw new Error(message)
    }

    if (body != null) {
      // Read an image with the Jimp library
      const image = await Jimp.read(body)

      // Resize an image maintaining the ratio between the image's width and height
      image.resize(150, Jimp.AUTO)

      // Convert an image to a buffer that we can write to a different bucket
      const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

      const uploadParams = {
        Bucket: thumbnailBucketName,
        Key: `${key}.jpeg`,
        Body: convertedBuffer
      }
      await s3.putObject(uploadParams).promise()
    }
  }
}

export const main = middyfy(handler);