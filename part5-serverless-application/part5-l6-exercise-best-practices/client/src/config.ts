// set base url of the api gateway (not the base url of websocket)!
export const apiEndpoint = 'https://v54yngwuuc.execute-api.eu-central-1.amazonaws.com/dev'  // AWS eu-central-1
//export const apiEndpoint = 'http://localhost:3003/dev'  // Localhost

export const authConfig = {
  domain: 'dev-znkiohxr.eu.auth0.com',
  //clientId: 'edh4N1hCT466HMUW7mUf98aJcliRyYBG',  // HS256, symmetric
  clientId: 'EGcezutjcUVzmViyrgV5fiLe6pPoY5G8',  // RS256, asymmetric
  callbackUrl: 'http://localhost:3000/callback'
}
