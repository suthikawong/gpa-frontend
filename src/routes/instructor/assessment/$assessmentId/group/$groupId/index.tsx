import { api } from '@/api'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import CopyButton from '@/components/common/CopyButton'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import GroupDialog from '@/components/pages/dialog/GroupDialog'
import PeerRatingsTab from '@/components/pages/tab/group/PeerRatingsTab'
import ScoresTab from '@/components/pages/tab/group/ScoresTab'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { AssessmentTabs, GroupTabs, Roles } from '@/config/app'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import axios from 'axios'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { GetGroupByIdResponse } from 'gpa-backend/src/group/dto/group.response'
import { Trash2, UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/instructor/assessment/$assessmentId/group/$groupId/')({
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
  validateSearch: z.object({
    tab: z.coerce.string().optional(),
  }),
})

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const router = useRouter()
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
      if (axios.isAxiosError(error) && error.status === 404) toast.error(error.response?.data?.message)
      else toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  const onClickTab = (tab: (typeof GroupTabs)[keyof typeof GroupTabs]) => {
    router.history.push(`/instructor/assessment/${assessmentId}/group/${groupId}?tab=${tab}`)
  }

  return (
    <DashboardLayout className="gap-4">
      <SuspenseArea loading={isLoading}>
        {data && (
          <div className="flex flex-col gap-8 flex-grow">
            <div className="flex flex-col gap-6">
              <Breadcrumbs
                items={[
                  { label: 'My Assessments', href: `/instructor/assessment` },
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
              defaultValue={GroupTabs.Scores}
              value={search.tab}
              className="flex flex-col flex-grow"
            >
              <ScrollArea>
                <div className="w-full relative">
                  <TabsList>
                    <TabsTrigger
                      value={GroupTabs.Scores}
                      onClick={() => onClickTab(GroupTabs.Scores)}
                    >
                      Scores
                    </TabsTrigger>
                    <TabsTrigger
                      value={GroupTabs.PeerRatings}
                      onClick={() => onClickTab(GroupTabs.PeerRatings)}
                    >
                      Peer Ratings
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsScrollBar />
              </ScrollArea>
              <TabsContent
                value={GroupTabs.Scores}
                className="flex flex-col flex-grow"
              >
                <ScoresTab
                  assessmentId={assessmentId}
                  groupId={groupId}
                />
              </TabsContent>
              <TabsContent
                value={GroupTabs.PeerRatings}
                className="flex flex-col flex-grow"
              >
                <PeerRatingsTab
                  assessmentId={assessmentId}
                  groupId={groupId}
                />
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
          <div className="flex flex-col gap-y-2">
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">Group Code:</div>
              <Badge
                variant="secondary"
                className="rounded-sm h-fit"
                asChild
              >
                <div>{data.groupCode}</div>
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-sm cursor-pointer h-fit p-1"
              >
                <CopyButton value={data.groupCode} />
              </Badge>
            </div>
            <Badge
              className="rounded-sm h-fit bg-muted text-muted-foreground"
              asChild
            >
              <div>
                <UsersRound className="text-primary size-[14px]! fill-primary/80 stroke-primary/80" />
                <div className="ml-1 text-sm">{data.memberCount} Students</div>
              </div>
            </Badge>
          </div>
          <div className="gap-2 hidden md:flex md:items-end">
            <Button onClick={onClickViewMembers}>Edit Members</Button>
            <GroupDialog
              data={data}
              triggerButton={
                <Button
                  variant="outline"
                  className="w-22"
                >
                  Rename
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
          <Button onClick={onClickViewMembers}>Edit Members</Button>
          <GroupDialog
            data={data}
            triggerButton={
              <Button
                variant="outline"
                className="w-22"
              >
                Rename
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
      refetchKeys={[['getInstructorAssessments']]}
      redirectTo={`/instructor/assessment/${assessmentId}?tab=${AssessmentTabs.Groups}`}
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this group will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Group score</li>
              <li>Student scores</li>
              <li>Student's peer rating</li>
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
