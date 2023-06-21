import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from '@libs/lambda';

import { getImagesByGroup } from "../../../businessLogic/Images";
import { validateGroupExists } from "../../../businessLogic/Groups";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let groupId: string;
  let limit: number;
  let nextKey: AWS.DynamoDB.Key;

  try {
    groupId = parseGroupParameter(event)
    limit = parseLimitParameter(event)  // Maximum number of elements to return
    nextKey = parseNextKeyParameter(event)  // Next key to continue scan operation if necessary
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  if (!await validateGroupExists(groupId)) {
    return createNotFoundResponse(`Group with \'groupId\' ${groupId} does not exist.`)
  }

  const result = await getImagesByGroup({groupId, limit, nextKey})

  // Return result
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: result.images,
      nextKey: encodeNextKey(result.lastKey)
    })
  }
};

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

  console.log(groupId)
  console.log(!isNaN(groupId))
  console.log(groupId === undefined)

  if (!isNaN(groupId) || groupId === undefined) {
    throw new Error('parameter \'groupId\' is not valid.')
  }
  return groupId
}

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
    if (nextKey == null || nextKey.timestamp === undefined || nextKey.groupId === undefined) {
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
 * @param details optional details to describe the error
 *
 * @returns {string} a json stringifed bad request response
 */
function createBadRequestResponse(details: string) {
  const err = {statusCode:400, errorCode:'T000', message:'Bad request parameter', details}
  return {
    statusCode: 400,
    body: JSON.stringify(err)
  }
}

/**
 * Creates a 404 NOT FOUND response
 *
 * @param details optional details to describe the error
 *
 * @returns {string} a json stringifed not found response
 */
function createNotFoundResponse(details: string) {
  const err = {statusCode:404, errorCode:'T001', message:'Resource not found', details}
  return {
    statusCode: 404,
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