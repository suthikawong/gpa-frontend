import {
  GetAssignmentsByClassroomIdRequest,
  GetClassroomByIdRequest,
} from 'gpa-backend/src/classroom/dto/classroom.request'
import {
  GetAssignmentsByClassroomIdResponse,
  GetClassroomByIdResponse,
  GetClassroomsByInstructorResponse,
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

const getAssignmentByClassroomId = async ({
  classroomId,
}: GetAssignmentsByClassroomIdRequest): Promise<AppResponse<GetAssignmentsByClassroomIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/${classroomId}/assignments`)
  return response.data
}

export const classroom = {
  getInstructorClassrooms,
  getClassroomById,
  getAssignmentByClassroomId,
}
