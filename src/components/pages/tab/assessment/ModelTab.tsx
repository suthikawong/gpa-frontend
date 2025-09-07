import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssessmentModel, mode, ScaleType } from '@/config/app'
import { cn } from '@/lib/utils'
import {
  calculateMaxGroupSize,
  calculateMinGroupSize,
  validateBoundConflict,
  validateGroupSizeConflict,
  validateScoreConstraint,
} from '@/utils/qass'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { GetAssessmentByIdResponse } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { CirclePlay, SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import AlertDialog from '../../../common/AlertDialog'
import SuspenseArea from '../../../common/SuspenseArea'
import toast from '../../../common/toast'
import QuestionnaireDialog, { ResultModelParametersType } from '../../dialog/QuestionnaireDialog'
import {
  ApplyConstraintTooltip,
  ConstraintTooltip,
  GroupSpreadTooltip,
  LowerBoundTooltip,
  ModelTooltip,
  ModeTooltip,
  PeerRatingImpactTooltip,
  PolishingFactorTooltip,
  ScaleTooltip,
  SelfAssessmentWeight,
  UpperBoundTooltip,
} from '../../tooltip/ModelTooltips'

const baseSchema = z.object({
  modelId: z.literal('0'),
})

const qassSchema = z.object({
  modelId: z.literal(AssessmentModel.QASS),
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
    .min(0, { message: 'Peer rating impact must be greater than or equal to 0' }),
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
    .finite(),
  upperBound: z
    .number({ required_error: 'Upper bound is required', invalid_type_error: 'Upper bound is required' })
    .finite(),
})

const webavaliaSchema = z.object({
  modelId: z.literal(AssessmentModel.WebAVALIA),
  selfWeight: z
    .number({
      required_error: 'Self-assessment weight is required.',
      invalid_type_error: 'Self-assessment weight must be a number.',
    })
    .finite()
    .min(0, { message: 'Self-assessment weight must be greater than or equal to 0.' })
    .max(1, { message: 'Self-assessment weight must be less than or equal to 1.' }),
})

const formSchema = z.discriminatedUnion('modelId', [baseSchema, qassSchema, webavaliaSchema])

type ModelFormSchema = z.infer<typeof formSchema>

const ModelTab = ({
  assessmentId,
  data,
  isLoading,
}: {
  assessmentId: Assessment['assessmentId']
  data: GetAssessmentByIdResponse
  isLoading: boolean
}) => {
  const queryClient = useQueryClient()
  const modelIdStr = data?.modelId?.toString() ?? '0'
  const [parameters, setParameters] = useState<ModelFormSchema | null>(null)

  const getDefaultValues = (modelId: string): Partial<ModelFormSchema> => {
    switch (modelId) {
      // generate default value for QASS
      case AssessmentModel.QASS:
        if (data?.modelId?.toString() !== AssessmentModel.QASS) {
          return {
            modelId: AssessmentModel.QASS,
            mode: undefined,
            polishingFactor: undefined,
            peerRatingImpact: undefined,
            groupSpread: undefined,
            scaleType: undefined,
            isTotalScoreConstrained: false,
            scoreConstraint: undefined,
            lowerBound: undefined,
            upperBound: undefined,
          }
        }
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigQASS, modelId: AssessmentModel.QASS }
      //generate default value for WebAVALIA
      case AssessmentModel.WebAVALIA:
        if (data?.modelId?.toString() !== AssessmentModel.WebAVALIA) {
          return {
            modelId: AssessmentModel.WebAVALIA,
            selfWeight: undefined,
          }
        }
        const modelConfigWeb = webavaliaSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigWeb, modelId: AssessmentModel.WebAVALIA }
      // select none
      default:
        return { modelId: '0' }
    }
  }

  const form = useForm<ModelFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(modelIdStr),
  })

  const updateMutation = useMutation({
    mutationFn: api.assessment.updateAssessment,
    onSuccess: (_, req) => {
      const newData = { ...data, modelId: req.modelId, modelConfig: req.modelConfig }
      queryClient.setQueryData(['getAssessmentById', assessmentId], { data: newData })
      toast.success('Model configuration updated successfully')
    },
    onError: () => {
      toast.error('Failed to update model.')
    },
  })

  const selectedModel = useWatch({
    control: form.control,
    name: 'modelId',
  })

  const selectedScaleType = useWatch({
    control: form.control,
    name: 'scaleType',
  })

  const isTotalScoreConstrained = useWatch({
    control: form.control,
    name: 'isTotalScoreConstrained',
  })

  const scoreConstraint = useWatch({
    control: form.control,
    name: 'scoreConstraint',
  })

  const lowerBound = useWatch({
    control: form.control,
    name: 'lowerBound',
  })

  const upperBound = useWatch({
    control: form.control,
    name: 'upperBound',
  })

  useEffect(() => {
    if (parameters) return
    const values = getDefaultValues(selectedModel)
    setFormValues(values)
  }, [selectedModel])

  useEffect(() => {
    if (parameters) return
    setDefualtPeerRatingConfig()
  }, [selectedScaleType])

  const setDefualtPeerRatingConfig = () => {
    if (selectedScaleType === ScaleType.PercentageScale) {
      // saved qass configuration
      if (data?.modelId?.toString() === AssessmentModel.QASS) {
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        if (modelConfigQASS.scaleType === ScaleType.PercentageScale) {
          form.setValue('lowerBound', modelConfigQASS.lowerBound)
          form.setValue('upperBound', modelConfigQASS.upperBound)
          form.setValue('scoreConstraint', modelConfigQASS.scoreConstraint)
          form.setValue('isTotalScoreConstrained', modelConfigQASS.isTotalScoreConstrained)
        } else {
          form.setValue('lowerBound', 0)
          form.setValue('upperBound', 1)
          form.setValue('scoreConstraint', 1)
          form.setValue('isTotalScoreConstrained', false)
        }
      } else {
        form.setValue('lowerBound', 0)
        form.setValue('upperBound', 1)
        form.setValue('scoreConstraint', 1)
        form.setValue('isTotalScoreConstrained', false)
      }
    } else if (selectedScaleType === ScaleType.NPointScale) {
      if (data?.modelId?.toString() === AssessmentModel.QASS) {
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        if (modelConfigQASS.scaleType === ScaleType.NPointScale) {
          form.setValue('lowerBound', modelConfigQASS.lowerBound)
          form.setValue('upperBound', modelConfigQASS.upperBound)
          form.setValue('scoreConstraint', modelConfigQASS.scoreConstraint)
          form.setValue('isTotalScoreConstrained', modelConfigQASS.isTotalScoreConstrained)
        } else {
          form.setValue('lowerBound', 1)
          form.setValue('upperBound', 5)
          form.setValue('scoreConstraint', 10)
          form.setValue('isTotalScoreConstrained', false)
        }
      } else {
        form.setValue('lowerBound', 1)
        form.setValue('upperBound', 5)
        form.setValue('scoreConstraint', 10)
        form.setValue('isTotalScoreConstrained', false)
      }
    }
  }

  const onClickUseRecommended = () => {
    if (selectedModel === AssessmentModel.QASS) {
      const values = {
        modelId: AssessmentModel.QASS,
        mode: mode.Bijunction,
        polishingFactor: 0.001,
        peerRatingImpact: 1,
        groupSpread: 0.5,
        scaleType: ScaleType.PercentageScale,
        isTotalScoreConstrained: false,
        scoreConstraint: 1,
        lowerBound: 0,
        upperBound: 1,
      }
      setFormValues(values)
    } else if (selectedModel === AssessmentModel.WebAVALIA) {
      const values = {
        modelId: AssessmentModel.WebAVALIA,
        selfWeight: 0,
      }
      setFormValues(values)
    }
  }

  const setFormValues = (values: Partial<ModelFormSchema>) => {
    form.reset(values)
  }

  const onSubmit = async (values: ModelFormSchema) => {
    const { modelId, ...modelConfig } = values
    if (values.modelId === AssessmentModel.QASS) {
      const qassConfig = qassSchema.parse(values)
      if (!validateInputType(qassConfig)) return
      if (!validateBoundConflict(qassConfig.lowerBound, qassConfig.upperBound)) {
        form.setError('lowerBound', { type: 'custom', message: 'Lower bound must be less than upper bound' })
        return
      }
      if (!validateScoreConstraint(qassConfig.isTotalScoreConstrained, qassConfig.scoreConstraint)) {
        form.setError('scoreConstraint', { type: 'custom', message: 'Constraint is required' })
        return
      }
      const minGroupSize = calculateMinGroupSize(selectedModel, scoreConstraint, upperBound)
      const maxGroupSize = calculateMaxGroupSize(selectedModel, scoreConstraint, lowerBound)
      if (!validateGroupSizeConflict(qassConfig.isTotalScoreConstrained, minGroupSize!, maxGroupSize!)) {
        form.setError('scoreConstraint', { type: 'custom', message: 'Constraint conflicts with lower or upper bound' })
        return
      }
    }
    const payload = {
      ...data,
      modelId: parseInt(modelId),
      modelConfig,
    }
    updateMutation.mutate(payload)
  }

  const validateInputType = (payload: ModelFormSchema) => {
    if (payload.modelId !== AssessmentModel.QASS) return true
    let error = false
    if (payload.scaleType === ScaleType.PercentageScale) {
      if (payload.lowerBound < 0) {
        form.setError('lowerBound', { type: 'custom', message: 'Lower bound must be greater than or equal 0' })
        error = true
      }
      if (payload.upperBound > 1) {
        form.setError('upperBound', { type: 'custom', message: 'Upper bound must be less than 1' })
        error = true
      }
      if ((payload.scoreConstraint ?? 0) > 10) {
        form.setError('scoreConstraint', { type: 'custom', message: 'Constraint must be lower than or equal 10' })
        error = true
      }
      if (payload.mode === mode.Conjunction && payload.upperBound < 1) {
        form.setError('upperBound', { type: 'custom', message: 'Upper bound must be 1 in Conjuction mode' })
        error = true
      }
      if (payload.mode === mode.Disjunction && payload.lowerBound > 0) {
        form.setError('lowerBound', { type: 'custom', message: 'Lower bound must be 0 in Disjunction mode' })
        error = true
      }
    } else {
      if (!Number.isInteger(payload.lowerBound)) {
        form.setError('lowerBound', { type: 'custom', message: 'Lower bound must be integer' })
        error = true
      }
      if (!Number.isInteger(payload.upperBound)) {
        form.setError('upperBound', { type: 'custom', message: 'Upper bound must be integer' })
        error = true
      }
      if (!Number.isInteger(payload.scoreConstraint)) {
        form.setError('scoreConstraint', { type: 'custom', message: 'Constraint must be integer' })
        error = true
      }
      if (payload.mode === mode.Conjunction && payload.upperBound < 1) {
        form.setError('upperBound', {
          type: 'custom',
          message: 'Upper bound must be greater than or equal 1 in Conjuction mode',
        })
        error = true
      }
      if (payload.mode === mode.Disjunction && payload.lowerBound > 0) {
        form.setError('lowerBound', {
          type: 'custom',
          message: 'Lower bound must be less than or equal 0 in Disjunction mode',
        })
        error = true
      }
    }
    if (error) return false
    return true
  }

  const scaleTypeOptions = Object.values(ScaleType).map((value) => ({ label: value, value }))

  const renderGroupMessage = () => {
    if (isTotalScoreConstrained) {
      const minGroupSize = calculateMinGroupSize(selectedModel, scoreConstraint, upperBound)
      const maxGroupSize = calculateMaxGroupSize(selectedModel, scoreConstraint, lowerBound)
      if (!validateGroupSizeConflict(isTotalScoreConstrained, minGroupSize!, maxGroupSize!)) {
        return (
          <div className="mt-4 flex w-full gap-2 bg-destructive/10 border border-destructive rounded-lg p-4">
            <div className="text-left text-sm text-destructive">
              <p>The constraint conflicts with the lower and upper bounds. Please correct these values.</p>
            </div>
          </div>
        )
      } else {
        return (
          <div className="rounded-xl border border-gray-200 bg-muted p-5 text-sm text-muted-foreground">
            <div>
              <span>This configuration can only be used when the group size is less than or equal to </span>
              <span className="font-semibold text-black">{maxGroupSize}</span>
              <span> and greater than or equal to </span>
              <span className="font-semibold text-black">{minGroupSize}</span>
              <span>
                . If the group size does not meet this condition, students in the group will not be able to perform peer
                assessment.
              </span>
            </div>
          </div>
        )
      }
    }
    return null
  }

  useEffect(() => {
    if (parameters) {
      form.setValue('modelId', parameters.modelId)
      if (parameters.modelId === AssessmentModel.QASS) {
        setTimeout(() => {
          form.setValue('scaleType', parameters.scaleType)
          setTimeout(() => {
            setFormValues(parameters)
            setParameters(null)
          }, 1000)
        }, 1000)
      } else {
        setTimeout(() => {
          setFormValues(parameters)
          setParameters(null)
        }, 1000)
      }
    }
  }, [parameters])

  const onApplyModelParameter = (parameters: ResultModelParametersType) => {
    if (parameters.modelId === AssessmentModel.QASS) {
      const values = {
        modelId: parameters.modelId,
        mode: parameters.mode!,
        polishingFactor: parameters.polishingFactor!,
        peerRatingImpact: parameters.peerRatingImpact!,
        groupSpread: parameters.groupSpread!,
        scaleType: parameters.scaleType!,
        isTotalScoreConstrained: parameters.isTotalScoreConstrained!,
        scoreConstraint: parameters.scoreConstraint!,
        lowerBound: parameters.lowerBound!,
        upperBound: parameters.upperBound!,
      }
      setParameters(values)
    } else if (parameters.modelId === AssessmentModel.WebAVALIA) {
      const values = {
        modelId: parameters.modelId,
        selfWeight: parameters.selfWeight!,
      }
      setParameters(values)
    }
  }

  return (
    <>
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-[3fr_2fr] gap-4 lg:h-full">
        <Card className="flex gap-4">
          <CardHeader>
            <CardTitle className="text-xl flex gap-2 items-center">
              <SettingsIcon className="w-6 h-6 text-primary" />
              Model Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <SuspenseArea loading={isLoading}>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 h-full flex flex-col"
                >
                  <div className="flex-grow">
                    <div className="grid w-full items-center gap-4">
                      <FormField
                        control={form.control}
                        name="modelId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Model <ModelTooltip />
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">Select a model</SelectItem>
                                <SelectItem value={AssessmentModel.QASS}>QASS</SelectItem>
                                <SelectItem value={AssessmentModel.WebAVALIA}>WebAVALIA</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* QASS */}
                      <>
                        <FormField
                          control={form.control}
                          name="mode"
                          render={({ field }) => (
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Mode <ModeTooltip />
                              </FormLabel>
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
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Polishing factor <PolishingFactorTooltip />
                              </FormLabel>
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
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Peer rating impact <PeerRatingImpactTooltip />
                              </FormLabel>
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
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Group spread <GroupSpreadTooltip />
                              </FormLabel>
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
                        <div className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                          <div className="flex items-center gap-4 border-t mt-2" />
                          <CardTitle className="text-xl flex gap-2 items-center mt-4">
                            Peer Rating Configuration
                          </CardTitle>
                        </div>
                        <FormField
                          control={form.control}
                          name="scaleType"
                          render={({ field }) => (
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Scale <ScaleTooltip />
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!data.canEdit}
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
                                selectedModel !== AssessmentModel.QASS && 'hidden'
                              )}
                            >
                              <FormControl>
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id="terms-2"
                                    checked={field.value ?? false}
                                    onCheckedChange={field.onChange}
                                    disabled={!data.canEdit}
                                  />
                                  <div className="grid gap-2">
                                    <FormLabel htmlFor="terms-2">
                                      Apply total score constraint
                                      <ApplyConstraintTooltip />
                                    </FormLabel>
                                    <FormDescription>
                                      Students must follow the total score constraint when allocating peer assessment
                                      scores.
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
                            <FormItem className={cn('mb-4', selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Constraint <ConstraintTooltip />
                              </FormLabel>

                              <FormControl>
                                <Input
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(parseFloat(e.target.value))
                                    if (isTotalScoreConstrained) form.trigger('scoreConstraint')
                                  }}
                                  // disabled={!isTotalScoreConstrained}
                                  disabled={!isTotalScoreConstrained || !data.canEdit}
                                  type="number"
                                  placeholder="Enter score constraint"
                                  step={selectedScaleType === ScaleType.PercentageScale ? '0.1' : '1'}
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
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Lower bound <LowerBoundTooltip />
                              </FormLabel>
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
                                  step={selectedScaleType === ScaleType.PercentageScale ? '0.1' : '1'}
                                  disabled={!data.canEdit}
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
                            <FormItem className={cn(selectedModel !== AssessmentModel.QASS && 'hidden')}>
                              <FormLabel>
                                Upper bound <UpperBoundTooltip />
                              </FormLabel>
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
                                  step={selectedScaleType === ScaleType.PercentageScale ? '0.1' : '1'}
                                  disabled={!data.canEdit}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {isTotalScoreConstrained && renderGroupMessage()}
                      </>

                      {/* WebAVALIA */}
                      <>
                        <FormField
                          control={form.control}
                          name="selfWeight"
                          render={({ field }) => (
                            <FormItem className={cn(selectedModel !== AssessmentModel.WebAVALIA && 'hidden')}>
                              <FormLabel>
                                Self assessment weight <SelfAssessmentWeight />
                              </FormLabel>
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
                      </>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t mt-2" />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      loading={updateMutation.isPending}
                      disabled={selectedModel === '0'}
                      onClick={onClickUseRecommended}
                    >
                      Use Recommended
                    </Button>
                    {!data.canEdit && data?.modelId?.toString() !== selectedModel ? (
                      <AlertDialog
                        dialogType="info"
                        triggerButton={
                          <Button
                            type="button"
                            disabled={selectedModel === '0'}
                          >
                            Save
                          </Button>
                        }
                        title="Can't change assessment model"
                        content="You can't change assessment model since some components already started. You have to delete them before you can change assessment model."
                        confirmButtonText="Understand"
                        showCancelButton={false}
                      />
                    ) : (
                      <Button
                        type="submit"
                        loading={updateMutation.isPending}
                        disabled={selectedModel === '0'}
                      >
                        Save
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </SuspenseArea>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <div className="bg-white p-4 flex flex-col gap-4 rounded-xl border-primary/70 border-3">
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-lg">Are you new to this?</h4>
              <div className="text-sm text-muted-foreground">
                Don't worry, this questionnarie will help you setup and find the right model for you!
              </div>
            </div>
            <QuestionnaireDialog
              onClickApply={onApplyModelParameter}
              isApplying={!!parameters}
              triggerButton={
                <Button
                  disabled={!data.canEdit}
                  className="w-full bg-linear-65 from-purple-500 to-pink-500 sm:max-w-50 xl:max-w-50"
                >
                  Start Questionnaire!
                </Button>
              }
            />
          </div>
          <Card className="flex flex-row justify-between items-center bg-primary py-3! px-4!">
            <div>
              <CardTitle className="text-base text-white">Don't know how to setup?</CardTitle>
              <CardDescription className="text-white">Read Tutorial</CardDescription>
            </div>
            <Link
              to="/instructor/tutorial"
              hash="webavalia"
            >
              <CirclePlay className="text-white hover:cursor-pointer" />
            </Link>
          </Card>
        </div>
      </div>
    </>
  )
}

export default ModelTab
