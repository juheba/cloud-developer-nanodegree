import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { middyfy } from '@libs/lambda';

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let limit: number;
  let nextKey: AWS.DynamoDB.Key;

  try {
    limit = parseLimitParameter(event)  // Maximum number of elements to return
    nextKey = parseNextKeyParameter(event)  // Next key to continue scan operation if necessary
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  // Scan operation parameters

  const scanParams = {
    TableName: groupsTable,
    Limit: limit,
    ExclusiveStartKey: nextKey
  }
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  console.log('Result: ', result)
  const items = result.Items

  // Return result
  return {
    statusCode: 200,
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
};

export const main = middyfy(handler);

/**
 * Get value of the limit query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {string} value of limit or "undefined" if the parameter is not defined
 * @throws {Error} if limit is not a number or limit is a negative number
 */
function parseLimitParameter(event) {
  let limit = getQueryParameter(event, 'limit')

  if (limit !== undefined) {
    limit = parseInt(limit)
    if (isNaN(limit)) {
      throw new Error('parameter \'limit\' is not a number.')
    }
    if (limit <= 0) {
      throw new Error('parameter \'limit\' must be a positive number.')
    }
  }
  return limit
}

/**
 * Get value of the nextKey query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns {string} value of nextKey or "undefined" if the parameter is not defined
 * @throws {Error} if decoded nextKey is not a valid (null or id is missing)
 */
function parseNextKeyParameter(event) {
  let nextKey = getQueryParameter(event, 'nextKey')

  if (nextKey !== undefined) {
    nextKey = decodeNextKey(nextKey)
    if (nextKey == null || nextKey.id === undefined) {
      throw new Error('parameter \'nextKey\' is not valid.')
    }
  }
  return nextKey
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
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
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}

/**
 * Decode next key
 *
 * @param {string} nextKey a string that represents a URI encoded next key
 *
 * @return {Object} last key as JSON Object
 */
function decodeNextKey(nextKey) {
  if (!nextKey) {
    return null
  }
  return JSON.parse(decodeURIComponent(nextKey));
}