import { RatePeerRequest } from 'gpa-backend/src/peer-rating/dto/peer-rating.request'
import { RatePeerResponse } from 'gpa-backend/src/peer-rating/dto/peer-rating.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const ratePeer = async (data: RatePeerRequest): Promise<AppResponse<RatePeerResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/peer-rating`, data)
  return response.data
}

export const peerRating = {
  ratePeer,
}
