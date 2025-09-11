import step1Image from '@/assets/tutorial/instructor/how-to-use-automatic-score-calculation/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-use-automatic-score-calculation/step2.png'
import step3Image from '@/assets/tutorial/instructor/how-to-use-automatic-score-calculation/step3.png'
import step4Image from '@/assets/tutorial/instructor/how-to-use-automatic-score-calculation/step4.png'
import step5Image from '@/assets/tutorial/instructor/how-to-use-automatic-score-calculation/step5.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/instructor/tutorial/how-to-use-automatic-score-calculation')({
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
              How to Use Automatic Score Calculation
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
    description: `Click the "View Details" button of the assessment that contains the group. Then, go to the "Groups" tab and click Edit to open the group details page.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Use automatic score calculation`,
    description: (
      <div className="space-y-4">
        <div>
          Go to the "Scores" tab and click the "Edit Scores" button. A dialog will appear, where you will see the "Auto
          Calculate" button on the right-hand side.
        </div>
        <div>
          You can only use automatic score calculation if the group has at least two students and at least one
          component. You can read more about how to create a component{' '}
          <Link
            className="font-semibold"
            to="/instructor/tutorial/how-to-set-the-assessment-dates"
          >
            here
          </Link>
          .
        </div>
        <div>If both conditions are met, click the "Auto Calculate" button to proceed.</div>
      </div>
    ),
    image: step2Image,
  },
  {
    step: 3,
    title: `Review students' peer ratings`,
    description: (
      <div className="space-y-4">
        <div>
          After clicking "Auto Calculate", the system will display a list of students who did not participate in the
          peer assessment within the given timeframe.
        </div>
        <div>
          <div className="font-semibold">At this point, you can either:</div>
          <div className="list-disc">
            <li>
              Stop and remind the student to complete the assessment (you will need to adjust the component's time
              window to allow them to submit their ratings), or
            </li>
            <li>
              Ignore the missing ratings and let the selected assessment model handle the empty peer ratings
              automatically.
            </li>
          </div>
        </div>
        <div>If you wish to continue with auto calculation, click "Continue".</div>
      </div>
    ),
    image: step3Image,
  },
  {
    step: 4,
    title: `Review assessment model parameters`,
    description: (
      <div className="space-y-4">
        <div>
          In this dialog, the system will summarize the model parameters that will be used to calculate student scores.
          By default, these values come from the configuration you set up earlier when creating the assessment model.
        </div>
        <div>
          You can adjust parameters that the system allows you to edit and also assign weights to individual students if
          needed. Once everything is set, click "Calculate" to process the scores.
        </div>
      </div>
    ),
    image: step4Image,
  },
  {
    step: 5,
    title: `View the results`,
    description: `Once the calculation is complete, the system will save the scores to the database. The results will be displayed in the student scores table under the "Scores" tab.`,
    image: step5Image,
  },
]
