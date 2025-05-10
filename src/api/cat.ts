import axios from 'axios'
import { AppResponse } from '../../gpa-backend/dtos/app'
import { GetCatResponse } from '../../gpa-backend/dtos/cats/cats-response.dto'

const getCats = async (): Promise<AppResponse<GetCatResponse[]>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/cats`)
  return response.data
}

export const cat = {
  getCats,
}
