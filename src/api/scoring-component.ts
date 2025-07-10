import {
  CreateScoringComponentRequest,
  DeleteScoringComponentRequest,
  GetScoringComponentByIdRequest,
  UpdateScoringComponentRequest,
} from 'gpa-backend/src/scoring-component/dto/scoring-component.request'
import {
  CreateScoringComponentResponse,
  DeleteScoringComponentResponse,
  GetScoringComponentByIdResponse,
  UpdateScoringComponentResponse,
} from 'gpa-backend/src/scoring-component/dto/scoring-component.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getScoringComponentById = async ({
  scoringComponentId,
}: GetScoringComponentByIdRequest): Promise<AppResponse<GetScoringComponentByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/scoring-component/${scoringComponentId}`)
  return response.data
}

const createScoringComponent = async (
  data: CreateScoringComponentRequest
): Promise<AppResponse<CreateScoringComponentResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/scoring-component`, data)
  return response.data
}

const updateScoringComponent = async (
  data: UpdateScoringComponentRequest
): Promise<AppResponse<UpdateScoringComponentResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/scoring-component`, data)
  return response.data
}

const deleteScoringComponent = async ({
  scoringComponentId,
}: DeleteScoringComponentRequest): Promise<AppResponse<DeleteScoringComponentResponse>> => {
  const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/scoring-component/${scoringComponentId}`)
  return response.data
}

export const scoringComponent = {
  getScoringComponentById,
  createScoringComponent,
  updateScoringComponent,
  deleteScoringComponent,
}
