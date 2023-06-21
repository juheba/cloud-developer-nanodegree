import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    ES_ENDPOINT: { "Fn::GetAtt" : [ "ImagesSearch", "DomainEndpoint" ] }  // GetAtt function from CloudFormation.
  },
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: { "Fn::GetAtt" : [ "ImagesTable", "StreamArn" ] }  // GetAtt function from CloudFormation.
      }
    }
  ]
};
