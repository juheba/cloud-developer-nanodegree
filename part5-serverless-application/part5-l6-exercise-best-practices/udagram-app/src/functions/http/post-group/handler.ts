import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from '@libs/lambda';

import { createGroup } from "../../../businessLogic/Groups";
import { CreateGroupRequest } from "../../../requests/CreateGroupRequest";


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const authorization = event.headers.Authorization
  const jwtToken = authorization.split(' ')[1]
  

  var parsedBody: CreateGroupRequest;

  try {
    parsedBody = parseBody(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  const newItem = await createGroup(parsedBody, jwtToken)
  
  return {
      statusCode: 201,
      body: JSON.stringify({
          newItem
      })
  }
};

export const main = middyfy(handler);

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