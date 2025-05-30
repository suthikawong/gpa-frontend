import { GetClassroomsByInstructorResponse } from 'gpa-backend/src/classroom/dto/classroom.response'
import { AppResponse } from '../../gpa-backend/src/app.response'
import axios from './axios'

const getInstructorClassrooms = async (): Promise<AppResponse<GetClassroomsByInstructorResponse>> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/classroom/instructor`)
  return response.data
}

export const classroom = {
  getInstructorClassrooms,
}
