export interface QuestionnaireCoverItem {
  type: 'cover'
  title: string
  description1: string
  description2?: string
  image: string
}

export interface QuestionnaireQuestionItem {
  type: 'question'
  question: string
  options: { answer: string }[]
}

export const modelSelectionSet: Array<QuestionnaireCoverItem | QuestionnaireQuestionItem> = [
  {
    type: 'cover',
    title: 'Find Your Perfect Assessment Model',
    description1: "Tell us about your class — we'll help you pick the best peer assessment model.",
    image: 'shuttle.png',
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the peer assessments?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to pose a restriction on the sum of ratings/votes that a student may assign to his peers?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: 'undecided',
      },
    ],
  },
  {
    type: 'question',
    question: 'How many times do you want to run a complete peer assessment?',
    options: [
      {
        answer: 'less than 3',
      },
      {
        answer: '3',
      },
      {
        answer: 'more than 3',
      },
    ],
  },
  {
    type: 'question',
    question:
      'Do you want to be able to specify how much impact the peer assessments will have on the final student score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to be able to specify the spread of final scores around the group score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the final student scores?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Are peer assessments treated as rewards, as penalties, or mixed rewards and penalties?',
    options: [
      {
        answer: 'only rewards',
      },
      {
        answer: 'only penalies',
      },
      {
        answer: 'both rewards and penalties',
      },
    ],
  },
  {
    type: 'cover',
    title: "You've Found Your Match!",
    description1: "You've Found Your Match!",
    description2: 'Click Next to proceed and configure this model to suit your needs.',
    image: 'checked.png',
  },
]

export const qassConfigurationSet: Array<QuestionnaireCoverItem | QuestionnaireQuestionItem> = [
  {
    type: 'cover',
    title: 'Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: 'gear.png',
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the peer assessments?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to pose a restriction on the sum of ratings/votes that a student may assign to his peers?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: 'undecided',
      },
    ],
  },
  {
    type: 'question',
    question: 'How many times do you want to run a complete peer assessment?',
    options: [
      {
        answer: 'less than 3',
      },
      {
        answer: '3',
      },
      {
        answer: 'more than 3',
      },
    ],
  },
  {
    type: 'question',
    question:
      'Do you want to be able to specify how much impact the peer assessments will have on the final student score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to be able to specify the spread of final scores around the group score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the final student scores?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Are peer assessments treated as rewards, as penalties, or mixed rewards and penalties?',
    options: [
      {
        answer: 'only rewards',
      },
      {
        answer: 'only penalies',
      },
      {
        answer: 'both rewards and penalties',
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

export const webavaliaConfigurationSet: Array<QuestionnaireCoverItem | QuestionnaireQuestionItem> = [
  {
    type: 'cover',
    title: 'Set 2: Customize Your Assessment Model',
    description1: 'Fine-tune the chosen model to match your style and preferences.',
    image: 'gear.png',
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the peer assessments?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to pose a restriction on the sum of ratings/votes that a student may assign to his peers?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: 'undecided',
      },
    ],
  },
  {
    type: 'question',
    question: 'How many times do you want to run a complete peer assessment?',
    options: [
      {
        answer: 'less than 3',
      },
      {
        answer: '3',
      },
      {
        answer: 'more than 3',
      },
    ],
  },
  {
    type: 'question',
    question:
      'Do you want to be able to specify how much impact the peer assessments will have on the final student score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'Do you want to be able to specify the spread of final scores around the group score?',
    options: [
      {
        answer: 'no',
      },
      {
        answer: 'yes',
      },
      {
        answer: "can't decide",
      },
    ],
  },
  {
    type: 'question',
    question: 'What kind of scale do you prefer for the final student scores?',
    options: [
      {
        answer: 'percentage scale',
      },
      {
        answer: 'n-point scale',
      },
      {
        answer: 'no preference',
      },
    ],
  },
  {
    type: 'question',
    question: 'Are peer assessments treated as rewards, as penalties, or mixed rewards and penalties?',
    options: [
      {
        answer: 'only rewards',
      },
      {
        answer: 'only penalies',
      },
      {
        answer: 'both rewards and penalties',
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
