import { api } from '@/api'
import ActionCard from '@/components/common/ActionCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import AddMemberDialog from '@/components/common/dialog/AddMemberDialog'
import GroupDialog from '@/components/common/dialog/GroupDialog'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TabsScrollBar } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Assignment, Classroom, Group, User } from 'gpa-backend/src/drizzle/schema'
import { GetGroupByIdResponse } from 'gpa-backend/src/group/dto/group.response'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/my-classrooms/$classroomId/assignment/$assignmentId/group/$groupId')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const classroomId = parseInt(params.classroomId)
  const assignmentId = parseInt(params.assignmentId)
  const groupId = parseInt(params.groupId)

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getGroupById', groupId],
    queryFn: async () => await api.group.getGroupById({ groupId }),
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
                  },
                  {
                    label: 'Group',
                    href: `/instructor/my-classrooms/${classroomId}/assignment/${assignmentId}/group/${groupId}`,
                    isCurrentPage: true,
                  },
                ]}
              />
              <GroupCard
                data={data}
                classroomId={classroomId}
              />
              <MemberSection
                groupId={groupId}
                classroomId={classroomId}
              />
            </div>
            <ScrollArea>
              <div></div>
              <TabsScrollBar />
            </ScrollArea>
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const GroupCard = ({ data, classroomId }: { data: GetGroupByIdResponse; classroomId: Classroom['classroomId'] }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <CardTitle className="text-lg md:text-2xl md:mb-1">{data.groupName}</CardTitle>
        <div className="flex justify-between my-2 md:mb-0">
          <div className="flex gap-x-2">
            <div className="text-muted-foreground text-sm">Group Code:</div>
            <Badge
              variant="secondary"
              className="rounded-sm h-fit"
              asChild
            >
              <div>{data.groupCode}</div>
            </Badge>
          </div>
          <div className="gap-2 hidden md:flex">
            <GroupDialog
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
            <DeleteGroupDialog
              triggerButton={
                <Button variant="destructiveOutline">
                  <Trash2 />
                  Delete
                </Button>
              }
              classroomId={classroomId}
              assignmentId={data.assignmentId}
              groupId={data.groupId}
            />
          </div>
        </div>
        <Separator className="md:hidden" />
        <div className="mt-4 flex gap-2 justify-end md:hidden">
          <GroupDialog
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
          <DeleteGroupDialog
            triggerButton={
              <Button variant="destructiveOutline">
                <Trash2 />
                Delete
              </Button>
            }
            classroomId={classroomId}
            assignmentId={data.assignmentId}
            groupId={data.groupId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteGroupDialog = ({
  triggerButton,
  classroomId,
  assignmentId,
  groupId,
}: {
  triggerButton: React.ReactNode
  classroomId: Classroom['classroomId']
  assignmentId: Assignment['assignmentId']
  groupId: Group['groupId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ groupId }}
      api={api.group.deleteGroup}
      title="Delete group"
      onSuccessMessage="Group deleted successfully."
      onErrorMessage="Failed to delete group."
      refetchKeys={['getInstructorAssignments']}
      redirectTo={`/instructor/my-classrooms/${classroomId}/assignment/${assignmentId}`}
      className="sm:!max-w-[600px]"
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this group will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
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

const MemberSection = ({
  groupId,
  classroomId,
}: {
  groupId: Group['groupId']
  classroomId: Classroom['classroomId']
}) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getMemberByGroupId', groupId],
    queryFn: async () => await api.group.getMemberByGroupId({ groupId }),
  })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <div className="mt-6">
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Members</div>
        <AddMemberDialog
          triggerButton={
            <Button>
              <Plus />
              Add
            </Button>
          }
          classroomId={classroomId}
          members={data}
        />
      </div>
      <div className="flex flex-col gap-4 flex-grow">
        <SuspenseArea loading={isLoading}>
          {data.length == 0 ? (
            <EmptyState
              title="No Member Yet"
              description1="It looks like you haven't added any members."
              icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
              action={<Button>Add Member</Button>}
            />
          ) : (
            data.map((student, index) => {
              return (
                <ActionCard
                  key={index}
                  header={student.name}
                  actions={[
                    <RemoveMemberDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                        >
                          <Trash2 className="sm:hidden" />
                          <span className="hidden sm:block">Remove</span>
                        </Button>
                      }
                      groupId={groupId}
                      studentUserId={student.userId}
                    />,
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

const RemoveMemberDialog = ({
  triggerButton,
  groupId,
  studentUserId,
}: {
  triggerButton: React.ReactNode
  groupId: Group['groupId']
  studentUserId: User['userId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ groupId, studentUserId }}
      api={api.group.removeMember}
      title="Remove Member"
      onSuccessMessage="Member removed successfully."
      onErrorMessage="Failed to remove member."
      refetchKeys={['getMemberByGroupId', groupId]}
      className="sm:!max-w-[600px]"
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this member will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
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
