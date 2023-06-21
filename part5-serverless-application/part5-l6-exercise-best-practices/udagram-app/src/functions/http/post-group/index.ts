import schema from './schema';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  tracing: true,
  events: [
    {
      http: {
        method: 'post',
        path: 'groups',
        cors: true,
        authorizer: 'auth0Authorizer',  // the lambda function defined as auth0Authorizer, see serverless.ts
        request: {
          schemas: {
            'application/json': schema
          }
        }
      }
    }
  ],
  deploymentSettings: {  // Config for canary deployments
    type: 'Linear10PercentEvery1Minute',
    alias: 'Live'
  }
};
