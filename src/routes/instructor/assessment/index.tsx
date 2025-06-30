import { api } from '@/api'
import AssessmentDialog from '@/components/common/dialog/AssessmentDialog'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/assessment/')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
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
  } = useQuery({ queryKey: ['getAssessmentsByInstructor'], queryFn: api.assessment.getAssessmentsByInstructor })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">My Assessments</div>
        <AssessmentDialog
          triggerButton={
            <Button size="lg">
              <Plus />
              Create
            </Button>
          }
        />
      </div>
      <SuspenseArea loading={isLoading}>
        {data.length == 0 ? (
          <EmptyState
            title="No Assessments Yet"
            description1="It looks like you haven't created any assessments."
            icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
            action={<Button>Create Assessment</Button>}
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
    router.history.push(`/instructor/assessment/${assessmentId}`)
  }

  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <CardTitle className="text-lg md:text-xl md:mb-1">{data.assessmentName}</CardTitle>
          <Badge
            size="lg"
            variant={data.isPublished ? 'success' : 'destructive'}
            className="h-fit mt-1"
            asChild
          >
            <div>{data.isPublished ? 'Acitve' : 'Inactive'}</div>
          </Badge>
        </div>
        <div className="flex justify-between my-4 sm:mb-0">
          <div className="flex gap-x-2">
            <div className="text-muted-foreground text-sm">Class Code:</div>
            <Badge
              variant="secondary"
              className="rounded-sm h-fit"
              asChild
            >
              <div>{data.assessmentCode}</div>
            </Badge>
          </div>
          <Button
            className="hidden sm:block"
            onClick={() => onClickAssessment(data.assessmentId)}
          >
            View Details
          </Button>
        </div>
        <Button
          className="w-full sm:hidden"
          onClick={() => onClickAssessment(data.assessmentId)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
