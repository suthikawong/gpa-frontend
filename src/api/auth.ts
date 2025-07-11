import { AppResponse } from '../../gpa-backend/src/app.response'
import { RegisterRequest } from '../../gpa-backend/src/auth/dto/auth.request'
import { LoginResponse, RegisterResponse } from '../../gpa-backend/src/auth/dto/auth.response'
import axios from './axios'

const login = async (data: { email: string; password: string }): Promise<AppResponse<LoginResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, data)
  return response.data
}

const logout = async () => {
  await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`)
}

const register = async (data: RegisterRequest): Promise<AppResponse<RegisterResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, data)
  return response.data
}

export const auth = {
  login,
  logout,
  register,
}
