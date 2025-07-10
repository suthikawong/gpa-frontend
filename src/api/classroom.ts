import {
  CreateClassroomRequest,
  DeleteClassroomRequest,
  GetAssignmentsByClassroomIdRequest,
  GetClassroomByIdRequest,
  RemoveStudentFromClassroomRequest,
  SearchStudentsInClassroomRequest,
  UpdateClassroomRequest,
} from 'gpa-backend/src/classroom/dto/classroom.request'
import {
  CreateClassroomResponse,
  DeleteClassroomResponse,
  GetAssignmentsByClassroomIdResponse,
  GetClassroomByIdResponse,
  GetClassroomsByInstructorResponse,
  RemoveStudentFromClassroomResponse,
  SearchStudentsInClassroomResponse,
  UpdateClassroomResponse,
} from 'gpa-backend/src/classroom/dto/classroom.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getInstructorClassrooms = async (): Promise<AppResponse<GetClassroomsByInstructorResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/instructor`)
  return response.data
}

const getClassroomById = async ({
  classroomId,
}: GetClassroomByIdRequest): Promise<AppResponse<GetClassroomByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/${classroomId}`)
  return response.data
}

const createClassroom = async (data: CreateClassroomRequest): Promise<AppResponse<CreateClassroomResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/classroom`, data)
  return response.data
}

const updateClassroom = async (data: UpdateClassroomRequest): Promise<AppResponse<UpdateClassroomResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/classroom`, data)
  return response.data
}

const deleteClassroom = async ({
  classroomId,
}: DeleteClassroomRequest): Promise<AppResponse<DeleteClassroomResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/classroom/${classroomId}`)
  return response.data
}

const getAssignmentByClassroomId = async ({
  classroomId,
}: GetAssignmentsByClassroomIdRequest): Promise<AppResponse<GetAssignmentsByClassroomIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/${classroomId}/assignments`)
  return response.data
}

const searchStudentsInClassroom = async (
  params: SearchStudentsInClassroomRequest
): Promise<AppResponse<SearchStudentsInClassroomResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/student/search`, { params })
  return response.data
}

const removeStudentFromClassroom = async ({
  classroomId,
  studentUserId,
}: RemoveStudentFromClassroomRequest): Promise<AppResponse<RemoveStudentFromClassroomResponse>> => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/classroom/${classroomId}/student/${studentUserId}`
  )
  return response.data
}

export const classroom = {
  getInstructorClassrooms,
  getClassroomById,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getAssignmentByClassroomId,
  searchStudentsInClassroom,
  removeStudentFromClassroom,
}
