import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { mode } from '@/config/app'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import { Group, StudentScore, User } from 'gpa-backend/src/drizzle/schema'
import { GetScoresResponse, StudentScoreItem } from 'gpa-backend/src/group/dto/group.response'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ErrorResponse } from '../../../../gpa-backend/src/app.response'
import { GetAssessmentByIdResponse } from '../../../../gpa-backend/src/assessment/dto/assessment.response'
import { QASSMode } from '../../../../gpa-backend/src/utils/qass.model'
import EmptyState from '../EmptyState'
import toast from '../toast'

interface EditScoreDialogProps {
  triggerButton: React.ReactNode
  data?: GetScoresResponse
  groupId: Group['groupId']
}

enum DialogState {
  Edit,
  ReviewWeights,
}

const model = {
  QASS: 1,
  WebAVALIA: 2,
}

const formSchema = z.object({
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  studentScores: z.array(
    z.object({
      studentUserId: z.number(),
      score: z
        .union([
          z
            .number()
            .finite()
            .min(0, { message: 'Student score must be greater than or equal zero' })
            .max(1, { message: 'Student score must be less than or equal one' }),
          z.nan(),
        ])
        .optional(),
      remark: z.string().optional(),
    })
  ),
})

type FormType = z.infer<typeof formSchema>

const qassWeightSchema = z.object({
  mode: z.enum([mode.Bijunction, mode.Conjunction, mode.Disjunction], { required_error: 'Mode is required' }),
  polishingFactor: z
    .number({ required_error: 'Polishing factor is required', invalid_type_error: 'Polishing factor must be a number' })
    .finite()
    .gt(0, { message: 'Polishing factor must be greater than 0' })
    .lt(0.5, { message: 'Polishing factor must be less than 0.5' }),
  peerRatingImpact: z
    .number({
      required_error: 'Peer rating impact is required',
      invalid_type_error: 'Peer rating impact must be a number',
    })
    .finite()
    .min(0, { message: 'Peer rating impact must be greater than or equal 0' }),
  groupSpread: z
    .number({ required_error: 'Group spread is required', invalid_type_error: 'Group spread must be a number' })
    .finite()
    .gt(0, { message: 'Group spread must be greater than 0' })
    .lt(1, { message: 'Group spread must be less than 1' }),
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  studentWeights: z.array(
    z.object({
      userId: z.number().int(),
      weight: z
        .number({ required_error: 'Please enter a weight', invalid_type_error: 'Weight must be a number' })
        .int()
        .min(0, { message: 'Weights must be greater than or equal 0' }),
    })
  ),
})

const webavaliaWeightSchema = z.object({
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  selfWeight: z
    .number({
      required_error: 'Self-assessment weight is required.',
      invalid_type_error: 'Self-assessment weight must be a number.',
    })
    .finite()
    .min(0, { message: 'Self-assessment weight must be greater than or equal to 0.' })
    .max(1, { message: 'Self-assessment weight must be less than or equal to 1.' }),
  peerWeight: z
    .number({
      required_error: 'Peer assessment weight is required.',
      invalid_type_error: 'Peer assessment weight must be a number.',
    })
    .finite()
    .min(0, { message: 'Peer assessment weight must be greater than or equal to 0.' })
    .max(1, { message: 'Peer assessment weight must be less than or equal to 1.' }),
})

