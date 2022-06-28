import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda';

export const handler: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('Processing authorizer event', JSON.stringify(event))
  try {
    verifyToken(event.authorizationToken)
    console.log('User was authorized')
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]

      }
    }
  } catch (e ) {
    console.log('User was not authorized', e.message)
  }
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: '*'
        }
      ]

    }
  }
}

export const main = middyfy(handler);

function verifyToken(authHeader: string) {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  if (token != '123') {
    throw new Error('Invalid token')
  }

  // A request has been authorized.
}