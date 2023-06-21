import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { middyfy } from '@libs/lambda';

const docClient = new AWS.DynamoDB.DocumentClient()
const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let imageId: string;

  try {
    imageId = parseImageParameter(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  const result = await getImage(imageId)

  if (result.Count == 0) {
    return createNotFoundResponse(`Image with \'imageId\' ${imageId} does not exist.`)
  }
  const image = result.Items[0]
  // Return result
  return {
    statusCode: 200,

    body: JSON.stringify({
      image
    })
  }
};

export const main = middyfy(handler);

/**
 * Get value of the imageId path parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {string} value of imageId or "undefined" if the parameter is not defined
 * @throws {Error} if imageId is not a valid (number, null or id is missing)
 */
function parseImageParameter(event) {
  let imageId = event.pathParameters.imageId

  if (imageId === undefined) {
    throw new Error('parameter \'imageId\' is not valid.')
  }
  return imageId
}

async function getImage(imageId: string) {
  const queryParams = {
    TableName: imagesTable,
    IndexName: imageIdIndex,
    KeyConditionExpression: 'imageId = :imageId',
    ExpressionAttributeValues: {
      ':imageId': imageId
    }
  }
  console.log('Query params: ', queryParams)

  const result = await docClient.query(queryParams).promise()
  console.log('Result: ', result)

  return result
}

/**
 * Creates a 400 BAD REQUEST response
 *
 * @param {string} details optional details to describe the error
 *
 * @returns {string} a json stringifed bad request response
 */
function createBadRequestResponse(details) {
  const err = {statusCode:400, errorCode:'T000', message:'Bad request parameter', details}
  return {
    statusCode: 400,
    body: JSON.stringify(err)
  }
}

/**
 * Creates a 404 NOT FOUND response
 *
 * @param {string} details optional details to describe the error
 *
 * @returns {string} a json stringifed not found response
 */
function createNotFoundResponse(details) {
  const err = {statusCode:404, errorCode:'T001', message:'Resource not found', details}
  return {
    statusCode: 404,
    body: JSON.stringify(err)
  }
}