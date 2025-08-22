import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { AssessmentModel, mode, model, ScaleType } from '@/config/app'
import { cn } from '@/lib/utils'
import {
  calculateMaxGroupSize,
  calculateMinGroupSize,
  validateBoundConflict,
  validateConstraintConflict,
  validateScoreConstraint,
} from '@/utils/qass'
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

const scoresSchema = z.object({
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

const qassFormSchema = scoresSchema.extend({
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
})

const webavaliaFormSchema = scoresSchema.extend({
  groupScore: z
    .number({ required_error: 'Group grade is required', invalid_type_error: 'Group grade must be an integer' })
    .int()
    .min(0, { message: 'Group grade must be greater than or equal to 0' })
    .max(20, { message: 'Group grade must be less than or equal to 20' }),
})

const dynamicFormSchemas = {
  [model.QASS]: qassFormSchema,
  [model.WebAVALIA]: webavaliaFormSchema,
} as const

type DynamicFormSchemaMap = typeof dynamicFormSchemas
type DynamicFormSchemaKeys = keyof DynamicFormSchemaMap

type FormSchemaByModel = {
  [K in DynamicFormSchemaKeys]: z.infer<DynamicFormSchemaMap[K]>
}

type FormSchemaType = FormSchemaByModel[(typeof model)[keyof typeof model]]

const qassReviewSchema = z.object({
  mode: z.enum([mode.Bijunction, mode.Conjunction, mode.Disjunction], { required_error: 'Mode is required' }),
  polishingFactor: z
    .number({
      required_error: 'Polishing factor is required',
      invalid_type_error: 'Polishing factor must be a number',
    })
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
  scaleType: z.string({ required_error: 'Scale is required', invalid_type_error: 'Scale is required' }),
  isTotalScoreConstrained: z.boolean(),
  scoreConstraint: z
    .number({ required_error: 'Constraint is required', invalid_type_error: 'Constraint is required' })
    .finite()
    .gt(0, { message: 'Constraint must be greater than 0' })
    .max(100, { message: 'Constraint must be lower than or equal 100' })
    .optional(),
  lowerBound: z
    .number({ required_error: 'Lower bound is required', invalid_type_error: 'Lower bound is required' })
    .finite()
    .min(0, { message: 'Lower bound must be greater than or equal 0' }),
  upperBound: z
    .number({ required_error: 'Upper bound is required', invalid_type_error: 'Upper bound is required' })
    .finite()
    .max(100, { message: 'Upper bound must be lower than or equal 100' }),
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

const webavaliaReviewSchema = z.object({
  groupGrade: z
    .number({ required_error: 'Group grade is required', invalid_type_error: 'Group grade must be an integer' })
    .int()
    .min(0, { message: 'Group grade must be greater than or equal to 0' })
    .max(20, { message: 'Group grade must be less than or equal to 20' }),
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
        ) : assessmentData?.modelId ? (
          <EditScoreForm
            data={data}
            groupId={groupId}
            open={open}
            modelId={assessmentData.modelId}
            setOpen={setOpen}
            setDialogState={setDialogState}
          />
        ) : (
          <div>No model selected</div>
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
  modelId,
  setOpen,
  setDialogState,
}: {
  data: GetScoresResponse | undefined
  groupId: number
  open: boolean
  modelId: number
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

  const getSchemaByModelId = <T extends DynamicFormSchemaKeys>(modelId: number): DynamicFormSchemaMap[T] => {
    return dynamicFormSchemas[modelId]
  }

  const formSchema = getSchemaByModelId(modelId)

  const form = useForm<z.infer<typeof formSchema>>({
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

  const onSubmit = async (values: FormSchemaType) => {
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
                <FormLabel className="text-lg mb-2">
                  {modelId === model.WebAVALIA ? 'Group grade' : 'Group [product] score'}
                </FormLabel>
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
  const modelConfigQASS = qassReviewSchema
    .omit({ groupScore: true, studentWeights: true })
    .parse(assessmentData.modelConfig)
  const defaultValues = {
    mode: modelConfigQASS.mode,
    polishingFactor: modelConfigQASS.polishingFactor,
    peerRatingImpact: modelConfigQASS.peerRatingImpact,
    groupSpread: modelConfigQASS.groupSpread,
    groupScore: data?.groupScore?.score,
    scaleType: modelConfigQASS.scaleType,
    isTotalScoreConstrained: modelConfigQASS.isTotalScoreConstrained,
    scoreConstraint: modelConfigQASS.scoreConstraint,
    lowerBound: modelConfigQASS.lowerBound,
    upperBound: modelConfigQASS.upperBound,
    studentWeights: data?.studentScores?.map((item) => ({ userId: item.userId, weight: 1 })) ?? [],
  }
  const form = useForm<z.infer<typeof qassReviewSchema>>({
    resolver: zodResolver(qassReviewSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.group.calculateScoreByQass,
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

  const selectedScaleType = useWatch({
    control: form.control,
    name: 'scaleType',
  })

  const isTotalScoreConstrained = useWatch({
    control: form.control,
    name: 'isTotalScoreConstrained',
  })

  const validate = (values: z.infer<typeof qassReviewSchema>) => {
    if (!validateBoundConflict(values.lowerBound, values.upperBound)) {
      form.setError('lowerBound', { type: 'custom', message: 'Lower bound must be less than upper bound' })
      return false
    }
    if (!validateScoreConstraint(values.isTotalScoreConstrained, values.scoreConstraint)) {
      form.setError('scoreConstraint', { type: 'custom', message: 'Constraint is required' })
      return false
    }
    if (
      !validateConstraintConflict(
        values.lowerBound,
        values.upperBound,
        values.studentWeights.length,
        values.isTotalScoreConstrained,
        values.scoreConstraint
      )
    ) {
      form.setError('lowerBound', { type: 'custom', message: 'Constraint conflicts with lower or upper bound' })
      return false
    }
    return true
  }

  const onSubmit = async (values: z.infer<typeof qassReviewSchema>) => {
    const valid = validate(values)
    if (!valid) return
    const enumMode =
      values.mode === mode.Bijunction ? QASSMode.B : values.mode === mode.Conjunction ? QASSMode.C : QASSMode.D
    mutation.mutate({ ...values, mode: enumMode, groupId, weights: values.studentWeights })
  }

  const scaleTypeOptions = Object.values(ScaleType).map((value) => ({ label: value, value }))

  const renderGroupMessage = () => {
    if (isTotalScoreConstrained) {
      const minGroupSize = calculateMinGroupSize(
        AssessmentModel.QASS,
        modelConfigQASS.scoreConstraint,
        modelConfigQASS.upperBound
      )
      const maxGroupSize = calculateMaxGroupSize(
        AssessmentModel.QASS,
        modelConfigQASS.scoreConstraint,
        modelConfigQASS.lowerBound
      )
      if (
        !validateConstraintConflict(
          modelConfigQASS.lowerBound,
          modelConfigQASS.upperBound,
          data?.studentScores?.length ?? 0,
          modelConfigQASS.isTotalScoreConstrained,
          modelConfigQASS.scoreConstraint
        )
      ) {
        return (
          <div className="mt-4 flex w-full gap-2 bg-destructive/10 border border-destructive rounded-lg p-4">
            <div className="text-left text-sm text-destructive">
              <span>
                The number of students in the group does not meet the condition. The group size should be less than or
                equal to{' '}
              </span>
              <span className="font-semibold">{maxGroupSize}</span>
              <span> and greater than or equal to </span>
              <span className="font-semibold">{minGroupSize}</span>
            </div>
          </div>
        )
      }
    }
    return null
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
          <FormField
            control={form.control}
            name="scaleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scale</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scale" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scaleTypeOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isTotalScoreConstrained"
            render={({ field }) => (
              <FormItem
                className={cn(
                  'flex items-start gap-3 mt-4',
                  selectedScaleType !== ScaleType.PercentageScale && 'hidden'
                )}
              >
                <FormControl>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms-2"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled
                    />
                    <div className="grid gap-2">
                      <FormLabel htmlFor="terms-2">Apply total score constraint</FormLabel>
                      <FormDescription>
                        Students must follow the total score constraint when allocating peer assessment scores.
                      </FormDescription>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scoreConstraint"
            render={({ field }) => (
              <FormItem className={cn('mb-4', selectedScaleType !== ScaleType.PercentageScale && 'hidden')}>
                <FormLabel>Constraint</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      if (isTotalScoreConstrained) form.trigger('scoreConstraint')
                    }}
                    type="number"
                    placeholder="Enter score constraint"
                    step="0.1"
                    disabled
                  />
                </FormControl>
                <FormDescription>
                  This constraint will be applied when "Apply total score constraint" is checked.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lowerBound"
            render={({ field }) => (
              <FormItem className={cn(selectedScaleType !== ScaleType.PercentageScale && 'hidden')}>
                <FormLabel>Lower bound</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('lowerBound')
                      if (isTotalScoreConstrained) form.trigger('scoreConstraint')
                    }}
                    type="number"
                    placeholder="Enter lower bound"
                    step="0.1"
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="upperBound"
            render={({ field }) => (
              <FormItem className={cn(selectedScaleType !== ScaleType.PercentageScale && 'hidden')}>
                <FormLabel>Upper bound</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('upperBound')
                      form.trigger('lowerBound')
                      if (isTotalScoreConstrained) form.trigger('scoreConstraint')
                    }}
                    type="number"
                    placeholder="Enter upper bound"
                    step="0.1"
                    disabled
                  />
                </FormControl>
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
        {isTotalScoreConstrained && renderGroupMessage()}

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
    groupGrade: data?.groupScore?.score,
    selfWeight: defaultSelfWeight,
    peerWeight: (1 - defaultSelfWeight) / (groupSize - 1),
  }
  const form = useForm<z.infer<typeof webavaliaReviewSchema>>({
    resolver: zodResolver(webavaliaReviewSchema),
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

  const onSubmit = async (values: z.infer<typeof webavaliaReviewSchema>) => {
    mutation.mutate({ ...values, groupId })
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
            name="groupGrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group grade</FormLabel>
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      type="number"
                      placeholder="Enter group grade"
                      step="0.1"
                    />
                  </FormControl>
                  <FormDescription>
                    This group grade will replace the previous one. Please review it before proceeding with the
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
  form: UseFormReturn<FormSchemaType, any, FormSchemaType>
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
