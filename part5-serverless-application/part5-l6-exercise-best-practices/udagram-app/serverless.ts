import type { AWS } from '@serverless/typescript';

import { asymmetricRS256Authorizer as auth0Authorizer } from '@functions/auth'
import { getGroups, postGroup, getImages, getImage, postImage } from '@functions/index'
import { sendNotification, resizeImage } from '@functions/sns'
import elasticSearchSync from "@functions/elastic/elasticSearchSync"
import { connectHandler, disconnectHandler } from '@functions/websocket'

const serverlessConfiguration: AWS = {
  service: 'udagram-app',
  frameworkVersion: '3',
  plugins: [
    'serverless-esbuild',
    //'serverless-reqvalidator',
    'serverless-aws-documentation',
    'serverless-plugin-tracing',
    'serverless-plugin-canary-deployments',
    'serverless-dynamodb-local',
    'serverless-offline'
  ],
  provider: {
    name: "aws",
    runtime: 'nodejs14.x',
    region: 'eu-central-1',  // region: '${opt:region, "eu-central-1"}', is buggy - see: https://github.com/serverless/typescript/issues/11
    stage: '${opt:stage, "dev"}',
    tracing: {
      lambda: true,
      apiGateway: true
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      MY_IP_ADDRESS: '${env:MY_IP_ADDRESS}',  // get current ip address and deploy with: MY_IP_ADDRESS=$(curl https://checkip.amazonaws.com/) sls deploy
      REGION: '${self:provider.region}',
      STAGE: '${self:provider.stage}',
      AUTH_0_SECRET_ID: 'Auth0Secret-${self:provider.stage}',
      AUTH_0_SECRET_FIELD: 'auth0Secret',
      GROUPS_TABLE: 'groups-${self:provider.stage}',
      IMAGES_TABLE: 'images-${self:provider.stage}',
      IMAGE_ID_INDEX: 'ImageIdIndex',
      CONNECTIONS_TABLE: 'connections-${self:provider.stage}',
      IMAGES_S3_BUCKET: 'juheba-udagram-images-${self:provider.stage}',
      THUMBNAILS_S3_BUCKET: 'juheba-udagram-thumbnail-${self:provider.stage}',
      SIGNED_URL_EXPIRATION: '300',
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
          {
            Effect: "Allow",
            Action: [
              "s3:GetObject",
              "s3:PutObject"
            ],
            Resource: 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*'
          },
          {
            Effect: "Allow",
            Action: [
              "s3:PutObject"
            ],
            Resource: 'arn:aws:s3:::${self:provider.environment.THUMBNAILS_S3_BUCKET}/*'
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:Scan",
              "dynamodb:PutItem",
              "dynamodb:DeleteItem"
            ],
            Resource: 'arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.CONNECTIONS_TABLE}'
          },
          {
            Effect: "Allow",
            Action: [
              "es:ESHttpGet",
              "es:ESHttpPost",
              "es:ESHttpPut"
            ],
            Resource: 'arn:aws:es:${self:provider.region}:*:domain/images-search-${self:provider.stage}/*'
          },
          {
            Effect: "Allow",
            Action: [ "secretsmanager:GetSecretValue" ],
            Resource: { Ref: 'Auth0Secret' }
          },
          {
            Effect: "Allow",
            Action: [ "kms:Decrypt" ],
            Resource: { "Fn::GetAtt" : [ "KMSKey", "Arn" ] }
          },
          {
            Effect: "Allow",
            Action: [ "codedeploy:*" ],
            Resource: '*'
          }
        ]
      }
    },
  },
  resources: {
    Resources: {
      GatewayResponseDefault4XX: {
        Type : "AWS::ApiGateway::GatewayResponse",
        Properties : {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS,POST'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: { Ref: 'ApiGatewayRestApi'},
        }
      },
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
          StreamSpecification: {
            StreamViewType: "NEW_IMAGE"
          },
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
      },
      ConnectionsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          TableName: '${self:provider.environment.CONNECTIONS_TABLE}',
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
      ImagesBucket: {
        Type: 'AWS::S3::Bucket',
        DependsOn: ['ImagesTopic','SNSTopicPolicy'],
        Properties: {
          BucketName: '${self:provider.environment.IMAGES_S3_BUCKET}',
          NotificationConfiguration: {
            /*LambdaConfigurations: [  // Comment out LambdaConfiguration because we now use SNS TopicConfiguration
              {
                Event: 's3:ObjectCreated:*',
                // In this file the resource is called 'SendNotification' but CloudFormation adds a 'LambdaFunction'-suffix to it.
                Function: { "Fn::GetAtt" : [ "SendNotificationLambdaFunction", "Arn" ] }  // GetAtt function from CloudFormation.
              }
            ],*/
            TopicConfigurations: [
              {
                Event: 's3:ObjectCreated:*',
                Topic: { 'Ref' : 'ImagesTopic' }
              }
            ]
          },
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET','PUT','POST','DELETE','HEAD'],
                MaxAge: 3000
              }
            ]
          },
          PublicAccessBlockConfiguration: {
            BlockPublicPolicy: false,
            RestrictPublicBuckets: false
          }
        }
      },
      BucketPolicy: {  // Configures the bucket to be public
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: 'ImagesBucketPolicy',
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicReadForGetBucketObjects',
                Effect: 'Allow',
                Principal: '*',
                Action: 's3:GetObject',
                Resource: 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}/*'
              }
            ]
          },
          Bucket: { "Ref" : "ImagesBucket" }  // Ref function from CloudFormation
        }
      },
      ThumbnailsBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.THUMBNAILS_S3_BUCKET}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET','PUT','POST','DELETE','HEAD'],
                MaxAge: 3000
              }
            ]
          }
        }
      },
      SendNotificationPermission: {
        Type: 'AWS::Lambda::Permission',
        Properties: {
            FunctionName: { 'Fn::GetAtt': ['SendNotificationLambdaFunction','Arn'] },
            Action: 'lambda:InvokeFunction',
            Principal: 's3.amazonaws.com',
            SourceAccount: { 'Ref': 'AWS::AccountId' },
            SourceArn: 'arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}'
        }
      },
      ImagesSearch: {
        Type: 'AWS::Elasticsearch::Domain',
        Properties: {
          ElasticsearchVersion: '6.3',
          DomainName: 'images-search-${self:provider.stage}',
          ElasticsearchClusterConfig: {
            DedicatedMasterEnabled: false,
            InstanceCount: 1,
            ZoneAwarenessEnabled: false,
            InstanceType: 't2.small.elasticsearch'
          },
          EBSOptions: {
            EBSEnabled: true,
            Iops: 0,
            VolumeSize: 10,
            VolumeType: 'gp2'
          },
          AccessPolicies: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['es:*','es:ESHttp*','es:ESHttpGet','es:ESHttpPost'],
                /* To get rid of the serverless deploy (sls deploy) error:
                    > UPDATE_FAILED: ImagesSearch (AWS::Elasticsearch::Domain)
                    > Apply a restrictive access policy to your domain (Service: AWSElasticsearch; Status Code: 400; Error Code: ValidationException; ...)
                  Specifying the resource isn't enough. I had to provide a condition with my ip address aswell. */
                Resource: { "Fn::Sub": "arn:aws:es:${self:provider.region}:${AWS::AccountId}:domain/images-search-${self:provider.stage}/*" },
                Condition: {
                  IpAddress: { 'aws:SourceIp': ['${self:custom.myIpAddress}/32']}
                }
              }
            ]
          }
        }
      },
      ImagesTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'Image bucket topic',
          TopicName: '${self:custom.snsTopicName}'
        }
      },
      SNSTopicPolicy: {
        Type: 'AWS::SNS::TopicPolicy',
        Properties: {
          PolicyDocument: {
            Id: 'ImagesSNSTopicPolicy',
            Version: '2012-10-17',
            Statement: [
              {
                Sid : "PublisherImageBucket",
                Effect: 'Allow',
                Principal: '*',
                Action: 'sns:Publish',
                Resource:  {Ref: 'ImagesTopic'},
                Condition: {
                  ArnLike: {'aws:SourceArn': ['arn:aws:s3:::${self:provider.environment.IMAGES_S3_BUCKET}']}
                }
              }
            ]
          },
          Topics: [ {Ref: 'ImagesTopic'} ]
        }
      },
      KMSKey: {
        Type: 'AWS::KMS::Key',
        Properties: {
          Description: 'KMS key to encrypt Auth0 secret',
          KeyPolicy : {
            Version: '2012-10-17',
            Id: 'key-default-1',
            Statement: [
              {
                Sid: 'Allow administration of the key',
                Effect: 'Allow',
                Principal: {
                  AWS: { 'Fn::Join' : [ ':',
                    [
                      'arn:aws:iam:',
                      { Ref: 'AWS::AccountId' },
                      'root'
                    ]
                  ]}
                },
                Action: [ 'kms:*' ],
                Resource: '*',
              }
            ]
          }
        }
      },
      KMSKeyAlias: {
        Type: 'AWS::KMS::Alias',
        Properties: {
          AliasName: 'alias/auth0Key-${self:provider.stage}',
          TargetKeyId: { Ref: 'KMSKey' }
        }
      },
      Auth0Secret: {
        Type: 'AWS::SecretsManager::Secret',
        Properties: {
          Name: '${self:provider.environment.AUTH_0_SECRET_ID}',
          Description: 'Auth0 secret',
          KmsKeyId: { Ref: 'KMSKey' }
        }
      }
    }
  },
  // import the function via paths
  functions: {
    auth0Authorizer,
    getGroups, postGroup, getImages, getImage, postImage,
    sendNotification,
    resizeImage,
    elasticSearchSync,
    connectHandler, disconnectHandler
  },
  package: { individually: true },
  custom: {
    // Declared these environment variables here to avoid exposing them to AWS (as environment variables of Lambda functions)
    myIpAddress: '${env:MY_IP_ADDRESS}',  // get current ip address and deploy with: MY_IP_ADDRESS=$(curl -s https://checkip.amazonaws.com/) sls deploy
    snsTopicName: 'imagesTopic-${self:provider.stage}',
    "serverless-offline": {
      httpPort: 3003
    },
    dynamodb: {
      start: { 
        port: 8000,
        inMemory: true,
        migrate: true,
      //  seed: true
      },
      // Skipping start: DynamoDB Local is not available for stage: dev
      // We need to whitelist the stage, so that dynamodb is started locally.
      stages: [
        'dev' // whitelist dev-stage
        //'${self:provider.stage}'  // whitelists all stages
      ],
      /*seed: {
        users: {
          sources: [
            {
              table: 'users',
              sources: ['./users.json']
            },
            {
              table: 'user-roles',
              sources: ['./userRoles.json']
            }
          ]
        },
        posts: {
          sources: [
            {
              table: 'blog-posts',
              sources: ['./blogPosts.json']
            }
          ]
        }
      }*/
    },
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
