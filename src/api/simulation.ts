import {
  CalcualteScoresByQASSRequest,
  CalcualteScoresByWebavaliaRequest,
} from 'gpa-backend/src/simulation/dto/simulation.request'
import {
  CalcualteScoresByQASSResponse,
  CalcualteScoresByWebavaliaResponse,
} from 'gpa-backend/src/simulation/dto/simulation.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const calcualteScoresByQASS = async (
  data: CalcualteScoresByQASSRequest
): Promise<AppResponse<CalcualteScoresByQASSResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/simulation/qass`, data)
  return response.data
}

const calcualteScoresByWebAvalia = async (
  data: CalcualteScoresByWebavaliaRequest
): Promise<AppResponse<CalcualteScoresByWebavaliaResponse>> => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/simulation/webavalia`, data)
  return response.data
}

export const simulation = {
  calcualteScoresByQASS,
  calcualteScoresByWebAvalia,
}
