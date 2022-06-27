import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
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
