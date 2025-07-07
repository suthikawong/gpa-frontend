import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { format } from 'date-fns'
import { Assessment, Group, ScoringComponent } from 'gpa-backend/src/drizzle/schema'
import { useEffect } from 'react'
import EmptyState from '../../EmptyState'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const PeerRatingsTab = ({
  assessmentId,
  groupId,
}: {
  assessmentId: Assessment['assessmentId']
  groupId: Group['groupId']
}) => {
  const router = useRouter()

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

  const onClickScoringComponent = (scoringComponentId: ScoringComponent['scoringComponentId']) => {
    router.history.push(
      `/instructor/assessment/${assessmentId}/group/${groupId}/peer-rating/scoring-component/${scoringComponentId}`
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Scoring Components</div>
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
            data.map((scoringComponent) => {
              return (
                <Card
                  key={scoringComponent.scoringComponentId}
                  className="w-full sm:py-4!"
                >
                  <CardContent className="flex-col sm:px-4!">
                    <div className="flex justify-between items-center sm:mb-0">
                      <CardTitle className="text-lg">{`${format(scoringComponent.startDate, 'dd/MM/y')} - ${format(scoringComponent.endDate, 'dd/MM/y')}`}</CardTitle>
                      <Button
                        variant="outline"
                        className="hidden sm:block"
                        onClick={() => onClickScoringComponent(scoringComponent.scoringComponentId)}
                      >
                        View Details
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4 sm:hidden"
                      onClick={() => onClickScoringComponent(scoringComponent.scoringComponentId)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </SuspenseArea>
      </div>
    </div>
  )
}

export default PeerRatingsTab
