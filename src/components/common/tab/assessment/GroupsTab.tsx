import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import ActionCard from '../../ActionCard'
import GroupDialog from '../../dialog/GroupDialog'
import EmptyState from '../../EmptyState'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const GroupsTab = ({ assessmentId }: { assessmentId: Assessment['assessmentId'] }) => {
  const router = useRouter()
  const pathname = router.state.location.pathname

  const onClickGroup = (groupId: Group['groupId']) => {
    router.history.push(`${pathname}/group/${groupId}`)
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
        <GroupDialog
          triggerButton={
            <Button>
              <Plus />
              Create
            </Button>
          }
        />
      </div>
      <div className="flex flex-col gap-4 flex-grow">
        <SuspenseArea loading={isLoading}>
          {data.length == 0 ? (
            <EmptyState
              title="No Classrooms Yet"
              description1="It looks like you haven't created any classrooms."
              icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
            />
          ) : (
            data.map((group, index) => {
              return (
                <ActionCard
                  key={index}
                  header={group.groupName}
                  actions={[
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClickGroup(group.groupId)}
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

export default GroupsTab
