// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ahb9gjym47'
const region = 'eu-central-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-znkiohxr.eu.auth0.com',           // Auth0 domain
  clientId: 'EGcezutjcUVzmViyrgV5fiLe6pPoY5G8',  // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
