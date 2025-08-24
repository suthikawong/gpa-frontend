import QassSimulationTab from '@/components/pages/tab/simulation/QassSimulationTab'
import WebavaliaSimulationTab from '@/components/pages/tab/simulation/WebavaliaSimulationTab'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { Roles } from '@/config/app'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useRef } from 'react'

export const Route = createFileRoute('/instructor/simulation')({
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
  const ref = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    if (ref.current) {
      window.scrollTo({
        top: ref.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }
  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Simulation</div>
      </div>
      <div
        ref={ref}
        className="flex flex-col gap-8 flex-grow"
      >
        <Tabs
          defaultValue="qass"
          className="flex flex-col flex-grow"
        >
          <ScrollArea>
            <div className="w-full relative">
              <TabsList>
                <TabsTrigger value="qass">QASS</TabsTrigger>
                <TabsTrigger value="webavalia">WebAVALIA</TabsTrigger>
              </TabsList>
            </div>
            <TabsScrollBar />
          </ScrollArea>
          <TabsContent
            value="qass"
            className="flex flex-col flex-grow"
          >
            <QassSimulationTab scrollToBottom={scrollToBottom} />
          </TabsContent>
          <TabsContent
            value="webavalia"
            className="flex flex-col flex-grow"
          >
            <WebavaliaSimulationTab scrollToBottom={scrollToBottom} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
