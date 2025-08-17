export const appPaths = {
  signIn: '/signin',
  signUp: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  profile: '/profile',
  instructor: {
    assessment: '/instructor/assessment',
    simulation: '/instructor/simulation',
  },
  student: {
    assessment: '/student/assessment',
  },
}

export const publicPaths = [
  appPaths.signIn,
  appPaths.signUp,
  appPaths.forgotPassword,
  appPaths.resetPassword,
  appPaths.verifyEmail,
]

export const profileMenuItem = {
  name: 'Edit Profile',
  icon: 'UserRound',
  href: appPaths.profile,
}

export const instructorMenuItems = [
  {
    name: 'Peer Assessments',
    icon: 'ListChecks',
    href: appPaths.instructor.assessment,
  },
  {
    name: 'Simulation',
    icon: 'FlaskConical',
    href: appPaths.instructor.simulation,
  },
  profileMenuItem,
]

export const studentMenuItems = [
  {
    name: 'Peer Assessments',
    icon: 'ListChecks',
    href: appPaths.student.assessment,
  },
  profileMenuItem,
]

export const AssessmentTabs = {
  Students: 'students',
  Groups: 'groups',
  Model: 'model',
  ScoringComponents: 'scoring-components',
}

export const GroupTabs = {
  Scores: 'scores',
  PeerRatings: 'peer-ratings',
}

export const mode = {
  Bijunction: 'B',
  Conjunction: 'C',
  Disjunction: 'D',
}

export const ScaleType = {
  PercentageScale: 'Percentage scale',
  FourPointScale: '4-point scale',
  FivePointScale: '5-point scale',
}

export const ScaleSteps = {
  '1': 1,
  '20': 20,
  '25': 25,
}

export enum Roles {
  Student = 1,
  Instructor = 2,
}

export enum QASSMode {
  B = 'Bijunction',
  C = 'Conjunction',
  D = 'Disjunction',
}

export enum AssessmentModel {
  QASS = '1',
  WebAVALIA = '2',
}
