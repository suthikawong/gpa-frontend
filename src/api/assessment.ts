import {
  CheckScoringComponentActiveRequest,
  ConfirmStudentJoinAssessmentRequest,
  CreateAssessmentRequest,
  DeleteAssessmentRequest,
  GetAssessmentByIdRequest,
  GetGroupsByAssessmentIdRequest,
  GetScoringComponentsByAssessmentIdRequest,
  GetStudentJoinedGroupRequest,
  RemoveStudentFromAssessmentRequest,
  SearchStudentsInAssessmentRequest,
  StudentJoinAssessmentRequest,
  UpdateAssessmentRequest,
} from 'gpa-backend/src/assessment/dto/assessment.request'
import {
  CheckScoringComponentActiveResponse,
  ConfirmStudentJoinAssessmentResponse,
  CreateAssessmentResponse,
  DeleteAssessmentResponse,
  GetAssessmentByIdResponse,
  GetAssessmentsByInstructorResponse,
  GetAssessmentsByStudentResponse,
  GetGroupsByAssessmentIdResponse,
  GetScoringComponentsByAssessmentIdResponse,
  GetStudentJoinedGroupResponse,
  RemoveStudentFromAssessmentResponse,
  SearchStudentsInAssessmentResponse,
  StudentJoinAssessmentResponse,
  UpdateAssessmentResponse,
} from 'gpa-backend/src/assessment/dto/assessment.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getAssessmentsByInstructor = async (): Promise<AppResponse<GetAssessmentsByInstructorResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/instructor`)
  return response.data
}

const getAssessmentsByStudent = async (): Promise<AppResponse<GetAssessmentsByStudentResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/student`)
  return response.data
}

const getAssessmentById = async ({
  assessmentId,
}: GetAssessmentByIdRequest): Promise<AppResponse<GetAssessmentByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}`)
  return response.data
}

const createAssessment = async (data: CreateAssessmentRequest): Promise<AppResponse<CreateAssessmentResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/assessment`, data)
  return response.data
}

const updateAssessment = async (data: UpdateAssessmentRequest): Promise<AppResponse<UpdateAssessmentResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/assessment`, data)
  return response.data
}

const deleteAssessment = async ({
  assessmentId,
}: DeleteAssessmentRequest): Promise<AppResponse<DeleteAssessmentResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}`)
  return response.data
}

const searchStudentsInAssessment = async (
  params: SearchStudentsInAssessmentRequest
): Promise<AppResponse<SearchStudentsInAssessmentResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/student/search`, { params })
  return response.data
}

const confirmStudentJoinAssessment = async (
  data: ConfirmStudentJoinAssessmentRequest
): Promise<AppResponse<ConfirmStudentJoinAssessmentResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/assessment/confirm`, data)
  return response.data
}

const removeStudentFromAssessment = async ({
  assessmentId,
  studentUserId,
}: RemoveStudentFromAssessmentRequest): Promise<AppResponse<RemoveStudentFromAssessmentResponse>> => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}/student/${studentUserId}`
  )
  return response.data
}

const getGroupsByAssessmentId = async ({
  assessmentId,
}: GetGroupsByAssessmentIdRequest): Promise<AppResponse<GetGroupsByAssessmentIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}/groups`)
  return response.data
}

const getScoringComponentsByAssessmentId = async ({
  assessmentId,
}: GetScoringComponentsByAssessmentIdRequest): Promise<AppResponse<GetScoringComponentsByAssessmentIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}/scoring-components`)
  return response.data
}

const studentJoinAssessment = async (
  data: StudentJoinAssessmentRequest
): Promise<AppResponse<StudentJoinAssessmentResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/assessment/join`, data)
  return response.data
}

const getJoinedGroup = async ({
  assessmentId,
}: GetStudentJoinedGroupRequest): Promise<AppResponse<GetStudentJoinedGroupResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}/group/joined`)
  return response.data
}

const checkScoringComponentActive = async ({
  assessmentId,
}: CheckScoringComponentActiveRequest): Promise<AppResponse<CheckScoringComponentActiveResponse>> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/assessment/${assessmentId}/scoring-component/check`
  )
  return response.data
}

export const assessment = {
  getAssessmentsByInstructor,
  getAssessmentsByStudent,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  searchStudentsInAssessment,
  confirmStudentJoinAssessment,
  removeStudentFromAssessment,
  getGroupsByAssessmentId,
  getScoringComponentsByAssessmentId,
  studentJoinAssessment,
  getJoinedGroup,
  checkScoringComponentActive,
}
