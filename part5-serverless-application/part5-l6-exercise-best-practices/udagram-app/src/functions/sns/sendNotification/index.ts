import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  tracing: true,
  environment: {
    STAGE: '${self:provider.stage}',
    API_ID: { Ref: 'WebsocketsApi'}  // Ref function from CloudFormation
  },
  events: [
    {
      sns: {
        topicName: '${self:custom.snsTopicName}',
        arn: {
          'Fn::Join' : [ ':', [
            'arn:aws:sns',
            {Ref: 'AWS::Region'},
            {Ref: 'AWS::AccountId'},
            '${self:custom.snsTopicName}'
          ] ]
        }
      }
    }
  ]
};
