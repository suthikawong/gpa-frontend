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
        values: [1, 1],
        description: 'Use a 21-point scale',
      },
    ],
  },
  {
    type: 'question',
    question: 'Should the sum of peer assessments be constant?',
    options: [
      {
        answer: 'no',
        values: [1, 0],
        description: `Sum of peer assessments isn't fixed`,
      },
      {
        answer: 'yes',
        values: [0, 1],
        description: 'Sum of peer assessments is fixed',
      },
    ],
  },
  {
    type: 'question',
    question: 'Should the rater also rate himself (self-assessment)?',
    options: [
      {
        answer: 'no',
        values: [1, 0],
        description: 'No self-assessments',
      },
      {
        answer: 'yes, for calibration (column-wise)',
        values: [1, 0],
        description: 'Self-assessment is allowed for calibration (column-wise)',
      },
      {
        answer: 'yes, for weighting (row-wise)',
        values: [0, 1],
        description: 'Self-assessment is allowed for weighting (row-wise)',
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to specify the impact of peer assessments on the final student score?',
    options: [
      {
        answer: 'no',
        values: [0, 1],
        description: `The impact of peer assessments cannot be specified`,
      },
      {
        answer: 'yes',
        values: [1, 0],
        description: `The impact of peer assessments can be specified`,
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to specify the spread of final scores around the group score?',
    options: [
      {
        answer: 'no',
        values: [0, 1],
        description: `The spread of peer assessments cannot be specified`,
      },
      {
        answer: 'yes',
        values: [1, 0],
        description: `The spread of peer assessments can be specified`,
      },
    ],
  },
  {
    type: 'question',
    question: 'Are peer assessments treated as rewards, as penalties, or rewards and penalties?',
    options: [
      {
        answer: 'only rewards',
        values: [1, 0],
        description: `Peer assessments treated as rewards only`,
      },
      {
        answer: 'only penalties',
        values: [1, 1],
        description: `Peer assessments treated as penalties only`,
      },
      {
        answer: 'both rewards and penalties',
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
        answer: 'less than 3',
        values: [1, 0],
        description: `A complete peer assessment can be done less than 3 times`,
      },
      {
        answer: '3',
        values: [1, 1],
        description: `A complete peer assessment can be done exactly 3 times`,
      },
      {
        answer: 'more than 3',
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
        answer: 'As rewards (scores are added to the group score)',
        values: { mode: mode.Conjunction, polishingFactor: 0.001 },
      },
      {
        answer: 'As penalties (scores are deducted from the group score)',
        values: { mode: mode.Disjunction, polishingFactor: 0.001 },
      },
      {
        answer: 'As both rewards and penalties (scores may be higher or lower than the group score)',
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
    question: 'How much should the scores be spread out?',
    options: [
      {
        answer: 'Low',
        values: { groupSpread: 0.2 },
      },
      {
        answer: 'Medium',
        values: { groupSpread: 0.5 },
      },
      {
        answer: 'High',
        values: { groupSpread: 0.8 },
      },
    ],
  },
  {
    type: 'question',
    question: 'How do you want students to give their ratings?',
    options: [
      {
        answer: 'Using a score slider',
        values: { scaleType: ScaleType.PercentageScale, lowerBound: 0, upperBound: 1 },
      },
      {
        answer: 'Using a 4-point Likert scale questionnaire',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 4,
          isTotalScoreConstrained: false,
        },
      },
      {
        answer: 'Using a 5-point Likert scale questionnaire',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 5,
          isTotalScoreConstrained: false,
        },
      },
      {
        answer: 'Using a 7-point Likert scale questionnaire',
        values: {
          scaleType: ScaleType.NPointScale,
          lowerBound: 1,
          upperBound: 7,
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
  // {
  //   type: 'question',
  //   question: 'How much should self-assessment affect the student scores compared to peer assessment?',
  //   options: [
  //     {
  //       answer: 'Less impact',
  //       values: {selfWeight: 0},
  //     },
  //     {
  //       answer: 'Equal impact',
  //       values: {selfWeight: 1},
  //     },
  //     {
  //       answer: 'Greater impact',
  //       values: {selfWeight: 0},
  //     },
  //   ],
  // },
  {
    type: 'summary',
    title: 'All Set!',
    description1:
      "You've completed the questionnaire. Below is a summary of your selected model and its configuration.",
  },
]
