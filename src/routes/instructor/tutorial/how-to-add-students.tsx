import step1Image from '@/assets/tutorial/instructor/how-to-add-students/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-add-students/step2.png'
import step3Image from '@/assets/tutorial/instructor/how-to-add-students/step3.png'
import step4Image from '@/assets/tutorial/instructor/how-to-add-students/step4.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/instructor/tutorial/how-to-add-students')({
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
  const router = useRouter()
  return (
    <DashboardLayout className="gap-4">
      <Button
        className="w-fit"
        onClick={() => router.history.push('/instructor/tutorial')}
      >
        <ChevronLeft />
        Back
      </Button>
      <div className="space-y-8">
        <Card className="flex gap-4 w-full shadow-none border-0 py-6 px-2 md:py-8 md:px-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center sm:text-3xl flex gap-2 items-center m-auto mb-4 sm:mb-8">
              How to Add Students
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
    title: `Go to the assessment details page`,
    description: `Click the "View Details" button of the assessment where you want to add students. This will take you to the assessment details page.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Add students to the assessment`,
    description: `Go to the "Students" tab and click the "Add" button. A dialog will appear where you can add students by entering the email address they used to register on the website. Then, click "Add Student".`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Allow students to join the assessment by themselves`,
    description: `You can also let students join the assessment on their own. To do this, share the assessment code of the assessment you want them to join. The code can be found on the assessment details page.`,
    image: step3Image,
  },
  {
    step: 4,
    title: `Accept student join requests`,
    description: (
      <div className="space-y-4">
        <div>
          When a student uses the code you shared to join the assessment, their request will appear in the student list.
          You must click "Accept" on that student's entry before they can access and view the assessment.
        </div>
        <div>Note: The assessment must be published before students can request to join.</div>
      </div>
    ),
    image: step4Image,
  },
]
