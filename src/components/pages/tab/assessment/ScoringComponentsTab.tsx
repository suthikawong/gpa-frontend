import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Assessment, ScoringComponent } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import ActionCard from '../../../common/ActionCard'
import ConfirmDeleteDialog from '../../../common/ConfirmDeleteDialog'
import ScoringComponentDialog from '../../dialog/ScoringComponentDialog'
import EmptyState from '../../../common/EmptyState'
import SuspenseArea from '../../../common/SuspenseArea'
import toast from '../../../common/toast'

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
            />
          ) : (
            data.map((scoringComponent, index) => {
              return (
                <ActionCard
                  key={index}
                  title={`${format(scoringComponent.startDate, 'dd/MM/y')} - ${format(scoringComponent.endDate, 'dd/MM/y')}`}
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
                    <DeleteScoringComponentDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                        >
                          Delete
                        </Button>
                      }
                      assessmentId={assessmentId}
                      scoringComponentId={scoringComponent.scoringComponentId}
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

const DeleteScoringComponentDialog = ({
  triggerButton,
  assessmentId,
  scoringComponentId,
}: {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
  scoringComponentId: ScoringComponent['scoringComponentId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ scoringComponentId }}
      api={api.scoringComponent.deleteScoringComponent}
      title="Confirm Delete"
      onSuccessMessage="Scoring Component removed successfully."
      onErrorMessage="Failed to remove student."
      refetchKeys={[
        ['getScoringComponentsByAssessmentId', assessmentId],
        ['getAssessmentById', assessmentId],
      ]}
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this scoring component will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
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

export default ScoringComponentsTab
