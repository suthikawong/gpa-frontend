import step1Image from '@/assets/tutorial/instructor/how-to-setup-assessment/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-setup-assessment/step2.png'
import step3Image from '@/assets/tutorial/instructor/how-to-setup-assessment/step3.png'
import step4Image from '@/assets/tutorial/instructor/how-to-setup-assessment/step4.png'
import step5Image from '@/assets/tutorial/instructor/how-to-setup-assessment/step5.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/instructor/tutorial/how-to-setup-assessment')({
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
              How to Setup Assessment
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
    title: `Create an Assessment`,
    description: `Go to the "My Assessments" page and click the "Create" button. Enter the name of your assessment, then click "Create" to complete the setup.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Open the Modal tab to set up the scoring formula`,
    description: `Once the assessment has been created successfully, it will appear in the list of assessments. Click the "View Details" button of the assessment you just created, then go to the "Modal" tab.`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Set up the assessment model manually`,
    description: (
      <div className="space-y-4">
        <div>
          You can configure the assessment model yourself by selecting the model type in the "Model Configuration" form.
          The system provides two options: "QASS" and "WebAVALIA". To learn more about the terminologies of each model,
          you can check the tooltips or click{' '}
          <Link
            to="/instructor/tutorial/qass-terminology"
            className="font-semibold"
          >
            QASS
          </Link>{' '}
          or{' '}
          <Link
            to="/instructor/tutorial/webavalia-terminology"
            className="font-semibold"
          >
            WebAVALIA
          </Link>
          .
        </div>
        <div>
          If you prefer, you can also use the system's recommended values by clicking "Use Recommended". Once you finish
          setting up, click Save to store your configuration.
        </div>
      </div>
    ),
    image: step3Image,
  },
  {
    step: 4,
    title: `Set up the assessment model using a questionnaire`,
    description: (
      <div className="space-y-4">
        <div>
          You can also set up the assessment model using the questionnaire feature. We understand that configuring an
          assessment model can be challenging and may take time to learn about both models. To make this easier, the
          system provides a feature that helps you set up the model more quickly.
        </div>
        <div>
          Simply click the "Start Questionnaire" button in the "Model" tab. A dialog will appear where you need to
          answer the questionnaire based on your scoring preferences.
        </div>
        <div>
          When you finish, click Apply to paste the questionnaire results into the form. If you are satisfied with the
          configuration, click Save to store your settings.
        </div>
      </div>
    ),
    image: step4Image,
  },
  {
    step: 5,
    title: `Publish the assessment`,
    description: (
      <div className="space-y-4">
        <div>
          After completing the model setup, the next step is to publish the assessment so that students can participate.
        </div>
        <div>
          To publish it, go to the details page of the assessment you created and click Edit. A dialog for editing the
          assessment will appear. Toggle the Publish switch to enable publishing, then click Save to confirm your
          changes.
        </div>
      </div>
    ),
    image: step5Image,
  },
]
