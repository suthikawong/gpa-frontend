import { ModelLookupResponse } from 'gpa-backend/src/lookup/dto/lookup.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getModels = async (): Promise<AppResponse<ModelLookupResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/lookup/model`)
  return response.data
}

export const lookup = {
  getModels,
}
