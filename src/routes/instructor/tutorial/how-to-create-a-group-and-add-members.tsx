import step1Image from '@/assets/tutorial/instructor/how-to-create-a-group-and-add-members/step1.png'
import step2Image from '@/assets/tutorial/instructor/how-to-create-a-group-and-add-members/step2.png'
import step3Image from '@/assets/tutorial/instructor/how-to-create-a-group-and-add-members/step3.png'
import step4Image from '@/assets/tutorial/instructor/how-to-create-a-group-and-add-members/step4.png'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import StepCard from '@/components/pages/tutorial/StepCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/instructor/tutorial/how-to-create-a-group-and-add-members')({
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
              How to Create a Group and Add Members
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
    description: `Click the "View Details" button of the assessment where you want to create a group. This will take you to the assessment details page.`,
    image: step1Image,
  },
  {
    step: 2,
    title: `Create a group`,
    description: `Go to the "Groups" tab and click the "Create" button. A dialog will appear with several options for creating a group. For this example, select "Create a single group". Enter the "Group name", then click "Create" to complete the process.`,
    image: step2Image,
  },
  {
    step: 3,
    title: `Open the group details page`,
    description: `Once the group is created successfully, it will appear in the Groups tab. Click "Edit" on that group to open the group details page, which also displays the "Group code".`,
    image: step3Image,
  },
  {
    step: 4,
    title: `Add members to the group`,
    description: `Click "Edit Members" to go to the "Members" page. To add students to the group, click the "Add" button, and a dialog will appear where you can search for students within the assessment. To add a student, click Add next to their name. Once added successfully, the button will change to "Added".`,
    image: step4Image,
  },
]
