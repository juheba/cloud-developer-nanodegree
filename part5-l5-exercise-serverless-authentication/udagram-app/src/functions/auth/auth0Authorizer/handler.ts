import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda'
import { middyfy } from '@libs/lambda';
import { verify } from 'jsonwebtoken';
import { JwtToken } from "../../../auth/JwtToken";
import secretsManager from "@middy/secrets-manager";

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD
const region = process.env.REGION

const middySecretConfig = {
  fetchData: {
    AUTH0_SECRET: secretId
  },
  awsClientOptions: {
    region: region,
  },
  cacheExpiry: 60000,
  setToContext: true
}

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  context: any
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Processing authorizer event', JSON.stringify(event))
  try {
    const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])
    console.log('User was authorized')
    return {
      principalId: decodedToken.sub,
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
  } catch (e) {
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

export const main = middyfy(handler)
  .use(secretsManager(middySecretConfig));

function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, secret) as JwtToken
}