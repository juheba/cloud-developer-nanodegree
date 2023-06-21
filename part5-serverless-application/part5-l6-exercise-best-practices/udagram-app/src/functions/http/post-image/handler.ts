import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { middyfy } from '@libs/lambda';

import { CreateImageRequest } from "../../../requests/CreateImageRequest";
import { createImage, getUploadUrl } from "../../../businessLogic/Images";
import { validateGroupExists } from "../../../businessLogic/Groups";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let groupId: string;
  var parsedBody: CreateImageRequest;

  try {
    groupId = parseGroupParameter(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  if (!await validateGroupExists(groupId)) {
    return createNotFoundResponse(`Group with \'groupId\' ${groupId} does not exist.`)
  }

  try {
    parsedBody = parseBody(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  parsedBody.groupId = groupId

  const newItem = await createImage(parsedBody)
  const uploadUrl = await getUploadUrl(newItem.imageId)

  return {
    statusCode: 201,
    body: JSON.stringify({
        newItem,
        uploadUrl
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

/**
 * Parses a string to a JSON object.
 *
 * @param {Object} event HTTP event passed to a Lambda function
 *
 * @returns JSON representation of the provided string
 * @throws Error if body is undefined or null
 */
 function parseBody(event): CreateImageRequest {
  // The middy plugin already convert API Gateways `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object.
  //var parsedBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body  // Not necessary because of middy plugin

  var parsedBody = event.body
  if (parsedBody === undefined || parsedBody === null) {
    throw new Error('body does not exist.')
  }
  return parsedBody as CreateImageRequest
}