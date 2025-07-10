import { api } from '@/api'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import PeerRatingDialog from '@/components/common/dialog/PeerRatingDialog'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Roles } from '@/config/app'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  GetPeerRatingsByScoringComponentIdResponse,
  UserWithPeerRating,
} from 'gpa-backend/src/peer-rating/dto/peer-rating.response'
import { GetScoringComponentByIdResponse } from 'gpa-backend/src/scoring-component/dto/scoring-component.response'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute(
  '/instructor/assessment/$assessmentId/group/$groupId/peer-rating/scoring-component/$scoringComponentId'
)({
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

enum Toggle {
  Summary = 'summary',
  PeerMatrix = 'peer-matrix',
}

function RouteComponent() {
  const params = Route.useParams()
  const assessmentId = parseInt(params.assessmentId)
  const groupId = parseInt(params.groupId)
  const scoringComponentId = parseInt(params.scoringComponentId)
  const [toggle, setToggle] = useState<string>(Toggle.Summary)

  const {
    data: scoringCompRes,
    isLoading: isLoadingScoringComp,
    error: errorScoringComp,
  } = useQuery({
    queryKey: ['getScoringComponentById', scoringComponentId],
    queryFn: async () => await api.scoringComponent.getScoringComponentById({ scoringComponentId }),
  })

  const scoringCompData = scoringCompRes?.data ?? null

  const {
    data: resPeerRating,
    isLoading: isLoadingPeerRating,
    error: errorPeerRating,
  } = useQuery({
    queryKey: ['getPeerRatingsByScoringComponentId', scoringComponentId],
    queryFn: async () => await api.peerRating.getPeerRatingsByScoringComponentId({ scoringComponentId, groupId }),
  })

  const peerRatingData = resPeerRating?.data ?? null

  useEffect(() => {
    if (errorScoringComp || errorPeerRating) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [errorScoringComp, errorPeerRating])

  return (
    <DashboardLayout className="gap-4">
      <SuspenseArea loading={isLoadingScoringComp || isLoadingPeerRating}>
        {scoringCompData && (
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
                  },
                  {
                    label: 'Peer Rating',
                    href: `/instructor/assessment/${assessmentId}/group/${groupId}/peer-rating/scoring-component/${scoringComponentId}`,
                    isCurrentPage: true,
                  },
                ]}
              />
              <ScoringComponentCard data={scoringCompData} />
            </div>
            <div className="flex justify-between">
              <h1 className="text-2xl font-semibold">Peer Rating</h1>
              <ToggleGroup
                variant="outline"
                type="single"
                size="lg"
                onValueChange={(value) => setToggle(value)}
                defaultValue={Toggle.Summary}
              >
                <ToggleGroupItem
                  value={Toggle.Summary}
                  aria-label="Toggle summary"
                >
                  Summary
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={Toggle.PeerMatrix}
                  aria-label="Toggle peer matrix"
                >
                  Peer matrix
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            {peerRatingData &&
              (toggle === Toggle.PeerMatrix ? (
                <PeerMatrixToggleGroup data={peerRatingData} />
              ) : (
                <SummaryToggleGroup data={peerRatingData} />
              ))}
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const ScoringComponentCard = ({ data }: { data: GetScoringComponentByIdResponse }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <CardTitle className="text-lg md:text-2xl md:mb-1">Scoring Component</CardTitle>
        <div className="flex justify-between items-end my-2 md:mb-0">
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground text-sm">{`${format(data.startDate, 'dd/MM/y')} - ${format(data.endDate, 'dd/MM/y')}`}</div>
            <Badge
              variant="secondary"
              className="rounded-sm h-fit"
              asChild
            >
              <div>Weight: {data.weight}</div>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const SummaryToggleGroup = ({ data }: { data: GetPeerRatingsByScoringComponentIdResponse }) => {
  return (
    <div className="grid gap-4">
      {data.map((item, i) => (
        <PeerRatingCollapsible
          key={i}
          peerRatingData={data}
          data={item}
        />
      ))}
    </div>
  )
}

const PeerMatrixToggleGroup = ({ data }: { data: GetPeerRatingsByScoringComponentIdResponse }) => {
  const selfRating = data.length !== data?.[0]?.ratings.length
  const groupSize = data.length
  const matrixData = []
  for (let i = 0; i < groupSize; i++) {
    // ratee
    const row = []
    let subtract = 0
    for (let j = 0; j < groupSize; j++) {
      // rater
      if (i === j && selfRating) {
        subtract = 1
        row.push(null)
      } else {
        row.push(data[i].ratings[j - subtract]?.score ?? null)
      }
    }
    matrixData.push(row)
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-8',
        matrixData.length <= 5 && 'md:flex-row md:justify-evenly',
        matrixData.length > 5 && 'xl:flex-row xl:justify-evenly',
        matrixData.length > 10 && 'flex-col!'
      )}
    >
      {/* Peer matrix */}
      <div className="w-fit">
        <div className="flex flex-row">
          <div className="w-22" />
          <div>
            <div className="flex flex-grow justify-center text-lg font-semibold">Rater</div>
            <div className="flex mb-3 mt-4">
              {matrixData.map((_, i) => (
                <div className="flex items-center justify-center font-semibold w-15">
                  <span>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div className="h-fit rotate-270 text-lg font-semibold">Ratee</div>
          <div className="mx-4">
            {matrixData.map((_, i) => (
              <div className="flex items-center justify-center h-15 font-semibold">
                <span>{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            {matrixData.map((row, i) => {
              return (
                <div
                  key={i}
                  className="flex flex-row"
                >
                  {row.map((col, j) => (
                    <div
                      key={j}
                      className={cn(
                        'border size-15 bg-white flex items-center justify-center',
                        i == j && 'bg-secondary'
                      )}
                    >
                      <span>{col}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {/* Name list */}
      <div className="bg-white rounded-sm gap-y-2 p-8 border-2 flex flex-col">
        {data.map((item, i) => (
          <div className="flex gap-3">
            <span>{i + 1}</span>
            <span>=</span>
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const PeerRatingCollapsible = ({
  data,
  peerRatingData,
}: {
  data: UserWithPeerRating
  peerRatingData: GetPeerRatingsByScoringComponentIdResponse
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 rounded-md border bg-white">
        <div className="font-semibold">{`Ratee : ${data.name}`}</div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 rounded-md border bg-white p-4">
        {data.ratings.map((rating, index) => {
          const rater = peerRatingData.find((item) => item.userId === rating.raterStudentUserId)
          return (
            <div
              key={index}
              className="flex justify-between items-center border-2 border-primary/60 p-3 rounded-xl bg-secondary/20"
            >
              <div className="flex items-center gap-2">
                <div className="text-black/70 font-semibold">{rater?.name ?? '-'}</div>
                {/* <div className="text-muted-foreground text-sm">{`( Given score : ${rating.score ?? '-'} )`}</div> */}
                {rater?.userId === data?.userId && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm h-fit"
                    asChild
                  >
                    <div>Self-rating</div>
                  </Badge>
                )}
              </div>
              <PeerRatingDialog
                data={rating}
                ratee={data}
                rater={rater}
                triggerButton={<ChevronRight className="text-primary/80 cursor-pointer" />}
              />
            </div>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}
