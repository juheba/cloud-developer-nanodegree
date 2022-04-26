# Lesson 1: Http Metrics Lambda Function

This lambda function calls a website and reports the response time to CloudWatch.

## Setup
* Create a lambda function in aws
* Checkout the project & create a zip file
    ```
    npm i --production
    npm run package
    ```
* Upload zip file as lambda code
* Create environment variables `SERVICE_NAME` = name of a service (any form of text, has no other purpose than printing) and `URL` = URL of a service to test (can be any website you like)
* Edit the lambda functions policy role and attach permissions from `iam-policy.json`
* Create EventBridge and call every 1 min the lambda function