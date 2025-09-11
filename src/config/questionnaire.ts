import checked from '@/assets/checked.png'
import gear from '@/assets/gear.png'
import shuttle from '@/assets/shuttle.png'
import { mode, ScaleType } from './app'

export interface QuestionnaireCoverItem {
  type: 'cover'
  title: string
  description1: string
  description2?: string
  image: string
}

export interface QuestionnaireModelSelectionQuestionOption {
  answer: string
  values: number[]
  description: string
}

export interface QuestionnaireModelSelectionQuestionItem {
  type: 'question'
  question: string
  options: QuestionnaireModelSelectionQuestionOption[]
}

export interface QuestionnaireModelConfigurationQuestionOption {
  answer: string
  values: { [key: string]: any }
}

export interface QuestionnaireModelConfigurationQuestionItem {
  type: 'question'
  question: string
  condition?: { [key: string]: any }
  options: QuestionnaireModelConfigurationQuestionOption[]
}

export interface QuestionnaireSummaryItem {
  type: 'summary'
  title: string
  description1: string
  description2?: string
  image?: string
}

export type QuestionnaireModelSelectionItem = Array<
  QuestionnaireCoverItem | QuestionnaireModelSelectionQuestionItem | QuestionnaireSummaryItem
>

export type QuestionnaireModelConfigurationItem = Array<
  QuestionnaireCoverItem | QuestionnaireModelConfigurationQuestionItem | QuestionnaireSummaryItem
>