const EditScoreDialog = ({ triggerButton, data, groupId }: EditScoreDialogProps) => {
  const [open, setOpen] = useState(false)
  const [dialogState, setDialogState] = useState<DialogState>(DialogState.Edit)
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assessmentId = parseInt(params?.assessmentId!)

  const { data: res, error } = useQuery({
    queryKey: ['getAssessmentById', assessmentId],
    queryFn: async () => await api.assessment.getAssessmentById({ assessmentId }),
  })

  const assessmentData = res?.data ?? null

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  useEffect(() => {
    if (open) setDialogState(DialogState.Edit)
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div
          className="self-end"
          onClick={() => setOpen(true)}
        >
          {triggerButton}
        </div>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl">
        {dialogState === DialogState.ReviewWeights ? (
          assessmentData?.modelId === model.WebAVALIA ? (
            <WebavaliaWeightForm
              data={data}
              groupId={groupId}
              setOpen={setOpen}
              assessmentData={assessmentData}
            />
          ) : assessmentData?.modelId === model.QASS ? (
            <QassWeightForm
              data={data}
              groupId={groupId}
              setOpen={setOpen}
              assessmentData={assessmentData}
            />
          ) : null
        ) : (
          <EditScoreForm
            data={data}
            groupId={groupId}
            open={open}
            setOpen={setOpen}
            setDialogState={setDialogState}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditScoreDialog

const EditScoreForm = ({
  data,
  groupId,
  open,
  setOpen,
  setDialogState,
}: {
  data: GetScoresResponse | undefined
  groupId: number
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>
}) => {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const defaultValues = {
    groupScore: data?.groupScore?.score,
    studentScores: data?.studentScores?.map((student) => ({
      studentUserId: student.userId,
      score: student?.studentScore?.score,
      remark: student?.studentScore?.remark ?? '',
    })),
  }
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const upsertMutation = useMutation({
    mutationFn: api.group.upsertScore,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scores were updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getScores', groupId] })
    },
    onError: () => {
      toast.error('Failed to update scores.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const studentPayload: {
      studentUserId: User['userId']
      score: StudentScore['score']
      remark: StudentScore['remark']
    }[] = []
    values?.studentScores?.forEach((value) => {
      if (value.score && typeof value.score === 'number' && !isNaN(value.score)) {
        studentPayload.push({ studentUserId: value.studentUserId, score: value.score, remark: value?.remark ?? null })
      }
    })
    upsertMutation.mutate({ ...values, studentScores: studentPayload, groupId })
  }

  const onClickAutoCalculate = () => {
    if ((data?.studentScores?.length ?? 0) < 2) {
      setError('At least 2 members required for auto calculating')
      return
    }
    setError(null)
    setDialogState(DialogState.ReviewWeights)
  }

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit scores</DialogTitle>
          <DialogDescription>Enter group score and student scores. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="groupScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg mb-2">Group [product] score</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Enter group score"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="my-4" />
          <div className="flex justify-between">
            <h1 className="text-lg mb-2 font-semibold">Student scores</h1>
            <div className="flex flex-col items-end gap-1">
              <Button
                type="button"
                onClick={onClickAutoCalculate}
                className="w-fit"
              >
                <Calculator />
                <div className="hidden sm:block">Auto Calculate</div>
              </Button>
              {error && <FormMessage>{error}</FormMessage>}
            </div>
          </div>
          {(data?.studentScores?.length ?? 0) == 0 ? (
            <EmptyState
              title="No Student"
              description1="It looks like there is no student in this group."
              icon={<NoDocuments className="w-[126px] h-[100px] md:w-[180px] md:h-[144px]" />}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {data?.studentScores?.map((studentScore, index) => (
                <StudentScoreCollapsible
                  index={index}
                  form={form}
                  studentScore={studentScore}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={upsertMutation.isPending}
          >
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const QassWeightForm = ({
  data,
  groupId,
  setOpen,
  assessmentData,
}: {
  data: GetScoresResponse | undefined
  groupId: number
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  assessmentData: GetAssessmentByIdResponse
}) => {
  const queryClient = useQueryClient()
  const modelConfigQASS = qassWeightSchema
    .omit({ groupScore: true, studentWeights: true })
    .parse(assessmentData.modelConfig)
  const defaultValues = {
    mode: modelConfigQASS.mode,
    polishingFactor: modelConfigQASS.polishingFactor,
    peerRatingImpact: modelConfigQASS.peerRatingImpact,
    groupSpread: modelConfigQASS.groupSpread,
    groupScore: data?.groupScore?.score,
    studentWeights: data?.studentScores.map((item) => ({ userId: item.userId, weight: 1 })),
  }
  const form = useForm<z.infer<typeof qassWeightSchema>>({
    resolver: zodResolver(qassWeightSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.group.calculateScoreByQass,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scores were updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getScores', groupId] })
    },
    onError: () => {
      toast.error('Failed to update scores.')
    },
  })

  const onSubmit = async (values: z.infer<typeof qassWeightSchema>) => {
    const enumMode =
      values.mode === mode.Bijunction ? QASSMode.B : values.mode === mode.Conjunction ? QASSMode.C : QASSMode.D
    mutation.mutate({ ...values, mode: enumMode, groupId, weights: values.studentWeights })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Parameters for Score Calculation</DialogTitle>
          <DialogDescription>
            These parameters will be used to calculate the final scores, along with the group score and peer evaluations
            given by students. Please review these parameters carefully before clicking the Calculate button.
          </DialogDescription>
        </DialogHeader>

        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={mode.Bijunction}>Bijunction</SelectItem>
                    <SelectItem value={mode.Conjunction}>Conjuction</SelectItem>
                    <SelectItem value={mode.Disjunction}>Disjunction</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="polishingFactor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Polishing factor</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Enter polishing factor"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peerRatingImpact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peer rating impact</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Enter peer rating impact"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="groupSpread"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group spread</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Enter group spread"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group score</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      type="number"
                      placeholder="Enter group score"
                      step="0.1"
                    />
                  </FormControl>
                  <FormDescription>
                    This group score will replace the previous one. Please review it before proceeding with the
                    calculation.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-4 border-t mt-2" />
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Student Weights</h2>
          </div>
          {data?.studentScores.map((student, i) => (
            <div key={i}>
              <FormField
                control={form.control}
                name={`studentWeights.${i}.userId`}
                render={({ field }) => (
                  <FormItem hidden>
                    <div className="flex gap-2 items-center">
                      <FormLabel>{student.name}</FormLabel>
                      <FormDescription>{`(${student.email})`}</FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`studentWeights.${i}.weight`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-center">
                      <FormLabel>{student.name}</FormLabel>
                      <FormDescription>{`(${student.email})`}</FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        type="number"
                        placeholder="Enter weight"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
          >
            Calculate
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const WebavaliaWeightForm = ({
  data,
  groupId,
  setOpen,
  assessmentData,
}: {
  data: GetScoresResponse | undefined
  groupId: number
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  assessmentData: GetAssessmentByIdResponse
}) => {
  const queryClient = useQueryClient()
  const modelConfig = assessmentData?.modelConfig as { selfWeight: number }
  const defaultSelfWeight = modelConfig.selfWeight
  const groupSize = data?.studentScores.length ?? 0
  const defaultValues = {
    groupScore: data?.groupScore?.score,
    selfWeight: defaultSelfWeight,
    peerWeight: (1 - defaultSelfWeight) / (groupSize - 1),
  }
  const form = useForm<z.infer<typeof webavaliaWeightSchema>>({
    resolver: zodResolver(webavaliaWeightSchema),
    defaultValues,
  })

  const selfWeight = useWatch({
    control: form.control,
    name: 'selfWeight',
  })

  useEffect(() => {
    if (typeof selfWeight === 'number') {
      const value = (1 - selfWeight) / (groupSize - 1)
      form.setValue('peerWeight', value)
    }
  }, [selfWeight])

  const mutation = useMutation({
    mutationFn: api.group.calculateScoreByWebavalia,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scores were updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getScores', groupId] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 400 || error.response?.status === 403) {
        toast.error(error.response?.data?.message)
      } else {
        toast.error('Failed to update scores.')
      }
    },
  })

  const onSubmit = async (values: z.infer<typeof webavaliaWeightSchema>) => {
    mutation.mutate({ ...values, groupId, groupGrade: values.groupScore })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Parameters for Score Calculation</DialogTitle>
          <DialogDescription>
            These parameters will be used to calculate the final scores, along with the group score and peer evaluations
            given by students. Please review these parameters carefully before clicking the Calculate button.
          </DialogDescription>
        </DialogHeader>

        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="groupScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group score</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      type="number"
                      placeholder="Enter group score"
                      step="0.1"
                    />
                  </FormControl>
                  <FormDescription>
                    This group score will replace the previous one. Please review it before proceeding with the
                    calculation.
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4 border-t mt-2" />
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg">Student Weights</h2>
          </div>
          <FormField
            control={form.control}
            name="selfWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Self Assessment Weight</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      type="number"
                      placeholder="Enter self assessment weight"
                      step="0.1"
                    />
                  </FormControl>
                  <FormDescription>
                    This self-assessment weight will affect the value of the peer assessment weight
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peerWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peer Assessment Weight</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    type="number"
                    placeholder="Enter peer assessment weight"
                    step="0.1"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
          >
            Calculate
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const StudentScoreCollapsible = ({
  index,
  studentScore,
  form,
}: {
  index: number
  studentScore: StudentScoreItem
  form: UseFormReturn<FormType, any, FormType>
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-md border">
        <div>
          <div className="text-sm font-semibold">{studentScore?.name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{studentScore?.email ?? '-'}</div>
        </div>
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
      <CollapsibleContent className="flex flex-col gap-2 p-4 pr-0">
        <FormField
          control={form.control}
          name={`studentScores.${index}.score`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student score</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  type="number"
                  step="0.01"
                  placeholder="Enter group score"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`studentScores.${index}.remark`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter group score"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
