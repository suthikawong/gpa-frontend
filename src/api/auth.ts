import { AppResponse } from '../../gpa-backend/src/app.response'
import { GetCatResponse } from '../../gpa-backend/src/cats/dto/cats.response'
import axios from './axios'

const login = async (email: string, password: string): Promise<AppResponse<GetCatResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
  return response.data
}

export const auth = {
  login,
}
