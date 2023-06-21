const AWS = require('aws-sdk')
const { randomUUID } = require('crypto');

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
    var parsedBody = JSON.parse(event.body)  // body is provided by the rest post-method
    var newItem = {
        id: randomUUID(),
        ...parsedBody
    };
    var params = {
        TableName : groupsTable,
        Item: newItem
    };

    await docClient.put(params).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            newItem
        })
    }
};
