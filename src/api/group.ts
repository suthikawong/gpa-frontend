import {
  AddGroupMemberRequest,
  CreateGroupRequest,
  DeleteGroupMemberRequest,
  DeleteGroupRequest,
  GetGroupByIdRequest,
  GetGroupMembersRequest,
  UpdateGroupRequest,
} from 'gpa-backend/src/group/dto/group.request'
import {
  AddGroupMemberResponse,
  CreateGroupResponse,
  DeleteGroupMemberResponse,
  DeleteGroupResponse,
  GetGroupByIdResponse,
  GetGroupMembersResponse,
  UpdateGroupResponse,
} from 'gpa-backend/src/group/dto/group.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getGroupById = async ({ groupId }: GetGroupByIdRequest): Promise<AppResponse<GetGroupByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/group/${groupId}`)
  return response.data
}

const createGroup = async (data: CreateGroupRequest): Promise<AppResponse<CreateGroupResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group`, data)
  return response.data
}

const updateGroup = async (data: UpdateGroupRequest): Promise<AppResponse<UpdateGroupResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/group`, data)
  return response.data
}

const deleteGroup = async ({ groupId }: DeleteGroupRequest): Promise<AppResponse<DeleteGroupResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/group/${groupId}`)
  return response.data
}

const getMembersByGroupId = async ({
  groupId,
}: GetGroupMembersRequest): Promise<AppResponse<GetGroupMembersResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/group/${groupId}/member`)
  return response.data
}

const addGroupMember = async ({
  groupId,
  studentUserId,
}: AddGroupMemberRequest): Promise<AppResponse<AddGroupMemberResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/member`, { groupId, studentUserId })
  return response.data
}

const deleteGroupMember = async ({
  groupId,
  studentUserId,
}: DeleteGroupMemberRequest): Promise<AppResponse<DeleteGroupMemberResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/group/${groupId}/member/${studentUserId}/`)
  return response.data
}

export const group = {
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getMembersByGroupId,
  addGroupMember,
  deleteGroupMember,
}
