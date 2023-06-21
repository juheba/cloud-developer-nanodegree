# Quickstart

## Backend
```sh
npm i    # classic install
```
### 🟢 ONLINE
```sh
sls deploy    # deploy serverless template to aws
MY_IP_ADDRESS=$(curl -s https://checkip.amazonaws.com/) sls deploy  # deploy with environment variables (in this case MY_IP_ADDRESS to substitute the current ip address)

sls remove    # remove infrastructure and cloudformation template from aws

# Connecting to the websocket
# Remember 2gt4tl2bni is a generated api id
wscat -c wss://2gt4tl2bni.execute-api.eu-central-1.amazonaws.com/dev
```
Attention! sls remove - Check if all created resources are deleted:
* GatewayResponseDefault4XX: 'AWS::ApiGateway::GatewayResponse'
* GroupsTable: 'AWS::DynamoDB::Table'
* ImagesTable: 'AWS::DynamoDB::Table'
* ConnectionsTable: 'AWS::DynamoDB::Table'
* ImagesBucket: 'AWS::S3::Bucket'
* BucketPolicy: 'AWS::S3::BucketPolicy'
* ThumbnailsBucket: 'AWS::S3::Bucket'
* SendNotificationPermission: 'AWS::Lambda::Permission'
* ImagesSearch: 'AWS::Elasticsearch::Domain'  ==> creates a EC2 Instance t2 and produces running costs
* ImagesTopic: 'AWS::SNS::Topic'
* SNSTopicPolicy: 'AWS::SNS::TopicPolicy'
* Lambda Functions


### 🔴 OFFLINE
1. go to folder path `/part5-l6-exercise-best-practices/udagram-app`
2. first terminal: sls offline
3. second terminal: sls dynamodb start

```sh
MY_IP_ADDRESS=$(curl -s https://checkip.amazonaws.com/) sls offline  # local deployment hosted on http://localhost:3003

MY_IP_ADDRESS=$(curl -s https://checkip.amazonaws.com/) sls dynamodb start  # start dynamodb hosted on http://localhost:8000
MY_IP_ADDRESS=$(curl -s https://checkip.amazonaws.com/) sls dynamodb seed --seed=users,posts  # You can seed a database with this command
```


## Frontend
```sh
# set base url in config.ts
# Remember set base url of the api gateway (not the base url of websocket)!
npm run start  # hosts on http://localhost:3000/
```

# How to interact with dynamodb without dynamodbs shell
```sh
aws dynamodb help                                              # Help
aws dynamodb list-tables --endpoint-url http://localhost:8000  # List all tables
aws dynamodb describe-table --endpoint-url http://localhost:8000 --table-name groups-dev  # Describe a table by name (with item count)
```
