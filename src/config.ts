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

export const instructorMenuItems = [
  {
    name: 'My Classrooms',
    icon: 'LayoutDashboard',
    href: appPaths.instructor.myClassrooms,
  },
  {
    name: 'Profile',
    icon: 'UserRound',
    href: appPaths.profile,
  },
]

export const studentMenuItems = [
  {
    name: 'My Classrooms',
    icon: 'LayoutDashboard',
    href: appPaths.student.myClassrooms,
  },
  {
    name: 'Profile',
    icon: 'UserRound',
    href: appPaths.profile,
  },
]

export enum Roles {
  Instructor = 1,
  Student = 2,
}
