import {
  GetPeerRatingsByScoringComponentIdRequest,
  RatePeerRequest,
} from 'gpa-backend/src/peer-rating/dto/peer-rating.request'
import {
  GetPeerRatingsByScoringComponentIdResponse,
  RatePeerResponse,
} from 'gpa-backend/src/peer-rating/dto/peer-rating.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const ratePeer = async (data: RatePeerRequest): Promise<AppResponse<RatePeerResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/peer-rating`, data)
  return response.data
}

const getPeerRatingsByScoringComponentId = async (
  params: GetPeerRatingsByScoringComponentIdRequest
): Promise<AppResponse<GetPeerRatingsByScoringComponentIdResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/peer-rating`, { params })
  return response.data
}

export const peerRating = {
  ratePeer,
  getPeerRatingsByScoringComponentId,
}
