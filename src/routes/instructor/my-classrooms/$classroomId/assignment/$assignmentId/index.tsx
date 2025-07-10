import { api } from '@/api'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import AssignmentDialog from '@/components/common/dialog/AssignmentDialog'
import SuspenseArea from '@/components/common/SuspenseArea'
import AssessmentPeriod from '@/components/common/tab/assignment/AssessmentPeriod'
import CriteriaTab from '@/components/common/tab/assignment/CriteriaTab'
import GroupsTab from '@/components/common/tab/assignment/GroupsTab'
import Model from '@/components/common/tab/assignment/Model'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { format } from 'date-fns'
import { GetAssignmentByIdResponse } from 'gpa-backend/src/assignment/dto/assignment.response'
import { Assignment, Classroom } from 'gpa-backend/src/drizzle/schema'
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/my-classrooms/$classroomId/assignment/$assignmentId/')({
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
  const params = Route.useParams()
  const classroomId = parseInt(params.classroomId)
  const assignmentId = parseInt(params.assignmentId)

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getAssignmentById', assignmentId],
    queryFn: async () => await api.assignment.getAssignmentById({ assignmentId }),
  })

  const data = res?.data ?? null

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <DashboardLayout className="gap-4">
      <SuspenseArea loading={isLoading}>
        {data && (
          <div className="flex flex-col gap-8 flex-grow">
            <div className="flex flex-col gap-6">
              <Breadcrumbs
                items={[
                  { label: 'Classroom', href: `/instructor/my-classrooms/${classroomId}` },
                  {
                    label: 'Assignment',
                    href: `/instructor/my-classrooms/${classroomId}/assignment/${assignmentId}`,
                    isCurrentPage: true,
                  },
                ]}
              />
              <AssignmentCard data={data} />
            </div>
            <Tabs
              defaultValue="groups"
              className="flex flex-col flex-grow"
            >
              <ScrollArea>
                <div className="w-full relative">
                  <TabsList>
                    <TabsTrigger value="groups">Groups</TabsTrigger>
                    <TabsTrigger value="criteria">Criteria</TabsTrigger>
                    <TabsTrigger value="model">Model</TabsTrigger>
                    <TabsTrigger value="assessment-period">Assessment Period</TabsTrigger>
                  </TabsList>
                </div>
                <TabsScrollBar />
              </ScrollArea>
              <TabsContent value="groups">
                <GroupsTab assignmentId={assignmentId} />
              </TabsContent>
              <TabsContent value="criteria">
                <CriteriaTab />
              </TabsContent>
              <TabsContent value="model">
                <Model />
              </TabsContent>
              <TabsContent value="assessment-period">
                <AssessmentPeriod />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const AssignmentCard = ({ data }: { data: GetAssignmentByIdResponse }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <CardTitle className="text-lg md:text-2xl md:mb-1">{data.assignmentName}</CardTitle>
          <Badge
            size="lg"
            variant={data.isPublished ? 'success' : 'destructive'}
            className="h-fit mt-1"
            asChild
          >
            <div>{data.isPublished ? 'Published' : 'Unpublished'}</div>
          </Badge>
        </div>
        <div className="flex justify-between my-2 md:mb-0">
          <div className="flex items-center gap-x-2">
            <CardDescription className="text-sm">Due date: {format(data.dueDate, 'PPP')}</CardDescription>
          </div>
          <div className="gap-2 hidden md:flex">
            <Button variant="secondary">End Submission</Button>
            <AssignmentDialog
              data={data}
              triggerButton={
                <Button
                  variant="outline"
                  className="w-22"
                >
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <DeleteAssignmentDialog
              triggerButton={
                <Button variant="destructiveOutline">
                  <Trash2 />
                  Delete
                </Button>
              }
              classroomId={data.classroomId}
              assignmentId={data.assignmentId}
            />
          </div>
        </div>
        <Separator className="md:hidden" />
        <div className="mt-4 flex gap-2 justify-end md:hidden">
          <Button variant="secondary">End Submission</Button>
          <AssignmentDialog
            data={data}
            triggerButton={
              <Button
                variant="outline"
                className="w-22"
              >
                <Pencil />
                Edit
              </Button>
            }
          />
          <DeleteAssignmentDialog
            triggerButton={
              <Button variant="destructiveOutline">
                <Trash2 />
                Delete
              </Button>
            }
            classroomId={data.classroomId}
            assignmentId={data.assignmentId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteAssignmentDialog = ({
  triggerButton,
  classroomId,
  assignmentId,
}: {
  triggerButton: React.ReactNode
  classroomId: Classroom['classroomId']
  assignmentId: Assignment['assignmentId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ assignmentId }}
      api={api.assignment.deleteAssignment}
      title="Delete Assignment"
      onSuccessMessage="Assignment deleted successfully."
      onErrorMessage="Failed to delete assignment."
      refetchKeys={['getInstructorAssignments']}
      redirectTo={`/instructor/my-classrooms/${classroomId}`}
      className="sm:!max-w-[600px]"
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this assignment will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Groups</li>
              <li>Criteria</li>
              <li>Model configuration</li>
              <li>Assessment periods</li>
              <li>Assessment questions</li>
              <li>Group marks</li>
              <li>Student marks</li>
              <li>Student's peer ratings</li>
            </ul>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            This action cannot be undone. Please make sure you've backed up any important data before continuing.
          </div>
        </div>
      }
    />
  )
}
