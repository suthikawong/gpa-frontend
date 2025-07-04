import { api } from '@/api'
import ActionCard from '@/components/common/ActionCard'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import ClassroomDialog from '@/components/common/dialog/ClassroomDialog'
import EmptyState from '@/components/common/EmptyState'
import { PaginationControlled } from '@/components/common/PaginationControlled'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { appPaths } from '@/config'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClassroomWithInstructor } from 'gpa-backend/src/classroom/dto/classroom.response'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { Landmark, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/instructor/my-classrooms/$classroomId')({
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

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getClassroomById', classroomId],
    queryFn: async () => await api.classroom.getClassroomById({ classroomId }),
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
            <ClassroomCard data={data} />
            <Tabs
              defaultValue="assignments"
              className="flex flex-col flex-grow"
            >
              <ScrollArea>
                <div className="w-full relative">
                  <TabsList>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                  </TabsList>
                </div>
                <TabsScrollBar />
              </ScrollArea>
              <TabsContent value="assignments">
                <AssignmentsTab classroomId={classroomId} />
              </TabsContent>
              <TabsContent
                value="students"
                className="flex flex-col flex-grow"
              >
                <StudentsTab classroomId={classroomId} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const ClassroomCard = ({ data }: { data: ClassroomWithInstructor }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg md:text-2xl md:mb-1">{data.classroomName}</CardTitle>
            <div className="hidden md:flex gap-2 items-center">
              <Landmark
                size={16}
                className="block text-muted-foreground"
              />
              <CardDescription className="text-sm">{data.institute.instituteName}</CardDescription>
              <div className="text-muted-foreground/80">|</div>
              <Users
                size={16}
                className="block text-muted-foreground"
              />
              <CardDescription className="text-sm">{data.instructor.name}</CardDescription>
            </div>
            <div className="flex flex-col gap-2 mt-4 mb-2 md:hidden">
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Landmark size={16} />
                  <Label>Institute</Label>
                </div>
                <CardDescription className="text-sm">{data.institute.instituteName}</CardDescription>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Users size={16} />
                  <Label>Instructor</Label>
                </div>
                <CardDescription className="text-sm">{data.instructor.name}</CardDescription>
              </div>
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
        <div className="flex justify-between my-4 md:mb-0">
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
          <div className="flex gap-2">
            <ClassroomDialog
              data={data}
              triggerButton={
                <Button
                  variant="outline"
                  className="hidden w-22 md:flex"
                >
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <DeleteClassroomDialog
              triggerButton={
                <Button
                  variant="destructiveOutline"
                  className="hidden md:flex"
                >
                  <Trash2 />
                  Delete
                </Button>
              }
              classroomId={data.classroomId}
            />
          </div>
        </div>
        <Separator className="md:hidden" />
        <div className="mt-4 flex gap-2 justify-end md:hidden">
          <ClassroomDialog
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
          <DeleteClassroomDialog
            triggerButton={
              <Button variant="destructiveOutline">
                <Trash2 />
                Delete
              </Button>
            }
            classroomId={data.classroomId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteClassroomDialog = ({
  triggerButton,
  classroomId,
}: {
  triggerButton: React.ReactNode
  classroomId: Classroom['classroomId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ classroomId }}
      api={api.classroom.deleteClassroom}
      title="Delete Classroom"
      onSuccessMessage="Classroom deleted successfully."
      onErrorMessage="Failed to delete classroom."
      refetchKeys={['getInstructorClassrooms']}
      redirectTo={appPaths.instructor.myClassrooms}
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this classroom will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Assignments</li>
              <li>Students</li>
              <li>Groups</li>
              <li>Criteria</li>
              <li>Model configuration</li>
              <li>Assessment periods</li>
              <li>Assessment questions</li>
              <li>Group marks</li>
              <li>Student marks</li>
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

const AssignmentsTab = ({ classroomId }: { classroomId: Classroom['classroomId'] }) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getAssignmentByClassroomId', classroomId],
    queryFn: async () => await api.classroom.getAssignmentByClassroomId({ classroomId }),
  })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Assignments</div>
        <Button>
          <Plus />
          Create
        </Button>
      </div>
      <div className="flex flex-col gap-4 flex-grow">
        <SuspenseArea loading={isLoading}>
          {data.length == 0 ? (
            <EmptyState
              title="No Classrooms Yet"
              description1="It looks like you haven't created any classrooms."
              icon={<NoDocuments className="w-[200px] h-[160px] md:w-[350px] md:h-[280px]" />}
              action={<Button>Create Assignment</Button>}
            />
          ) : (
            data.map((assignment, index) => {
              return (
                <ActionCard
                  key={index}
                  header={assignment.assignmentName}
                  actions={[
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('view')}
                    >
                      View <span className="hidden md:block">Details</span>
                    </Button>,
                  ]}
                />
              )
            })
          )}
        </SuspenseArea>
      </div>
    </div>
  )
}

const StudentsTab = ({ classroomId }: { classroomId: Classroom['classroomId'] }) => {
  const [page, setPage] = useState(1)
  const pageSize = 4

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['searchStudentsInClassroom', classroomId, page],
    queryFn: async () => {
      return await api.classroom.searchStudentsInClassroom({
        classroomId,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
    },
  })

  const data = res?.data ?? []
  const total = res?.total ?? 0

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Students</div>
        <Button>
          <Plus />
          Create
        </Button>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        <div className="flex flex-col flex-grow gap-4 ">
          <SuspenseArea loading={isLoading}>
            {data.length == 0 ? (
              <EmptyState
                title="No Classrooms Yet"
                description1="It looks like you haven't created any classrooms."
                icon={<NoDocuments className="w-[200px] h-[160px] md:w-[350px] md:h-[280px]" />}
                action={<Button>Create Assignment</Button>}
              />
            ) : (
              data.map((student, index) => {
                return (
                  <ActionCard
                    key={index}
                    header={student.name}
                    actions={[
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('view')}
                      >
                        View <span className="hidden md:block">Details</span>
                      </Button>,
                    ]}
                  />
                )
              })
            )}
          </SuspenseArea>
        </div>
        <PaginationControlled
          page={page}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
        />
      </div>
    </>
  )
}
