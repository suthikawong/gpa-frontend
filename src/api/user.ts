import { GetUserByIdRequest, UpdateUserRequest } from 'gpa-backend/src/user/dto/user.request'
import { GetUserByIdResponse, UpdateProfileResponse, UpdateUserResponse } from 'gpa-backend/src/user/dto/user.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getUserById = async ({ userId }: GetUserByIdRequest): Promise<AppResponse<GetUserByIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${userId}`)
  return response.data
}

const updateUser = async (data: UpdateUserRequest): Promise<AppResponse<UpdateUserResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user`, data)
  return response.data
}

const updateProfile = async (data: FormData): Promise<AppResponse<UpdateProfileResponse>> => {
  const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/profile`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const user = {
  getUserById,
  updateUser,
  updateProfile,
}
