import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from '@libs/lambda';
import { getImage } from "../../../businessLogic/Images";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  let imageId: string;

  try {
    imageId = parseImageParameter(event)
  } catch (e) {
    return createBadRequestResponse(e.message)
  }

  const result = await getImage({imageId})
  if (result == null) {
    return createNotFoundResponse(`Image with \'imageId\' ${imageId} does not exist.`)
  }

  return {
    statusCode: 200,

    body: JSON.stringify({
      image: result
    })
  }
};

export const main = middyfy(handler);

/**
 * Get value of the imageId path parameter or return "undefined"
 *
 * @param event HTTP event passed to a Lambda function
 *
 * @returns value of imageId or "undefined" if the parameter is not defined
 * @throws Error if imageId is not a valid (number, null or id is missing)
 */
function parseImageParameter(event: APIGatewayProxyEvent): string {
  let imageId = event.pathParameters.imageId

  if (imageId === undefined) {
    throw new Error('parameter \'imageId\' is not valid.')
  }
  return imageId
}

/**
 * Creates a 400 BAD REQUEST response
 *
 * @param details optional details to describe the error
 *
 * @returns a json stringifed bad request response
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
 * @returns a json stringifed not found response
 */
function createNotFoundResponse(details: string) {
  const err = {statusCode:404, errorCode:'T001', message:'Resource not found', details}
  return {
    statusCode: 404,
    body: JSON.stringify(err)
  }
}