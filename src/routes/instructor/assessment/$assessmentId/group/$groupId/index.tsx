import { api } from '@/api'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import GroupDialog from '@/components/common/dialog/GroupDialog'
import SuspenseArea from '@/components/common/SuspenseArea'
import ScoresTab from '@/components/common/tab/group/ScoresTab'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { GetGroupByIdResponse } from 'gpa-backend/src/group/dto/group.response'
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/assessment/$assessmentId/group/$groupId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const params = Route.useParams()
  const assessmentId = parseInt(params.assessmentId)
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
                  { label: 'Peer Assessments', href: `/instructor/assessment` },
                  {
                    label: 'Assessment',
                    href: `/instructor/assessment/${assessmentId}`,
                  },
                  {
                    label: 'Group',
                    href: `/instructor/assessment/${assessmentId}/group/${groupId}`,
                    isCurrentPage: true,
                  },
                ]}
              />
              <GroupCard data={data} />
            </div>
            <Tabs
              defaultValue="scores"
              className="flex flex-col flex-grow"
            >
              <ScrollArea>
                <div className="w-full relative">
                  <TabsList>
                    <TabsTrigger value="scores">Scores</TabsTrigger>
                    <TabsTrigger value="peer-ratings">Peer Ratings</TabsTrigger>
                  </TabsList>
                </div>
                <TabsScrollBar />
              </ScrollArea>
              <TabsContent
                value="scores"
                className="flex flex-col flex-grow"
              >
                <ScoresTab groupId={groupId} />
              </TabsContent>
              <TabsContent
                value="peer-ratings"
                className="flex flex-col flex-grow"
              >
                {/* <GroupsTab assessmentId={assessmentId} /> */}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const GroupCard = ({ data }: { data: GetGroupByIdResponse }) => {
  const router = useRouter()
  const pathname = router.state.location.pathname

  const onClickViewMembers = () => {
    router.history.push(`${pathname}/member`)
  }

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
            <Button onClick={onClickViewMembers}>View Members</Button>
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
              assessmentId={data.assessmentId}
              groupId={data.groupId}
            />
          </div>
        </div>
        <Separator className="md:hidden" />
        <div className="mt-4 flex gap-2 justify-end md:hidden">
          <Button onClick={onClickViewMembers}>View Members</Button>
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
            assessmentId={data.assessmentId}
            groupId={data.groupId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteGroupDialog = ({
  triggerButton,
  assessmentId,
  groupId,
}: {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
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
      refetchKeys={['getInstructorAssessments']}
      redirectTo={`/instructor/assessment/${assessmentId}`}
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
