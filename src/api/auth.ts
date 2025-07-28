import { AppResponse } from '../../gpa-backend/src/app.response'
import {
  ForgotPasswordRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../../gpa-backend/src/auth/dto/auth.request'
import {
  ForgotPasswordResponse,
  GetLoggedInUserResponse,
  LoginResponse,
  RegisterResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
} from '../../gpa-backend/src/auth/dto/auth.response'
import axios from './axios'

const getLoggedInUser = async (): Promise<AppResponse<GetLoggedInUserResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`)
  return response.data
}

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

const verifyEmail = async (params: VerifyEmailRequest): Promise<AppResponse<VerifyEmailResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, { params })
  return response.data
}

const forgotPassword = async (data: ForgotPasswordRequest): Promise<AppResponse<ForgotPasswordResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, data)
  return response.data
}

const resetPassword = async (data: ResetPasswordRequest): Promise<AppResponse<ResetPasswordResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, data)
  return response.data
}

export const auth = {
  getLoggedInUser,
  login,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
}
