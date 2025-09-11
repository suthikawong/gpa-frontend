import step1Image from '@/assets/tutorial/student/how-to-join-a-group/step1.png'
import step2Image from '@/assets/tutorial/student/how-to-join-a-group/step2.png'
import step3Image from '@/assets/tutorial/student/how-to-join-a-group/step3.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/student/tutorial/how-to-join-a-group')({
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
  const router = useRouter()
  return (
    <DashboardLayout className="gap-4">
      <Button
        className="w-fit"
        onClick={() => router.history.push('/student/tutorial')}
      >
        <ChevronLeft />
        Back
      </Button>
      <div className="space-y-8">
        <Card className="flex gap-4 w-full shadow-none border-0 py-6 px-2 md:py-8 md:px-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center sm:text-3xl flex gap-2 items-center m-auto mb-4 sm:mb-8">
              How to Join a Group
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {steps.map((item) => (
              <StepCard
                step={item.step}
                title={item.title}
                description={item.description}
                image={item.image}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

const steps = [
  {
    step: 1,
    title: `Go to the assessment you want to join`,
    description: `Navigate to the "My Assessments" page, then click the "View Details" button of the assessment you are interested in.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Enter the group code`,
    description: (
      <div className="space-y-4">
        <div>
          If you have not joined a group yet, a "Join" button will be available. Click it, and a dialog will appear
          asking you to enter the group code provided by your instructor or group members. After entering the code,
          click "Join".
        </div>
        <div>
          If the Join button is disabled, it means the assessment has already started and group joining is no longer
          allowed.
        </div>
      </div>
    ),
    image: step2Image,
  },
  {
    step: 3,
    title: `Successfully joined the group`,
    description: `Once you have successfully joined a group, you will see the group name along with the list of its members.`,
    image: step3Image,
  },
]
