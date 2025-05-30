export const appPaths = {
  signIn: '/signin',
  profile: '/profile',
  instructor: {
    myClassroom: '/instructor/my-classroom',
  },
  student: {
    myClassroom: '/student/my-classroom',
  },
}

export const menuItems = [
  {
    name: 'My Classroom',
    icon: 'LayoutDashboard',
    href: appPaths.instructor.myClassroom,
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
