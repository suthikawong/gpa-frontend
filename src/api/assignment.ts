import {
  CreateAssignmentRequest,
  DeleteAssignmentRequest,
  GetAssignmentByIdRequest,
  GetGroupsByAssignmentIdRequest,
  UpdateAssignmentRequest,
} from 'gpa-backend/src/assignment/dto/assignment.request'
import {
  CreateAssignmentResponse,
  DeleteAssignmentResponse,
  GetAssignmentByIdResponse,
  GetGroupsByAssignmentIdResponse,
  UpdateAssignmentResponse,
} from 'gpa-backend/src/assignment/dto/assignment.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getAssignmentById = async ({
  assignmentId,
}: GetAssignmentByIdRequest): Promise<AppResponse<GetAssignmentByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assignment/${assignmentId}`)
  return response.data
}

const createAssignment = async (data: CreateAssignmentRequest): Promise<AppResponse<CreateAssignmentResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/assignment`, data)
  return response.data
}

const updateAssignment = async (data: UpdateAssignmentRequest): Promise<AppResponse<UpdateAssignmentResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/assignment`, data)
  return response.data
}

const deleteAssignment = async ({
  assignmentId,
}: DeleteAssignmentRequest): Promise<AppResponse<DeleteAssignmentResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/assignment/${assignmentId}`)
  return response.data
}

const getGroupsByAssignmentId = async ({
  assignmentId,
}: GetGroupsByAssignmentIdRequest): Promise<AppResponse<GetGroupsByAssignmentIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assignment/${assignmentId}/groups`)
  return response.data
}

// const searchStudentsInClassroom = async (
//   params: SearchStudentsInClassroomRequest
// ): Promise<AppResponse<SearchStudentsInClassroomResponse>> => {
//   const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/student/search`, { params })
//   return response.data
// }

export const assignment = {
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getGroupsByAssignmentId,
  // searchStudentsInClassroom,
}
