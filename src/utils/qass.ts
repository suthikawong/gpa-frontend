import { AssessmentModel } from '@/config/app'

export const validateBoundConflict = (lowerBound: number, upperBound: number) => lowerBound < upperBound

export const validateScoreConstraint = (isTotalScoreConstrained: boolean, scoreConstraint?: number) => {
  if (isTotalScoreConstrained && scoreConstraint === undefined) {
    return false
  }
  return true
}

export const validateConstraintConflict = (
  lowerBound: number,
  upperBound: number,
  groupSize: number,
  isTotalScoreConstrained: boolean,
  scoreConstraint?: number
) => {
  if (isTotalScoreConstrained) {
    return upperBound * groupSize >= scoreConstraint! && scoreConstraint! >= lowerBound * groupSize
  }
  return true
}

export const validateGroupSizeConflict = (
  isTotalScoreConstrained: boolean,
  minGroupSize: number,
  maxGroupSize: number
) => {
  return isTotalScoreConstrained ? maxGroupSize > minGroupSize : true
}

export const calculateMaxGroupSize = (
  selectedModel: string,
  scoreConstraint: number | undefined,
  lowerBound: number
) => {
  if (selectedModel === AssessmentModel.QASS) {
    const maxGroupSize = Math.floor((scoreConstraint ?? 0) / lowerBound)
    return maxGroupSize
  }
  return null
}

export const calculateMinGroupSize = (
  selectedModel: string,
  scoreConstraint: number | undefined,
  upperBound: number
) => {
  if (selectedModel === AssessmentModel.QASS) {
    const minGroupSize = Math.ceil((scoreConstraint ?? 0) / upperBound)
    return minGroupSize
  }
  return null
}
