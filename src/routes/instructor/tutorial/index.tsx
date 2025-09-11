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
      <div className="grid md:grid-cols-2 gap-8">
        {tutorialTopicList.map((item, index) => (
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

const TopicCard = ({ number, title, href }: { number: number; title: string; href: string }) => {
  const router = useRouter()

  const onClickCard = () => {
    router.history.push(href)
  }
  return (
    <div
      onClick={onClickCard}
      className="flex items-center gap-4 bg-white rounded-lg p-2 md:p-4 h-[60px] md:h-[100px] transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-secondary"
    >
      <div className="flex justify-center items-center font-semibold text-lg md:text-2xl bg-primary rounded-lg min-w-[40px] size-[40px] md:min-w-[70px] md:size-[70px] text-white">
        {number}
      </div>
      <h2 className="text-sm md:text-lg font-semibold grow-0">{title}</h2>
    </div>
  )
}
