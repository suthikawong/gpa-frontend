export const tutorialTopicList = [
  {
    title: 'How to Setup Assessment',
    href: '/instructor/tutorial/how-to-setup-assessment',
  },
  {
    title: 'How to Add Students',
    href: '/instructor/tutorial/how-to-add-students',
  },
  {
    title: 'How to Create a Group and Add Members',
    href: '/instructor/tutorial/how-to-create-a-group-and-add-members',
  },
  {
    title: 'How to Set the Assessment Dates',
    href: '/instructor/tutorial/how-to-set-the-assessment-dates',
  },
  {
    title: 'How to Edit Group Scores and Student Scores',
    href: '/instructor/tutorial/how-to-edit-group-scores-and-student-scores',
  },
  {
    title: 'How to Use Automatic Score Calculation',
    href: '/instructor/tutorial/how-to-use-automatic-score-calculation',
  },
  {
    title: 'How to View Peer Ratings',
    href: '/instructor/tutorial/how-to-view-peer-ratings',
  },
  {
    title: 'QASS Terminology',
    href: '/instructor/tutorial/qass-terminology',
  },
  {
    title: 'WebAVALIA Terminology',
    href: '/instructor/tutorial/webavalia-terminology',
  },
]

export const qassTerminology = [
  {
    term: 'QASS (Quasi-Arithmetic Scoring System)',
    definition:
      'A family of educational scoring systems for assessment and evaluation of student performance. Members are called variants or modes.',
  },
  {
    term: 'Mode',
    definition: 'A variant of QASS for peer assessment, defined by the rating question given to students.',
  },
  {
    term: 'Bijunction',
    definition: `Bijunction mode refers to rating peers relative to one's own performance/competence. Student scores can be either higher or lower than the group score.`,
  },
  {
    term: 'Conjunction',
    definition: `Conjunction mode refers to rating peers relative to the best performance possible. A student's score will always be less than or equal to the group score.`,
  },
  {
    term: 'Disjunction',
    definition: `Disjunction mode refers to rating peers relative to the worst performance possible. A student's score will always be greater than or equal to the group score.`,
  },
  {
    term: 'Polishing Factor',
    definition: 'Technical parameter that excludes extreme scale values. For expert mode only.',
  },
  {
    term: 'Peer Rating Impact (Polarisation Factor)',
    definition:
      'A parameter used to adjust the influence of student ratings, which affects the calculation of the final score. A high factor pushes scores toward the upper bound, while a low factor pushes them toward the lower bound. It cannot alter the scale bounds.',
  },
  {
    term: 'Group Spread',
    definition: `The measure of how far apart students' scores are within a group. A small spread means students' scores are close to the group score, while a large spread means individual student scores may differ more from the group score.`,
  },
  {
    term: 'Group Score',
    definition: `The group location on the percentage scale represents product quality.`,
  },
  {
    term: 'Percentage Scale',
    definition:
      'A scale used to represent scores in two forms: (a) a discrete scale consisting of integers from 0 to 100 (101 points in total), and (b) a continuous scale consisting of all real numbers between 0 and 1.',
  },
  {
    term: 'N-Point Scale',
    definition: 'A discrete scale with exactly N integers between a lower and upper bound.',
  },
  {
    term: 'Lower Bound',
    definition: 'The lowest number that defines a bounded scale.',
  },
  {
    term: 'Upper Bound',
    definition: 'The highest number that defines a bounded scale.',
  },
  {
    term: 'Student Weight',
    definition: `An integer representing a student's relative importance. A higher value gives more weight to that student's rating. The system converts this value into a decimal between 0 and 1, and all student weights must sum to 1.`,
  },
  {
    term: 'Scoring Component',
    definition: `An independent instance of peer assessment producing a student contribution. In WebAVALIA, called a "moment".`,
  },
  {
    term: 'Scoring Component Weight',
    definition:
      'An integer that represents the importance of a student contribution in a given component. A higher value gives more weight to the ratings in that component. The system converts this value into a decimal between 0 and 1, and all scoring component weights must sum to 1.',
  },
  {
    term: 'Peer Ratings',
    definition: 'The ratings given by students to their peers.',
  },
  {
    term: 'Student Ratings',
    definition: 'The ratings calculated from the peer ratings for that student.',
  },
  {
    term: 'Group Rating',
    definition: 'The ratings calculated from all students of a given group.',
  },
  {
    term: 'Peer Matrix (Peer Rating Matrix)',
    definition: 'An n × n matrix containing peer ratings (including self-ratings).',
  },
]

export const webavaliaTerminology = [
  {
    term: 'WebAVALIA',
    definition: `A peer assessment tool developed at the University of Porto (Portugal) by Prof. Babo. A student's score will always be less than or equal to the Group Grade.`,
  },
  {
    term: 'Moment',
    definition: `An independent instance of peer assessment producing a student contribution. Equivalent to a scoring component.`,
  },
  {
    term: 'Self Assessment Weight',
    definition: `Fixed weight for self-votes.`,
  },
  {
    term: 'Peer Assessment Weight',
    definition: `Equal weights given to peer votes for a student.`,
  },
  {
    term: 'Group Grade',
    definition: `Model parameter given by the teacher for each component, based on quality criteria. Uses the 21-point Portuguese grading scale.`,
  },
  {
    term: 'Voting',
    definition: `Process of collecting peer votes. Each student distributes 100 votes (in chunks of 5) across peers and self.`,
  },
  {
    term: 'Peer Matrix',
    definition: `An n × n matrix containing peer ratings (including self-ratings), constrained by the voting rules that require each student to allocate exactly 100 votes.`,
  },
]
