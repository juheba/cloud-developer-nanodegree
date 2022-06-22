import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    API_ID: {
      Ref: 'WebsocketsApi'
    }
  }
  // TODO: later!
  /*events: [
    {
      s3: {
        bucket: 'bucket-name',
        event: 's3:ObjectCreated:*',
        rules: [
          { prefix: 'images/'},
          { suffix: '.png'}
        ]
      }
    }
  ]*/
};
