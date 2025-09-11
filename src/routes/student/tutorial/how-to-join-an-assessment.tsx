import step1Image from '@/assets/tutorial/student/how-to-join-an-assessment/step1.png'
import step2Image from '@/assets/tutorial/student/how-to-join-an-assessment/step2.png'
import step3Image from '@/assets/tutorial/student/how-to-join-an-assessment/step3.png'
import step4Image from '@/assets/tutorial/student/how-to-join-an-assessment/step4.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/student/tutorial/how-to-join-an-assessment')({
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
              How to Join an Assessment
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
    title: `Go to the My Assessments page`,
    description: `Navigate to the My Assessments page using the menu.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Enter the assessment code`,
    description: `Click the "Join" button. A dialog will appear where you need to enter the assessment code provided by your instructor or teacher. Then, click Join.`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Wait for instructor approval`,
    description: `After clicking "Join", a dialog will confirm that you have requested to join the assessment. You must wait for your instructor to approve your request.`,
    image: step3Image,
  },
  {
    step: 4,
    title: `Successfully joined the assessment`,
    description: `Once your instructor accepts your request, the assessment will appear in your "My Assessments" list.`,
    image: step4Image,
  },
]
