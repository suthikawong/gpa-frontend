import { GetLoggedInUserResponse } from 'gpa-backend/src/auth/dto/auth.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getLoggedInUser = async (): Promise<AppResponse<GetLoggedInUserResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`)
  return response.data
}

export const user = {
  getLoggedInUser,
}
