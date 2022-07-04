import { randomUUID } from 'crypto'
import { Group } from '../models/Group'
import { GroupsWithLastKey } from "../models/GroupsWithLastKey";
import { GroupAccess } from '../dataLayer/groupAccess'
import { GetGroupsRequest } from '../requests/GetGroupsRequest'
import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { getUserId } from '../auth/utils'

const groupAccess = new GroupAccess()
export async function getAllGroups(getGroupsRequest: GetGroupsRequest): Promise<GroupsWithLastKey> {
  return await groupAccess.getAllGroups(getGroupsRequest.limit, getGroupsRequest.nextKey)
}
export async function createGroup(
  createGroupRequest: CreateGroupRequest,
  jwtToken: string
): Promise <Group> {
  const group = {
    id: randomUUID(),
    userId: getUserId(jwtToken),
    name: createGroupRequest.name,
    description: createGroupRequest.description
  }
  return await groupAccess.createGroup(group)
}

/**
 * Validates if a group exists.
 *
 * @param groupId  Id of a image group
 * @returns  true if group exists
 * @throws Error if group does not exist
 */
export async function validateGroupExists(groupId: string): Promise<Boolean> {
  return await groupAccess.validateGroupExists(groupId)
}