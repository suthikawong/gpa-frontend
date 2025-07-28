import { api } from '@/api'
import AlertDialog from '@/components/common/AlertDialog'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import JoinGroupDialog from '@/components/common/dialog/JoinGroupDialog'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Roles } from '@/config/app'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import {
  AssessmentWithInstructor,
  CheckScoringComponentActiveResponse,
  GetAssessmentByIdResponse,
  GetMyScoreResponse,
  GroupWithGroupMembers,
} from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment, Group, ScoringComponent } from 'gpa-backend/src/drizzle/schema'
import { ChevronLeft, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/student/assessment/$assessmentId')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    } else if (context.user?.roleId === Roles.Instructor) {
      throw redirect({
        to: '/instructor/assessment',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

enum State {
  Assessment = 1,
  PeerRating,
}

const model = {
  QASS: 1,
  WebAVALIA: 2,
}

const studentScore = z.object({
  score: z.number().max(100).min(0),
  comment: z.string().optional(),
  rateeStudentUserId: z.number(),
})

const formSchema = z.object({
  studentScores: z.array(studentScore),
})

function RouteComponent() {
  const params = Route.useParams()
  const assessmentId = parseInt(params.assessmentId)
  const [pageState, setPageState] = useState<State>(State.Assessment)

  const {
    data: assessmentRes,
    isLoading: isLoadingAssessment,
    error: errorAssessment,
  } = useQuery({
    queryKey: ['getAssessmentById', assessmentId],
    queryFn: async () => await api.assessment.getAssessmentById({ assessmentId }),
  })

  const assessmentData = assessmentRes?.data ?? null

  const {
    data: groupRes,
    isLoading: isLoadingGroup,
    error: errorGroup,
  } = useQuery({
    queryKey: ['getJoinedGroup', assessmentId],
    queryFn: async () => await api.assessment.getJoinedGroup({ assessmentId }),
  })

  const groupData = groupRes?.data ?? null

  const {
    data: checkScoringRes,
    isLoading: isLoadingCheckScoring,
    error: errorCheckScoring,
  } = useQuery({
    queryKey: ['checkScoringComponentActive', assessmentId],
    queryFn: async () => await api.assessment.checkScoringComponentActive({ assessmentId }),
  })

  const scoringComponentId = checkScoringRes?.data?.scoringComponentId ?? null

  const {
    data: myScoreRes,
    isLoading: isLoadingMyScore,
    error: errorMyScore,
  } = useQuery({
    queryKey: ['getMyScore', assessmentId],
    queryFn: async () => await api.assessment.getMyScore({ assessmentId }),
    enabled: !!groupData,
  })

  const myScoreData = myScoreRes?.data ?? null

  useEffect(() => {
    if (errorAssessment || errorGroup || errorCheckScoring || errorMyScore) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [errorAssessment, errorGroup, errorCheckScoring, errorMyScore])

  return (
    <DashboardLayout className="gap-4">
      <SuspenseArea loading={isLoadingAssessment || isLoadingGroup || isLoadingCheckScoring || isLoadingMyScore}>
        {pageState === State.PeerRating && scoringComponentId ? (
          <PeerRatingPage
            assessmentData={assessmentData}
            groupData={groupData}
            scoringComponentId={scoringComponentId}
            setPageState={setPageState}
          />
        ) : (
          <AssessmentDetailPage
            assessmentData={assessmentData}
            groupData={groupData}
            myScoreData={myScoreData}
            checkScoringData={checkScoringRes?.data ?? null}
            setPageState={setPageState}
          />
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const AssessmentDetailPage = ({
  assessmentData,
  groupData,
  myScoreData,
  checkScoringData,
  setPageState,
}: {
  assessmentData: GetAssessmentByIdResponse | null
  groupData: GroupWithGroupMembers | null
  myScoreData: GetMyScoreResponse | null
  checkScoringData: CheckScoringComponentActiveResponse | null
  setPageState: React.Dispatch<React.SetStateAction<State>>
}) => {
  const router = useRouter()
  const onClickBack = () => {
    router.history.push(`/student/assessment`)
  }

  return (
    <div className="flex flex-col gap-8 flex-grow">
      <div className="flex flex-col gap-6">
        <Button
          className="w-fit"
          onClick={onClickBack}
        >
          <ChevronLeft />
          Back
        </Button>
        {assessmentData && <AssessmentCard data={assessmentData} />}
      </div>
      {myScoreData && <MyScoreCard myScoreData={myScoreData} />}
      {assessmentData && (
        <MyGroupCard
          groupData={groupData}
          checkScoringData={checkScoringData}
          assessmentData={assessmentData}
          setPageState={setPageState}
        />
      )}
    </div>
  )
}

const AssessmentCard = ({ data }: { data: AssessmentWithInstructor }) => {
  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg md:text-2xl md:mb-1">{data.assessmentName}</CardTitle>
            <div className="hidden md:flex gap-2 items-center">
              <Users
                size={16}
                className="block text-muted-foreground"
              />
              <CardDescription className="text-sm">{data.instructor.name}</CardDescription>
            </div>
          </div>
        </div>
        <div className="flex justify-between my-4 md:mb-0">
          <div className="flex gap-x-2">
            <div className="text-muted-foreground text-sm">Assessment Code:</div>
            <Badge
              variant="secondary"
              className="rounded-sm h-fit"
              asChild
            >
              <div>{data.assessmentCode}</div>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const MyScoreCard = ({ myScoreData }: { myScoreData: GetMyScoreResponse }) => {
  return (
    <Card className="w-full py-4!">
      <CardContent className="flex-col">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl md:mb-1">My Score</CardTitle>
          <CardTitle className="text-lg md:text-xl md:mb-1">
            {myScoreData?.score ? myScoreData.score * 100 : '-'}/100
          </CardTitle>
        </div>
      </CardContent>
    </Card>
  )
}

const MyGroupCard = ({
  groupData,
  checkScoringData,
  assessmentData,
  setPageState,
}: {
  groupData: GroupWithGroupMembers | null
  checkScoringData: CheckScoringComponentActiveResponse | null
  assessmentData: GetAssessmentByIdResponse | null
  setPageState: React.Dispatch<React.SetStateAction<State>>
}) => {
  const onClickRate = () => {
    setPageState(State.PeerRating)
  }

  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg md:text-xl md:mb-1">
            {groupData?.groupId ? (groupData?.groupName ?? '-') : 'My Group'}
          </CardTitle>
          <div className="flex">
            {groupData?.groupId ? (
              <div className="flex gap-2">
                {checkScoringData?.scoringComponentId && (
                  <Button
                    onClick={onClickRate}
                    disabled={checkScoringData?.rated}
                  >
                    Rate
                  </Button>
                )}
                {assessmentData?.canEdit && (
                  <LeaveGroupDialog
                    assessmentId={assessmentData?.assessmentId!}
                    groupId={groupData?.groupId}
                    triggerButton={<Button variant="destructiveOutline">Leave Group</Button>}
                  />
                )}
              </div>
            ) : (
              <JoinGroupDialog
                assessmentId={assessmentData?.assessmentId!}
                triggerButton={<Button disabled={assessmentData?.canEdit ? false : true}>Join Group</Button>}
              />
            )}
          </div>
        </div>
        {groupData?.groupId && (
          <div className="flex gap-x-2">
            <div className="text-muted-foreground text-sm">Group Code:</div>
            <Badge
              variant="secondary"
              className="rounded-sm h-fit"
              asChild
            >
              <div>{groupData?.groupCode ?? '-'}</div>
            </Badge>
          </div>
        )}
        {groupData && <Separator className="my-4" />}
        <div className="flex flex-col gap-1.5">
          {groupData?.members?.map((member) => (
            <div
              key={member.userId}
              className="flex justify-between items-center border-2 border-primary/60 p-3 rounded-xl bg-secondary/20"
            >
              <div className="text-black/70 font-semibold">{member.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const LeaveGroupDialog = ({
  triggerButton,
  groupId,
  assessmentId,
}: {
  triggerButton: React.ReactNode
  groupId: Group['groupId']
  assessmentId: Assessment['assessmentId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ groupId }}
      api={api.group.leaveGroup}
      title="Leave group"
      content="Are you sure you want to leave this group?"
      confirmButtonText="Leave"
      onSuccessMessage="Leave group successfully."
      onErrorMessage="Failed to leave group. Please try again."
      refetchKeys={['getJoinedGroup', assessmentId]}
    />
  )
}

const PeerRatingPage = ({
  assessmentData,
  groupData,
  scoringComponentId,
  setPageState,
}: {
  assessmentData: GetAssessmentByIdResponse | null
  groupData: GroupWithGroupMembers | null
  scoringComponentId: ScoringComponent['scoringComponentId']
  setPageState: React.Dispatch<React.SetStateAction<State>>
}) => {
  const queryClient = useQueryClient()
  const ratees = groupData?.members ?? []
  const defaultValues = {
    scoringComponentId,
    groupId: groupData?.groupId!,
    studentScores: ratees.map((ratee) => ({ rateeStudentUserId: ratee.userId, score: 50, comment: '' })),
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.peerRating.ratePeer,
    onSuccess: () => {
      toast.success('Student was rated successfully.')
      queryClient.setQueryData(['checkScoringComponentActive', assessmentData?.assessmentId], {
        data: { scoringComponentId, rated: true },
      })
      onClickBack()
    },
    onError: () => {
      toast.error('Peer rating failed. Please try again.')
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (assessmentData?.modelId === model.WebAVALIA && remainScores !== 0) {
      toast.error('Remaining scores must be exactly zero. Please redistribute your rating.')
      return
    }
    mutation.mutate({
      scoringComponentId,
      groupId: groupData?.groupId!,
      studentScores: values?.studentScores,
    })
  }

  const onClickBack = () => {
    setPageState(State.Assessment)
  }

  const studentScores = useWatch({
    control: form.control,
    name: 'studentScores',
  })

  const remainScores = 100 - studentScores.reduce((prev, curr) => prev + curr.score, 0)

  return (
    <>
      <div className="flex flex-col gap-8 flex-grow">
        <div className="flex flex-col gap-6 flex-grow">
          <Button
            className="w-fit"
            onClick={onClickBack}
          >
            <ChevronLeft />
            Back
          </Button>

          <Form {...form}>
            <form className="space-y-6 flex flex-col">
              <div className="grid w-full items-center gap-8">
                {ratees.map((ratee, index) => (
                  <Card
                    key={index}
                    className="w-full"
                  >
                    <CardContent className="flex flex-col">
                      <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4">
                        <div className="flex gap-4 items-center lg:items-start">
                          <Avatar className="size-12">
                            <AvatarImage src="https://github.com/shadcn.png" />
                          </Avatar>
                          <div>
                            <div className="text-2xl font-semibold">{ratee.name}</div>
                            <div className="text-muted-foreground">{ratee.email}</div>
                          </div>
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name={`studentScores.${index}.score`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Score</FormLabel>
                                <FormControl>
                                  <div className="flex gap-4">
                                    <Slider
                                      max={100}
                                      step={assessmentData?.modelId === model.WebAVALIA ? 5 : 1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                    />
                                    <div>{field.value}</div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`studentScores.${index}.comment`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Comment</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </form>
          </Form>
          {assessmentData?.modelId === model.WebAVALIA && (
            <Card className="w-full">
              <CardContent className="flex justify-end gap-2">
                <div className="font-semibold">Remaining scores :</div>
                {remainScores < 0 ? (
                  <div className="text-destructive font-semibold">{remainScores}</div>
                ) : remainScores === 0 ? (
                  <div className="text-success font-semibold">{remainScores}</div>
                ) : (
                  <div className="font-semibold">{remainScores}</div>
                )}
              </CardContent>
            </Card>
          )}

          <AlertDialog
            dialogType="info"
            triggerButton={
              <Button
                size="lg"
                type="button"
                className="w-fit ml-auto"
                loading={mutation.isPending}
              >
                Submit
              </Button>
            }
            title="Confirm submit ratings"
            content="Are you sure you want to submit this? You can't submit this again."
            onConfirm={() => form.handleSubmit(onSubmit)()}
          />
        </div>
      </div>
    </>
  )
}
