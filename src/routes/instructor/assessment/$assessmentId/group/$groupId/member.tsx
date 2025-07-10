import { api } from '@/api'
import ActionCard from '@/components/common/ActionCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import AddMemberDialog from '@/components/common/dialog/AddMemberDialog'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Roles } from '@/config/app'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Group, User } from 'gpa-backend/src/drizzle/schema'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute('/instructor/assessment/$assessmentId/group/$groupId/member')({
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
  const params = Route.useParams()
  const assessmentId = parseInt(params.assessmentId)
  const groupId = parseInt(params.groupId)

  const {
    data: memeberRes,
    isLoading: isLoadingMember,
    error: errorMember,
  } = useQuery({
    queryKey: ['getMembersByGroupId', groupId],
    queryFn: async () => await api.group.getMembersByGroupId({ groupId }),
  })

  const memberData = memeberRes?.data ?? []

  const {
    data: assessmentRes,
    isLoading: isLoadingAssessment,
    error: errorAssessment,
  } = useQuery({
    queryKey: ['getAssessmentById', assessmentId],
    queryFn: async () => await api.assessment.getAssessmentById({ assessmentId }),
  })

  const assessmentData = assessmentRes?.data ?? null

  useEffect(() => {
    if (errorMember || errorAssessment) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [errorMember, errorAssessment])

  return (
    <DashboardLayout className="gap-8">
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
          },
          {
            label: 'Members',
            href: `/instructor/assessment/${assessmentId}/group/${groupId}/member`,
            isCurrentPage: true,
          },
        ]}
      />
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center md:mb-4">
          <div className="text-xl font-bold md:text-3xl">Members</div>
          <AddMemberDialog
            triggerButton={
              <Button>
                <Plus />
                Add
              </Button>
            }
            assessmentId={assessmentId}
            groupId={groupId}
            members={memberData}
            canEdit={assessmentData?.canEdit ?? false}
          />
        </div>
        <SuspenseArea loading={isLoadingMember || isLoadingAssessment}>
          {memberData.length == 0 ? (
            <EmptyState
              title="No Member Yet"
              description1="It looks like you haven't added any members."
              icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
            />
          ) : (
            memberData.map((student, index) => {
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
                          disabled={assessmentData?.canEdit ? false : true}
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
    </DashboardLayout>
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
      api={api.group.deleteGroupMember}
      title="Remove Member"
      onSuccessMessage="Member removed successfully."
      onErrorMessage="Failed to remove member."
      refetchKeys={['getMembersByGroupId', groupId]}
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
