import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  tracing: true,
  events: [
    {
      http: {
        method: 'get',
        path: 'groups',
        cors: true
      }
    }
  ]
};
