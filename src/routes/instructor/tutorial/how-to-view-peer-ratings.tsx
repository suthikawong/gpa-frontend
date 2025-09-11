import step1Image from '@/assets/tutorial/instructor/how-to-view-peer-ratings/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-view-peer-ratings/step2.png'
import step3Image from '@/assets/tutorial/instructor/how-to-view-peer-ratings/step3.png'
import step4Image from '@/assets/tutorial/instructor/how-to-view-peer-ratings/step4.png'
import step5Image from '@/assets/tutorial/instructor/how-to-view-peer-ratings/step5.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/instructor/tutorial/how-to-view-peer-ratings')({
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
              How to View Peer Ratings
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
    title: `Go to the group details page`,
    description: `Click the "View Details" button of the assessment that contains the group. Then, go to the "Groups" tab and click "Edit" to open the group details page.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Go to the components list`,
    description: `Click the "Peer Ratings" tab. You will see a list of the components that have been created in this assessment.`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Open peer ratings for a component`,
    description: `Click the "View Details" button of the component you want to review. The system will display the component details, including the peer ratings given by students in the group.`,
    image: step3Image,
  },
  {
    step: 4,
    title: `View student scores in the Summary`,
    description: `You can view the total scores each student received from their group members by switching the display to "Summary". Expanding a student's collapsible section will show all the students who rated them, and you can click the arrow to see the individual ratings each rater provided.`,
    image: step4Image,
  },
  {
    step: 5,
    title: `View student scores in the Peer Matrix`,
    description: `For a quicker overview, use the "Peer Matrix" view. This will display the ratings in an n × n matrix based on the number of group members. If you see any empty cells in the matrix, it means that a student did not rate that particular member.`,
    image: step5Image,
  },
]
