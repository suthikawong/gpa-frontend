import {
  AddGroupMemberRequest,
  CalculateScoreByQassRequest,
  CalculateScoreByWebavaliaRequest,
  CreateGroupRequest,
  CreateRandomGroupsRequest,
  DeleteAllGroupMembersRequest,
  DeleteGroupMemberRequest,
  DeleteGroupRequest,
  GetGroupByIdRequest,
  GetGroupMembersRequest,
  GetScoresRequest,
  GetStudentsWithoutPeerAssessmentRequest,
  JoinGroupRequest,
  LeaveGroupRequest,
  UpdateGroupRequest,
  UpsertScoresRequest,
} from 'gpa-backend/src/group/dto/group.request'
import {
  AddGroupMemberResponse,
  CalculateScoreByQassResponse,
  CalculateScoreByWebavaliaResponse,
  CreateGroupResponse,
  CreateRandomGroupsResponse,
  DeleteAllGroupMembersResponse,
  DeleteGroupMemberResponse,
  DeleteGroupResponse,
  GetGroupByIdResponse,
  GetGroupMembersResponse,
  GetScoresResponse,
  GetStudentsWithoutPeerAssessmentResponse,
  ImportGroupsResponse,
  JoinGroupResponse,
  LeaveGroupResponse,
  UpdateGroupResponse,
  UpsertScoresResponse,
  VerifyImportGroupsResponse,
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

const verifyImportGroups = async (data: FormData): Promise<AppResponse<VerifyImportGroupsResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/verify-import`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

const importGroups = async (data: FormData): Promise<AppResponse<ImportGroupsResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/import`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

const createRandomGroups = async (
  data: CreateRandomGroupsRequest
): Promise<AppResponse<CreateRandomGroupsResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/random`, data)
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

const deleteAllGroupMembers = async ({
  groupId,
}: DeleteAllGroupMembersRequest): Promise<AppResponse<DeleteAllGroupMembersResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/group/${groupId}/member`)
  return response.data
}

const getScores = async ({ groupId }: GetScoresRequest): Promise<AppResponse<GetScoresResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/group/${groupId}/score`)
  return response.data
}

const upsertScore = async (data: UpsertScoresRequest): Promise<AppResponse<UpsertScoresResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/score`, data)
  return response.data
}

const joinGroup = async (data: JoinGroupRequest): Promise<AppResponse<JoinGroupResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/join`, data)
  return response.data
}

const leaveGroup = async (data: LeaveGroupRequest): Promise<AppResponse<LeaveGroupResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/leave`, data)
  return response.data
}

const getStudentsWithoutPeerAssessment = async ({
  groupId,
}: GetStudentsWithoutPeerAssessmentRequest): Promise<AppResponse<GetStudentsWithoutPeerAssessmentResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/group/${groupId}/students/no-rating`)
  return response.data
}

const calculateScoreByQass = async (
  data: CalculateScoreByQassRequest
): Promise<AppResponse<CalculateScoreByQassResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/calculate/qass`, data)
  return response.data
}

const calculateScoreByWebavalia = async (
  data: CalculateScoreByWebavaliaRequest
): Promise<AppResponse<CalculateScoreByWebavaliaResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/group/calculate/webavalia`, data)
  return response.data
}

export const group = {
  getGroupById,
  createGroup,
  importGroups,
  verifyImportGroups,
  createRandomGroups,
  updateGroup,
  deleteGroup,
  getMembersByGroupId,
  addGroupMember,
  deleteGroupMember,
  deleteAllGroupMembers,
  getScores,
  upsertScore,
  joinGroup,
  leaveGroup,
  getStudentsWithoutPeerAssessment,
  calculateScoreByQass,
  calculateScoreByWebavalia,
}
