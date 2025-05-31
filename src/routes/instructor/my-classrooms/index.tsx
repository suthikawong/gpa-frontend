import { api } from '@/api'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/LoadingArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ClassroomWithInstitute } from 'gpa-backend/src/classroom/dto/classroom.response'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { Landmark, Plus } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/my-classrooms/')({
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
  } = useQuery({ queryKey: ['getInstructorClassrooms'], queryFn: api.classroom.getInstructorClassrooms })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">My Classrooms</div>
        <Button size="lg">
          <Plus />
          Create
        </Button>
      </div>
      <SuspenseArea loading={isLoading}>
        {data.length == 0 ? (
          <EmptyState
            title="No Classrooms Yet"
            description1="It looks like you haven't created any classrooms."
            icon={<NoDocuments className="w-[200px] h-[160px] md:w-[350px] md:h-[280px]" />}
            action={<Button>Create Classroom</Button>}
          />
        ) : (
          data.map((classroom, index) => {
            return (
              <ClassroomCard
                key={index}
                data={classroom}
              />
            )
          })
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const ClassroomCard = ({ data }: { data: ClassroomWithInstitute }) => {
  const router = useRouter()

  const onClickClassroom = (classroomId: Classroom['classroomId']) => {
    router.history.push(`/instructor/my-classrooms/${classroomId}`)
  }

  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg md:text-2xl md:mb-1">{data.classroomName}</CardTitle>
            <div className="flex gap-2 items-center">
              <Landmark
                size={16}
                className="hidden md:block text-muted-foreground"
              />
              <CardDescription className="text-sm">{data.institute.instituteName}</CardDescription>
            </div>
          </div>
          <Badge
            size="lg"
            variant={data.isActive ? 'success' : 'destructive'}
            className="h-fit mt-1"
            asChild
          >
            <div>{data.isActive ? 'Acitve' : 'Inactive'}</div>
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
              <div>{data.classroomCode}</div>
            </Badge>
          </div>
          <Button
            className="hidden sm:block"
            onClick={() => onClickClassroom(data.classroomId)}
          >
            View Details
          </Button>
        </div>
        <Button
          className="w-full sm:hidden"
          onClick={() => onClickClassroom(data.classroomId)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
