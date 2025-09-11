import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Roles } from '@/config/app'
import { tutorialTopicList } from '@/config/tutorial'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/instructor/tutorial/')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    } else if (context.user?.roleId === Roles.Student) {
      throw redirect({
        to: '/student/assessment',
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
      <div className="grid grid-cols-3 gap-8">
        {tutorialTopicList.map((item) => (
          <TopicCard
            title={item.title}
            href={item.href}
          />
        ))}
      </div>
    </DashboardLayout>
  )
}

const TopicCard = ({ title, href }: { title: string; href: string }) => {
  const router = useRouter()

  const onClicCard = () => {
    router.history.push(href)
  }
  return (
    <div
      onClick={onClicCard}
      className="group flex items-center justify-center text-center bg-white rounded-xl p-8 h-[180px] transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-secondary"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )
}
