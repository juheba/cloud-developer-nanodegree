import type { AWS } from '@serverless/typescript';

import getGroups from '@functions/get-groups';
import postGroup from '@functions/post-group';
import getImages from '@functions/get-images';
import getImage from '@functions/get-image';
import postImage from '@functions/post-image';

const serverlessConfiguration: AWS = {
  service: 'udagram-app',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: "aws",
    runtime: 'nodejs14.x',
    region: 'eu-central-1',  // region: '${opt:region, "eu-central-1"}', is buggy - see: https://github.com/serverless/typescript/issues/11
    stage: '${opt:stage, "dev"}',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      GROUPS_TABLE: 'groups-${self:provider.stage}',
      IMAGES_TABLE: 'images-${self:provider.stage}',
      IMAGE_ID_INDEX: 'ImageIdIndex',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Scan",
              "dynamodb:PutItem",
              "dynamodb:GetItem",
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.GROUPS_TABLE}'
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query",
              "dynamodb:PutItem"
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}'
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Query"
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.IMAGES_TABLE}/index/${self:provider.environment.IMAGE_ID_INDEX}'
          },
        ]
      }
    },
  },
  resources: {
    Resources: {
      GroupsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          TableName: '${self:provider.environment.GROUPS_TABLE}',
          AttributeDefinitions: [{
            AttributeName: "id",
            AttributeType: "S",
          }],
          KeySchema: [{
            AttributeName: "id",
            KeyType: "HASH"  // equals to partition key
          }]
        }
      },
      ImagesTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          TableName: '${self:provider.environment.IMAGES_TABLE}',
          AttributeDefinitions: [
            {
              AttributeName: "groupId",
              AttributeType: "S"
            },
            {
              AttributeName: "timestamp",
              AttributeType: "S"
            },
            {
              AttributeName: "imageId",
              AttributeType: "S"
            }
          ],
          KeySchema: [  // Key schema with partition and sort key creates a composite key
            {
              AttributeName: "groupId",
              KeyType: "HASH"  // equals to partition key
            },
            {
              AttributeName: "timestamp",
              KeyType: "RANGE"  // equals to sort key
            }
          ],
          GlobalSecondaryIndexes: [  // Creates a GSI so the imageId can be effectively querried
            {
              IndexName: '${self:provider.environment.IMAGE_ID_INDEX}',
              KeySchema: [
                {
                  AttributeName: "imageId",
                  KeyType: "HASH"
                }
              ],
              Projection: {
                ProjectionType: "ALL"
              }
            }
          ]
        }
      }
    }
  },
  // import the function via paths
  functions: { getGroups, postGroup, getImages, getImage, postImage },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    documentation: {
      api: {
        info: {
          version: 'v.1.0.0',
          title: 'Udagram API',
          description: 'Serverless application for image sharing'
        }
      }
    }
  },
};

module.exports = serverlessConfiguration;
