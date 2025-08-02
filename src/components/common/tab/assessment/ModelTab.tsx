import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mode } from '@/config/app'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GetAssessmentByIdResponse } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { SettingsIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import AlertDialog from '../../AlertDialog'
import QuestionnaireDialog from '../../dialog/QuestionnaireDialog'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const model = {
  QASS: '1',
  WebAVALIA: '2',
}

const baseSchema = z.object({
  modelId: z.literal('0'),
})

const qassSchema = z.object({
  modelId: z.literal(model.QASS),
  mode: z.enum([mode.Bijunction, mode.Conjunction, mode.Disjunction], { required_error: 'Mode is required' }),
  polishingFactor: z
    .number({
      required_error: 'Polishing factor is required.',
      invalid_type_error: 'Polishing factor must be a number.',
    })
    .finite()
    .gt(0, { message: 'Polishing factor must be greater than 0.' })
    .lt(0.5, { message: 'Polishing factor must be less than 0.5.' }),
  peerRatingImpact: z
    .number({
      required_error: 'Peer rating impact is required.',
      invalid_type_error: 'Peer rating impact must be a number.',
    })
    .finite()
    .min(0, { message: 'Peer rating impact must be greater than or equal to 0.' }),
  groupSpread: z
    .number({ required_error: 'Group spread is required.', invalid_type_error: 'Group spread must be a number.' })
    .finite()
    .min(0, { message: 'Group spread must be greater than or equal to 0.' })
    .max(1, { message: 'Group spread must be less than or equal to 1.' }),
})

const webavaliaSchema = z.object({
  modelId: z.literal(model.WebAVALIA),
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

  const getDefaultValues = (modelId: string): Partial<ModelFormSchema> => {
    switch (modelId) {
      // generate default value for QASS
      case model.QASS:
        if (data?.modelId?.toString() !== model.QASS) {
          return {
            modelId: model.QASS,
            mode: undefined,
            polishingFactor: undefined,
            peerRatingImpact: undefined,
            groupSpread: undefined,
          }
        }
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigQASS, modelId: model.QASS }
      //generate default value for WebAVALIA
      case model.WebAVALIA:
        if (data?.modelId?.toString() !== model.WebAVALIA) {
          return {
            modelId: model.WebAVALIA,
            selfWeight: undefined,
          }
        }
        const modelConfigWeb = webavaliaSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigWeb, modelId: model.WebAVALIA }
      // select none
      default:
        return { modelId: '0' }
    }
  }

  const form = useForm<ModelFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(modelIdStr),
    shouldUnregister: true,
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

  useEffect(() => {
    const values = getDefaultValues(selectedModel)
    setFormValues(values)
  }, [selectedModel])

  const onClickUseRecommended = () => {
    if (selectedModel === model.QASS) {
      const values = {
        modelId: model.QASS,
        mode: mode.Bijunction,
        polishingFactor: 0.001,
        peerRatingImpact: 1,
        groupSpread: 0.5,
      }
      setFormValues(values)
    } else if (selectedModel === model.WebAVALIA) {
      const values = {
        modelId: model.WebAVALIA,
        selfWeight: 0,
      }
      setFormValues(values)
    }
  }

  const setFormValues = (values: Partial<ModelFormSchema>) => {
    for (const key in values) {
      const field = key as keyof typeof values
      form.setValue(field, values[field]!)
    }
  }

  const onSubmit = async (values: ModelFormSchema) => {
    const { modelId, ...modelConfig } = values
    const payload = {
      ...data,
      modelId: parseInt(modelId),
      modelConfig,
    }
    updateMutation.mutate(payload)
  }

  return (
    <>
      <div className="flex flex-col-reverse md:grid md:grid-cols-2 lg:grid-cols-[3fr_2fr] gap-8 h-full">
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
                            <FormLabel>Model</FormLabel>
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
                                <SelectItem value={model.QASS}>QASS</SelectItem>
                                <SelectItem value={model.WebAVALIA}>WebAVALIA</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* QASS */}
                      {selectedModel === model.QASS && (
                        <>
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
                                <FormLabel>Polishing Factor</FormLabel>
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
                        </>
                      )}

                      {/* WebAVALIA */}
                      {selectedModel === model.WebAVALIA && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
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
                        content="You can't change assessment model since some scoring components already started. You have to delete them before you can change assessment model."
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
        <div>
          <div className="bg-white p-4 flex flex-col gap-4 rounded-xl border-primary/70 border-3">
            <div className="flex gap-3">
              <h4 className="font-semibold text-xl">Are you new to this?</h4>
            </div>
            <div className="text-sm">Don't worry, this questionnarie will help you find the right model for you!</div>
            <QuestionnaireDialog
              triggerButton={
                <Button className="w-full bg-linear-65 from-purple-500 to-pink-500 sm:max-w-50 md:max-w-full xl:max-w-50">
                  Start Questionnaire!
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default ModelTab
