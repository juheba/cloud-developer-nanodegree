import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { Group } from "../models/Group";
import { GroupsWithLastKey } from "../models/GroupsWithLastKey";

function createDynamoDBClient(): DocumentClient {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
      secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
    })
  }
  return new AWS.DynamoDB.DocumentClient();
}

export class GroupAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly groupsTable = process.env.GROUPS_TABLE) {
  }

  async getAllGroups(limit: number, nextKey: AWS.DynamoDB.Key): Promise<GroupsWithLastKey> {
    console.log('Getting all groups')

    const scanParams = {
      TableName: this.groupsTable,
      Limit: limit,
      ExclusiveStartKey: nextKey
    }
    const result = await this.docClient.scan(scanParams).promise()
    return {
      groups: result.Items as Group[],
      lastKey: result.LastEvaluatedKey
    }
  }

  async createGroup(group: Group) {
    console.log('Creating a group with id: ', group.id)

    var params = {
        TableName : this.groupsTable,
        Item: group
    };
    await this.docClient.put(params).promise()
    return group
  }

  /**
   * Validates if a group exists.
   *
   * @param groupId  Id of a image group
   * @returns  true if group exists
   * @throws Error if group does not exist
   */
  async validateGroupExists(groupId: string): Promise<Boolean> {
    console.log('Validate group exists: ', groupId)
    const getParams = {
      TableName: this.groupsTable,
      Key: {
        id: groupId
      }
    }

    const result = await this.docClient.get(getParams).promise()

    if (!result.Item) {
      return false
    }

    return true
  }
}