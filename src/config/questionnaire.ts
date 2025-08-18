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
  values: string
}

export interface QuestionnaireModelConfigurationQuestionItem {
  type: 'question'
  question: string
  options: QuestionnaireModelConfigurationQuestionOption[]
}

export interface QuestionnaireSummaryrItem {
  type: 'summary'
  title: string
  description1: string
  description2: string
  image: string
}

export type QuestionnaireModelSelectionItem = Array<
  QuestionnaireCoverItem | QuestionnaireModelSelectionQuestionItem | QuestionnaireSummaryrItem
>

export type QuestionnaireModelConfigurationItem = Array<
  QuestionnaireCoverItem | QuestionnaireModelConfigurationQuestionItem
>

export const modelSelectionSet: QuestionnaireModelSelectionItem = [
  {
    type: 'cover',
    title: 'Find Your Perfect Assessment Model',
    description1: "Tell us about your class — we'll help you pick the best peer assessment model.",
    image: 'shuttle.png',
  },
  {
    type: 'question',
    question: 'What scale do you prefer for the peer assessments?',
    options: [
      {
        answer: '0%, 1%, ... , 99%, 100%',
        values: [1, 0],
        description: 'Use percentage scale',
      },
      {
        answer: '0, 5, ... , 95, 100',
        values: [1, 1],
        description: 'Use 21-point scale',
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
        description: `Sum of peer assessments aren't constant`,
      },
      {
        answer: 'yes',
        values: [0, 1],
        description: 'Sum of peer assessments are constant',
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
        description: 'No self-assessment',
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
        description: `Can't specify the impact of peer assessments`,
      },
      {
        answer: 'yes',
        values: [1, 0],
        description: `Can specify the impact of peer assessments`,
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
        description: `Can't specify the spread of peer assessments`,
      },
      {
        answer: 'yes',
        values: [1, 0],
        description: `Can specify the spread of peer assessments`,
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
        description: `Peer assessments treated as both rewards and penalties`,
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
        description: `Can run complete peer assessment with less than 3 times`,
      },
      {
        answer: '3',
        values: [1, 1],
        description: `Can run complete peer assessment with exactly 3 times`,
      },
      {
        answer: 'more than 3',
        values: [1, 0],
        description: `Can run complete peer assessment with more than 3 times`,
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
        description: 'Final student scores will be in percentage scale',
      },
      {
        answer: '0, 1, ... , 19, 20',
        values: [0, 1],
        description: 'Final student scores will be in 21-point scale',
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
    image: 'checked.png',
  },
]

export const qassConfigurationSet: QuestionnaireModelConfigurationItem = [
  {
    type: 'cover',
    title: 'Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: 'gear.png',
  },
  {
    type: 'question',
    question: 'How much should peer ratings influence individual scores?',
    options: [
      {
        answer: 'Not at all',
        values: '0',
      },
      {
        answer: 'A little',
        values: '0.5',
      },
      {
        answer: 'Moderately',
        values: '1',
      },
      {
        answer: 'A lot',
        values: '2',
      },
    ],
  },
  {
    type: 'question',
    question: 'How much should individual scores differ based on peer ratings?',
    options: [
      {
        answer: 'Very similar',
        values: '0.2',
      },
      {
        answer: 'Balanced',
        values: '0.5',
      },
      {
        answer: 'Very different',
        values: '1',
      },
    ],
  },
  {
    type: 'cover',
    title: 'All Set!',
    description1:
      "You've completed the questionnaire. Below is a summary of your selected model and its configuration.",
    description2: "When you're ready, click the Apply button to automatically insert the results into the form.",
    image: 'gold-medal.png',
  },
]

export const webavaliaConfigurationSet: QuestionnaireModelConfigurationItem = [
  {
    type: 'cover',
    title: 'Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: 'gear.png',
  },
  {
    type: 'question',
    question: 'How much should peer ratings influence individual scores?',
    options: [
      {
        answer: 'Not at all',
        values: '0',
      },
      {
        answer: 'A little',
        values: '0.5',
      },
      {
        answer: 'Moderately',
        values: '1',
      },
      {
        answer: 'A lot',
        values: '2',
      },
    ],
  },
  {
    type: 'question',
    question: 'How much should individual scores differ based on peer ratings?',
    options: [
      {
        answer: 'Very similar',
        values: '0.2',
      },
      {
        answer: 'Balanced',
        values: '0.5',
      },
      {
        answer: 'Very different',
        values: '1',
      },
    ],
  },
  {
    type: 'cover',
    title: 'All Set!',
    description1:
      "You've completed the questionnaire. Below is a summary of your selected model and its configuration.",
    description2: "When you're ready, click the Apply button to automatically insert the results into the form.",
    image: 'gold-medal.png',
  },
]
