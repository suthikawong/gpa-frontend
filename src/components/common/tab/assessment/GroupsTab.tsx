import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { GroupTabs } from '@/config/app'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import ActionCard from '../../ActionCard'
import ConfirmDeleteDialog from '../../ConfirmDeleteDialog'
import GroupDialog from '../../dialog/GroupDialog'
import EmptyState from '../../EmptyState'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const GroupsTab = ({ assessmentId }: { assessmentId: Assessment['assessmentId'] }) => {
  const router = useRouter()
  const pathname = router.state.location.pathname

  const onClickGroup = (groupId: Group['groupId']) => {
    router.history.push(`${pathname}/group/${groupId}?tab=${GroupTabs.Scores}`)
  }

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getGroupsByAssessmentId', assessmentId],
    queryFn: async () => await api.assessment.getGroupsByAssessmentId({ assessmentId }),
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
        <div className="text-2xl font-semibold">Groups</div>
        <div className="flex gap-2">
          <DeleteAllGroupDialog
            triggerButton={<Button variant="destructive">Delete All</Button>}
            assessmentId={assessmentId}
          />
          <GroupDialog
            triggerButton={
              <Button>
                <Plus />
                Create
              </Button>
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-grow">
        <SuspenseArea loading={isLoading}>
          {data.length == 0 ? (
            <EmptyState
              title="No Groups Yet"
              description1="It looks like you haven't created any groups."
              icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
            />
          ) : (
            data.map((group, index) => {
              return (
                <ActionCard
                  key={index}
                  title={group.groupName}
                  actions={[
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClickGroup(group.groupId)}
                    >
                      Edit
                    </Button>,
                    <DeleteGroupDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                        >
                          Delete
                        </Button>
                      }
                      assessmentId={group.assessmentId}
                      groupId={group.groupId}
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

export default GroupsTab

const DeleteAllGroupDialog = ({
  triggerButton,
  assessmentId,
}: {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ assessmentId }}
      api={api.assessment.deleteAllGroupsByAssessmentId}
      title="Delete all groups"
      onSuccessMessage="Groups deleted successfully."
      onErrorMessage="Failed to delete groups."
      refetchKeys={['getGroupsByAssessmentId', assessmentId]}
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">Deleting groups will also remove all associated information, including:</div>

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
      refetchKeys={['getGroupsByAssessmentId', assessmentId]}
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
