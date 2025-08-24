import { api } from '@/api'
import JoinAssessmentDialog from '@/components/pages/dialog/JoinAssessmentDialog'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/student/assessment/')({
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
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({ queryKey: ['getAssessmentsByStudent'], queryFn: api.assessment.getAssessmentsByStudent })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Peer Assessments</div>
        <JoinAssessmentDialog
          triggerButton={
            <Button size="lg">
              <Plus />
              Join
            </Button>
          }
        />
      </div>
      <SuspenseArea loading={isLoading}>
        {data.length == 0 ? (
          <EmptyState
            title="No Joined Assessment"
            description1="It looks like you haven't joined any assessments."
            icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
          />
        ) : (
          data.map((assessment, index) => {
            return (
              <AssessmentCard
                key={index}
                data={assessment}
              />
            )
          })
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const AssessmentCard = ({ data }: { data: Omit<Assessment, 'modelId' | 'modelConfig'> }) => {
  const router = useRouter()

  const onClickAssessment = (assessmentId: Assessment['assessmentId']) => {
    router.history.push(`/student/assessment/${assessmentId}`)
  }

  return (
    <Card className="w-full sm:py-4!">
      <CardContent className="flex-col sm:px-4!">
        <div className="flex justify-between items-center sm:mb-0">
          <CardTitle className="text-lg">{data.assessmentName}</CardTitle>
          <Button
            className="hidden sm:block"
            onClick={() => onClickAssessment(data.assessmentId)}
          >
            View Details
          </Button>
        </div>
        <Button
          className="w-full mt-4 sm:hidden"
          onClick={() => onClickAssessment(data.assessmentId)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
