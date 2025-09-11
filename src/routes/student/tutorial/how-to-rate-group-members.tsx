import step1Image from '@/assets/tutorial/student/how-to-rate-group-members/step1.png'
import step2Image from '@/assets/tutorial/student/how-to-rate-group-members/step2.png'
import step3Image from '@/assets/tutorial/student/how-to-rate-group-members/step3.png'
import step4Image from '@/assets/tutorial/student/how-to-rate-group-members/step4.png'
import step5Image from '@/assets/tutorial/student/how-to-rate-group-members/step5.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/student/tutorial/how-to-rate-group-members')({
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
              How to Rate Group Members
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
    title: `Go to the assessment`,
    description: `Navigate to the "My Assessments" page, then click the "View Details" button of the assessment you want to rate.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Open the rating page`,
    description: `If the assessment is currently open for peer evaluation, you will see a "Rate" button. Click "Rate" to go to the rating page.`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Provide ratings`,
    description: `On the rating page, a dialog will appear showing the instructions for peer evaluation. Please read the instructions carefully, then click "I understand". After that, you can rate your group members by moving the slider, and you can also add comments for each member.`,
    image: step3Image,
  },
  {
    step: 4,
    title: `Submit your ratings`,
    description: `Once you have rated all group members, click "Submit" to send your evaluation. Please note that after submitting, you will not be able to go back and make changes, so make sure all ratings are correct before submitting.`,
    image: step4Image,
  },
  {
    step: 5,
    title: `Rating completed`,
    description: `After submission, the system will take you back to the assessment details page, and the "Rate" button will no longer be available.`,
    image: step5Image,
  },
]
