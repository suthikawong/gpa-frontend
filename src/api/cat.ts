import { AppResponse } from '../../gpa-backend/src/app.response'
import { GetCatResponse } from '../../gpa-backend/src/cats/dto/cats.response'
import axios from './axios'

const getCats = async (): Promise<AppResponse<GetCatResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cats`)
  return response.data
}

export const cat = {
  getCats,
}
