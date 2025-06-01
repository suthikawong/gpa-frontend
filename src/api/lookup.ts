import { AppResponse } from '../../gpa-backend/src/app.response'
import { GetInstitutesResponse } from '../../gpa-backend/src/lookup/dto/lookup.response'
import axios from './axios'

const getInstitutes = async (): Promise<AppResponse<GetInstitutesResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/lookup/institutes`)
  return response.data
}

export const lookup = {
  getInstitutes,
}
