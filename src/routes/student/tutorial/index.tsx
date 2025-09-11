import DashboardLayout from '@/components/layouts/DashboardLayout'
import TopicCard from '@/components/pages/tutorial/TopicCard'
import { Roles } from '@/config/app'
import { studentTutorialTopicList } from '@/config/tutorial'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/student/tutorial/')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    } else if (context.user?.roleId === Roles.Instructor) {
      throw redirect({
        to: '/instructor/assessment',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Tutorial</div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {studentTutorialTopicList.map((item, index) => (
          <TopicCard
            number={index + 1}
            title={item.title}
            href={item.href}
          />
        ))}
      </div>
    </DashboardLayout>
  )
}
