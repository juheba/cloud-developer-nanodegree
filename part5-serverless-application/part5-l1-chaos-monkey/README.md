# Lesson 1: Chaos Monkey Lambda Function

This is a light version of a chaos monkey - a lambda function that terminates a random EC2 instace.

## Setup
* Create a lambda function in aws
* Checkout the project & create a zip file
    ```
    npm i --production
    npm run package
    ```
* Upload zip file as lambda code
* Edit the lambda functions policy role and attach permissions from `iam-policy.json`
* Create two EC2 instances
* Create a EventBridge and call every 5 mins the lambda function