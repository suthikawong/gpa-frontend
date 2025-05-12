import { AppResponse } from '../../gpa-backend/src/app.response'
import { LoginResponse } from '../../gpa-backend/src/auth/dto/auth.response'
import axios from './axios'

const login = async (email: string, password: string): Promise<AppResponse<LoginResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password })
  return response.data
}

const logout = async () => {
  await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`)
}

export const auth = {
  login,
  logout,
}
