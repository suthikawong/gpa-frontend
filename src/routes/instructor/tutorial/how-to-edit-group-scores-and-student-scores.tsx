import step1Image from '@/assets/tutorial/instructor/how-to-edit-group-scores-and-student-scores/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-edit-group-scores-and-student-scores/step2.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/instructor/tutorial/how-to-edit-group-scores-and-student-scores')({
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
      {/* <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Tutorial</div>
      </div> */}
      <div className="space-y-8">
        <Card className="flex gap-4 w-full shadow-none border-0 py-6 px-2 md:py-8 md:px-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center sm:text-3xl flex gap-2 items-center m-auto mb-4 sm:mb-8">
              How to Add and Edit Group Scores and Student Scores
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
    title: `Edit scores`,
    description: (
      <div className="space-y-4">
        <div>
          Go to the "Scores" tab and click the "Edit Scores" button. A dialog will appear showing the details of the
          group score and the student scores within the group (if any). You can also expand the collapsible sections for
          more details.
        </div>
        <div>
          After entering the values for both the group score and the student scores, click "Save" to store the changes.
        </div>
      </div>
    ),
    image: step2Image,
  },
]
