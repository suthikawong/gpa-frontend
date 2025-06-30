import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import ActionCard from '../../ActionCard'
import ConfirmDeleteDialog from '../../ConfirmDeleteDialog'
import ScoringComponentDialog from '../../dialog/ScoringComponentDialog'
import EmptyState from '../../EmptyState'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const ScoringComponentsTab = ({ assessmentId }: { assessmentId: Assessment['assessmentId'] }) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getScoringComponentsByAssessmentId', assessmentId],
    queryFn: async () => await api.assessment.getScoringComponentsByAssessmentId({ assessmentId }),
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
        <div className="text-2xl font-semibold">Scoring Components</div>
        <ScoringComponentDialog
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
              title="No Scoring Component Yet"
              description1="It looks like you haven't created any scoring components."
              icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
              action={<Button>Create Scoring Component</Button>}
            />
          ) : (
            data.map((scoringComponent, index) => {
              return (
                <ActionCard
                  key={index}
                  header={`${format(scoringComponent.startDate, 'dd/MM/y')} - ${format(scoringComponent.endDate, 'dd/MM/y')}`}
                  actions={[
                    <ScoringComponentDialog
                      data={scoringComponent}
                      triggerButton={
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          Edit
                        </Button>
                      }
                    />,
                    <ConfirmDeleteDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                        >
                          Delete
                        </Button>
                      }
                      data={{ scoringComponentId: scoringComponent.scoringComponentId }}
                      api={api.scoringComponent.deleteScoringComponent}
                      title="Confirm Delete"
                      onSuccessMessage="Scoring Component removed successfully."
                      onErrorMessage="Failed to remove student."
                      refetchKeys={['getScoringComponentsByAssessmentId', assessmentId]}
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

export default ScoringComponentsTab
