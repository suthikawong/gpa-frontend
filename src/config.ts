export const appPaths = {
  signIn: '/signin',
  profile: '/profile',
  instructor: {
    myClassrooms: '/instructor/my-classrooms',
  },
  student: {
    myClassrooms: '/student/my-classrooms',
  },
}

export const profileMenuItem = {
  name: 'Edit Profile',
  icon: 'UserRound',
  href: appPaths.profile,
}

export const instructorMenuItems = [
  {
    name: 'My Classrooms',
    icon: 'LayoutDashboard',
    href: appPaths.instructor.myClassrooms,
  },
  profileMenuItem,
]

export const studentMenuItems = [
  {
    name: 'My Classrooms',
    icon: 'LayoutDashboard',
    href: appPaths.student.myClassrooms,
  },
  profileMenuItem,
]

export enum Roles {
  Instructor = 1,
  Student = 2,
}

export enum QASSMode {
  B = 'Bijunction',
  C = 'Conjunction',
  D = 'Disjunction',
}
