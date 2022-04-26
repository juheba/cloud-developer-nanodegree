# Lesson 2: Image groups webapp

The webapp will be hosted locally to create and show image groups. An API Gateway with rest ist used to call two seperate lambda functions.

## Lambda functions setup

1. lambda function: get-groups
   * Create a lambda function get-groups in aws
   * create a zip file of get-groups and upload the code via cli
     ```
     cd /functions/get-groups
     npm run prod     # installs with --prod and creates zip
     npm run ship-it  # updates aws lambda function with zip
     ```
    * Edit the lambda functions policy role and attach permissions from `get-groups/iam-policy.json`
2. lambda function: post-group
   * create a zip file of post-group and upload the code via cli
     ```
     cd /functions/post-group
     npm run prod     # installs with --prod and creates zip
     npm run ship-it  # updates aws lambda function with zip
     ```
    * Edit the lambda functions policy role and attach permissions from `post-group/iam-policy.json`
* Create a DynamoDB table called `groups`
* Create a API Gateway `groups-api` with a resource `groups`.
  * Create two methods `GET` and `POST`. Use integration-type lambda function and `Lambda-Proxy-Integration`.
  * Activate CORS so a third method `OPTIONS` is created.

All possible commands for `/functions/get-groups` and `/functions/post-group`:
```sh
npm run prod         # installs with --prod and creates zip
npm run package      # only create zip
npm run ship-it      # updates aws lambda function with zip
npm run clean        # only deletes zip
npm run fresh-start  # deletes node_modules, package-lock.json and zip
```

## Web Client setup
The client is hosted locally.
```
npm i --production
npm start           // hosts on http://localhost:3000/
```