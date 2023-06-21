import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { randomUUID } from 'crypto'
import { middyfy } from '@libs/lambda';

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let groupId: string;
  var parsedBody: object;

  try {
    groupId = parseGroupParameter(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  try {
    await validateGroupExists(groupId)
  } catch (e) {
    return createNotFoundResponse(e.message)
  }

  try {
    parsedBody = parseBody(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }
  
  var newItem = {
      imageId: randomUUID(),
      groupId: groupId,
      timestamp: new Date().toISOString(),
      ...parsedBody,
  };
  var params = {
      TableName : imagesTable,
      Item: newItem
  };
  console.log('Put params: ', params)
  
  await docClient.put(params).promise()

  return {
    statusCode: 201,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        newItem
    })
  }
}

export const main = middyfy(handler);

/**
 * Get value of the groupId path parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {string} value of groupId or "undefined" if the parameter is not defined
 * @throws {Error} if groupId is not a valid (number, null or id is missing)
 */
 function parseGroupParameter(event) {
  let groupId = event.pathParameters.groupId

  if (!isNaN(groupId) || groupId === undefined) {
    throw new Error('parameter \'groupId\' is not valid.')
  }
  return groupId
}

/**
 * Validates if a group exists.
 *
 * @param {string} groupId  Id of a image group
 * @returns {boolean}  true if group exists
 * @throws {Error}  if group does not exist
 */
async function validateGroupExists(groupId: string) {
  const getParams = {
    TableName: groupsTable,
    Key: {
      id: groupId
    }
  }
  console.log('Get params: ', getParams)

  const result = await docClient.get(getParams).promise()

  console.log('Get group: ', result)

  if (!result.Item) {
    throw new Error(`Group with \'groupId\' ${groupId} does not exist.`)
  }

  return true
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
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
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
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(err)
  }
}

/**
 * Parses a string to a JSON object.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {Object} JSON representation of the provided string
 * @throws {Error} if body is undefined or null
 */
 function parseBody(event) {
  // The middy plugin already convert API Gateways `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object.
  //var parsedBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body  // Not necessary because of middy plugin

  var parsedBody = event.body
  if (parsedBody === undefined || parsedBody === null) {
    throw new Error('body does not exist.')
  }
  return parsedBody
}