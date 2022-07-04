import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { Image } from "../models/Image";
import { ImagesWithLastKey } from "../models/ImagesWithLastKey";

export class ImageAccess {

  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly imageIdIndex = process.env.IMAGE_ID_INDEX,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET,
    private readonly s3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)) {
  }

  async getAllImagesByGroup(groupId: string, limit: number, nextKey: AWS.DynamoDB.Key): Promise<ImagesWithLastKey> {
    console.log('Getting all images by group')

    const queryParams = {
      TableName: this.imagesTable,
      Limit: limit,
      ExclusiveStartKey: nextKey,
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      },
      /**
       * If ScanIndexForward is true, DynamoDB returns the results in the order in which they are stored (by sort key value). This is the default behavior.
       * If ScanIndexForward is false, DynamoDB reads the results in reverse order by sort key value, and then returns the results to the client.
       */
      ScanIndexForward: false  // reverses the result order, meaning last inserted images comes first
    }
  
    const result = await this.docClient.query(queryParams).promise()
    return {
      images: result.Items as Image[],
      lastKey: result.LastEvaluatedKey
    }
  }

  async getImage(imageId: string): Promise<Image> {
    console.log('Get image')

    const queryParams = {
      TableName: this.imagesTable,
      IndexName: this.imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
        ':imageId': imageId
      }
    }
  
    const result = await this.docClient.query(queryParams).promise()
    return result.Items[0] as Image
  }

  async createImage(image: Image) {
    console.log('Creating a image with id: ', image.imageId)

    var params = {
        TableName : this.imagesTable,
        Item: image
    };
    await this.docClient.put(params).promise()
    return image
  }

  getImageUrl(imageId: string) {
    return `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
  }

  async getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {  // The URL will allow to perform the PUT operation
      Bucket: this.bucketName,
      Key: imageId,
      Expires: this.urlExpiration
    })
  }
}