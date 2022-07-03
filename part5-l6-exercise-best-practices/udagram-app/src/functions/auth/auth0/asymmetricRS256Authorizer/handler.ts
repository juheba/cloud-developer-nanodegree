import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, APIGatewayAuthorizerHandler } from 'aws-lambda'
import { middyfy } from '@libs/lambda';
import { verify, decode } from 'jsonwebtoken';
import { JwtToken } from "../../../../auth/JwtToken";

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJRgCJJ5qLcFZFMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi16bmtpb2h4ci5ldS5hdXRoMC5jb20wHhcNMjIwNjI5MTIzOTI1WhcN
MzYwMzA3MTIzOTI1WjAkMSIwIAYDVQQDExlkZXYtem5raW9oeHIuZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0lywrUhEyW4D03ZI
3mayVUqYc8QWDuRcPhFajOLC+CyvOk+8jWO1IaQY72Y7WKaQtrW3jjTifCt4LrJz
HOL98G0gCJwMfPzIEPZk/lHXGqR/SXfh1O5nzDx8XHIxHGgA8aJVnAE+sq2u9fQI
vw3wLW0oE0EWRDW8zdooMVtCcElAAA8c6L3DcPFVMWmFuAN1Kqvs7Tlj6ue8sBEo
fsOdyktWf2GRxaz1zSpZn1NV4wreqceVUjiaaHdjGOJAIYn2tK50cLxq47DNrDn7
QxZcdnpETUtG6yh++6msoW52kjaxu36i03Zdbm8OUqII9KcDI15LPEYRZgOzgN9u
6W957wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRvl2GNZ3BW
+rNArtczI24vnvA26jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJw63iyp0+mVSFgpg71lN3R2/YW1xCM2xXFphi0CdmxWrtGnUoEw9D0aqEXmzmcC
NSLDRx0q/gX3bJzdR6m+6s/x8Y5Pm8Rw0Con4gV3+F2TWmBT7XUVt+u0os5ywpGq
mdREWll4aeDnhq5Rv8Q5bMZRPworUGO79YrMQGDK5tzfkfVlVv0NRRGR1Vi4hI/i
ZvpQXIYD5YQbfH09dzc257ykaqoTRijw4WviYq1s0Xvjyeakwly2A94WsUHubwi/
QoIvmZnD6wcVx+RgYw+G5e3kTnpf3ajTeOpBa92RpZQ0YV0IVt+E+xgx+X4/GZD/
zJInFZUaQVp5Bb4B4m0z1yg=
-----END CERTIFICATE-----`;

export const handler: APIGatewayAuthorizerHandler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  console.log('Processing authorizer event', JSON.stringify(event))

  try {
    const decodedToken = verifyToken(event.authorizationToken)
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

export const main = middyfy(handler);

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}