export interface GetImagesByGroupRequest {
  groupId: string,
  limit: number,
  nextKey: AWS.DynamoDB.Key
}