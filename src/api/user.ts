import { AppResponse } from '../../gpa-backend/src/app.response'
import { GetLoggedInUserResponse } from '../../gpa-backend/src/user/dto/user.response'
import axios from './axios'

const getLoggedInUser = async (): Promise<AppResponse<GetLoggedInUserResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`)
  return response.data
}

export const user = {
  getLoggedInUser,
}
