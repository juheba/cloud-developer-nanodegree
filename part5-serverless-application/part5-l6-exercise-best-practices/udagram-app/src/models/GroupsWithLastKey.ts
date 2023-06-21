import { Group } from "./Group";

export interface GroupsWithLastKey {
  groups: Group[],
  lastKey: AWS.DynamoDB.DocumentClient.Key
}