export const modelSelectionSet: QuestionnaireModelSelectionItem = [
  {
    type: 'cover',
    title: 'Find Your Perfect Assessment Model',
    description1: "Tell us about your class — we'll help you pick the best peer assessment model.",
    image: shuttle,
  },
  {
    type: 'question',
    question: 'What scale do you prefer for the peer assessments?',
    options: [
      {
        answer: '0%, 1%, ... , 99%, 100%',
        values: [1, 0],
        description: 'Use a percentage scale',
      },
      {
        answer: '0, 5, ... , 95, 100',
        values: [0, 1],
        description: 'Use a 21-point scale',
      },
    ],
  },
  {
    type: 'question',
    question: 'Should the sum of peer assessments be fixed?',
    options: [
      {
        answer: 'Yes',
        values: [0, 1],
        description: 'Sum of peer assessments is fixed',
      },
      {
        answer: 'No',
        values: [1, 0],
        description: `Sum of peer assessments isn't fixed`,
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to set how peer assessments influence the final student score?',
    options: [
      {
        answer: 'Yes',
        values: [1, 0],
        description: `The impact of peer assessments can be specified`,
      },
      {
        answer: 'No',
        values: [0, 1],
        description: `The impact of peer assessments cannot be specified`,
      },
    ],
  },
  {
    type: 'question',
    question: `Do you want to set how much individual final scores can vary from the group score?`,
    options: [
      {
        answer: 'Yes',
        values: [1, 0],
        description: `The spread of peer assessments can be specified`,
      },
      {
        answer: 'No',
        values: [0, 1],
        description: `The spread of peer assessments cannot be specified`,
      },
    ],
  },
  {
    type: 'question',
    question: 'How should peer assessment be applied?',
    options: [
      {
        answer: 'As a reward - All students get higher than the group score, except the lowest.',
        values: [1, 0],
        description: `Peer assessments treated as rewards only`,
      },
      {
        answer: 'As a punishment - All students get lower than the group score, except the highest.',
        values: [1, 1],
        description: `Peer assessments treated as penalties only`,
      },
      {
        answer: 'As both reward and punishment - Students may get either higher or lower than the group score.',
        values: [1, 0],
        description: `Peer assessments treated as rewards and penalties`,
      },
    ],
  },
  {
    type: 'question',
    question: 'How many times do you want to run a complete peer assessment?',
    options: [
      {
        answer: 'Less than 3',
        values: [1, 0],
        description: `A complete peer assessment can be done less than 3 times`,
      },
      {
        answer: '3',
        values: [1, 1],
        description: `A complete peer assessment can be done exactly 3 times`,
      },
      {
        answer: 'More than 3',
        values: [1, 0],
        description: `A complete peer assessment can be done more than 3 times`,
      },
    ],
  },
  {
    type: 'question',
    question: 'What scale do you prefer for the final student scores?',
    options: [
      {
        answer: '0%, 1%, ... , 99%, 100%',
        values: [1, 0],
        description: 'Final student scores will be on a percentage scale',
      },
      {
        answer: '0, 1, ... , 19, 20',
        values: [0, 1],
        description: 'Final student scores will be on a 21-point scale',
      },
    ],
  },
  {
    type: 'summary',
    title: "You've Found Your Match!",
    description1:
      'Your preferences best match ${selectedModel}. You can switch to a different assessment model by clicking "Click to select" and then "Use selected model" to continue.',
    description2:
      'Your preferences align most closely with ${selectedModel}, though some may not be fully supported (see table below). You can switch to another model by clicking "Click to select" and then "Use selected model" to continue.',
    image: checked,
  },
]

export const qassConfigurationSet: QuestionnaireModelConfigurationItem = [
  {
    type: 'cover',
    title: 'Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: gear,
  },
  {
    type: 'question',
    question: 'How do you want peer assessments to be applied?',
    options: [
      {
        answer: 'As a reward - All students get higher than the group score, except the lowest.',
        values: { mode: mode.Conjunction, polishingFactor: 0.001 },
      },
      {
        answer: 'As a punishment - All students get lower than the group score, except the highest.',
        values: { mode: mode.Disjunction, polishingFactor: 0.001 },
      },
      {
        answer: 'As both reward and punishment - Students may get either higher or lower than the group score.',
        values: { mode: mode.Bijunction, polishingFactor: 0.001 },
      },
    ],
  },
  {
    type: 'question',
    question: 'How much should peer ratings affect the scores?',
    options: [
      {
        answer: 'Low',
        values: { peerRatingImpact: 0.5 },
      },
      {
        answer: 'Medium',
        values: { peerRatingImpact: 1 },
      },
      {
        answer: 'High',
        values: { peerRatingImpact: 2 },
      },
    ],
  },
  {
    type: 'question',
    question: 'How much should the scores differ from each other?',
    options: [
      {
        answer: 'Little difference',
        values: { groupSpread: 0.2 },
      },
      {
        answer: 'Moderate difference',
        values: { groupSpread: 0.5 },
      },
      {
        answer: 'Large difference',
        values: { groupSpread: 0.8 },
      },
    ],
  },
  {
    type: 'question',
    question: 'How do you want students to give their ratings?',
    options: [
      {
        answer: '0%, 1%, ... , 99%, 100%',
        values: {
          scaleType: ScaleType.PercentageScale,
          lowerBound: 0,
          upperBound: 1,
          scoreConstraint: 1,
          isTotalScoreConstrained: false,
        },
      },
      {
        answer: '1, 2, 3, 4',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 4,
          scoreConstraint: 10,
          isTotalScoreConstrained: false,
        },
      },
      {
        answer: '1, 2, 3, 4, 5',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 5,
          scoreConstraint: 10,
          isTotalScoreConstrained: false,
        },
      },
      {
        answer: '1, 2, ... , 6, 7',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 7,
          scoreConstraint: 10,
          isTotalScoreConstrained: false,
        },
      },
    ],
  },
  {
    type: 'summary',
    title: 'All Set!',
    description1:
      "You've completed the questionnaire. Below is a summary of your selected model and its configuration.",
  },
]

export const webavaliaConfigurationSet: QuestionnaireModelConfigurationItem = [
  {
    type: 'cover',
    title: 'Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: gear,
  },
  {
    type: 'question',
    question: 'Do you want to include self-assessment in calculating student scores?',
    options: [
      {
        answer: 'Yes',
        values: { selfWeight: 0.2 },
      },
      {
        answer: 'No',
        values: { selfWeight: 0 },
      },
    ],
  },
  {
    type: 'summary',
    title: 'All Set!',
    description1:
      "You've completed the questionnaire. Below is a summary of your selected model and its configuration.",
  },
]
