import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GetAssessmentByIdResponse } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { SettingsIcon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
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
  selfRating: z.boolean(),
  tuningFactor: z.union([
    z
      .number({ required_error: 'Please enter a turing factor', invalid_type_error: 'Tuning factor must be a number' })
      .finite()
      .gt(0, { message: 'Tuning factor must be greater than 0' })
      .lt(0.5, { message: 'Tuning factor must be less than 0.5' }),
    z.nan(),
  ]),
  peerRatingImpact: z.union([
    z
      .number({
        required_error: 'Please enter a peer rating impact',
        invalid_type_error: 'Peer rating impact must be a number',
      })
      .finite()
      .min(0, { message: 'Peer rating impact must be greater than or equal to 0' }),
    z.nan(),
  ]),
  groupSpread: z.union([
    z
      .number({
        required_error: 'Please enter a group spread',
        invalid_type_error: 'Group spread must be a number',
      })
      .finite()
      .min(0, { message: 'Group spread must be greater than or equal to 0' })
      .max(1, { message: 'Group spread must be less than or equal to 1' }),
    z.nan(),
  ]),
  peerRatingWeight: z.union([
    z
      .number({
        required_error: 'Please enter a peer rating weight',
        invalid_type_error: 'Peer rating weight must be a number',
      })
      .finite()
      .min(0, { message: 'Peer rating weight must be greater than or equal to 0' })
      .max(1, { message: 'Peer rating weight must be less than or equal to 1' }),
    z.nan(),
  ]),
})

const webavaliaSchema = z.object({
  modelId: z.literal(model.WebAVALIA),
  selfRating: z.boolean(),
  selfAssessmentWeight: z.union([
    z
      .number({
        required_error: 'Please enter a self assessment weight',
        invalid_type_error: 'Self assessment weight must be a number',
      })
      .finite()
      .min(0, { message: 'Self assessment weight must be greater than or equal to 0' })
      .max(1, { message: 'Self assessment weight must be less than or equal to 1' }),
    z.nan(),
  ]),
  peerAssessmentWeight: z.union([
    z
      .number({
        required_error: 'Please enter a peer assessment weight',
        invalid_type_error: 'Peer assessment weight must be a number',
      })
      .finite()
      .min(0, { message: 'Peer assessment weight must be greater than or equal to 0' })
      .max(1, { message: 'Peer assessment weight must be less than or equal to 1' }),
    z.nan(),
  ]),
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
          return { modelId: model.QASS, selfRating: false, tuningFactor: 1, peerRatingImpact: 1, groupSpread: 0.5 }
        }
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigQASS, modelId: model.QASS }
      //generate default value for WebAVALIA
      case model.WebAVALIA:
        if (data?.modelId?.toString() !== model.WebAVALIA) {
          return { modelId: model.WebAVALIA, selfRating: false, selfAssessmentWeight: 0, peerAssessmentWeight: 1 }
        }
        const modelConfigWeb = webavaliaSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigWeb, modelId: model.WebAVALIA }
      // select none
      default:
        return { modelId: '0', selfRating: false }
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

  // useEffect(() => {
  //   if (selectedModel !== '0') {
  //     const values = getDefaultValues(selectedModel)
  //     for (const key in values) {
  //       const field = key as keyof typeof values
  //       form.setValue(field, values[field]!)
  //     }
  //   }
  // }, [selectedModel])

  const onSubmit = async (values: ModelFormSchema) => {
    // console.log('TLOG ~ values:', values)
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

                      {selectedModel === model.QASS && (
                        <>
                          <FormField
                            control={form.control}
                            name="tuningFactor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tuning Factor</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    type="number"
                                    placeholder="Enter tuning factor"
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
                            name="peerRatingWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Peer rating weight</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    type="number"
                                    placeholder="Enter peer rating weight"
                                    step="0.1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {selectedModel === model.WebAVALIA && (
                        <>
                          <FormField
                            control={form.control}
                            name="selfAssessmentWeight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Self Assessment Weight</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    type="number"
                                    placeholder="Enter self assessment weight"
                                    step="0.1"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="peerAssessmentWeight"
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
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {selectedModel !== '0' && (
                        <FormField
                          control={form.control}
                          name="selfRating"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-center gap-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(checked)}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">Allow self rating</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    loading={updateMutation.isPending}
                    className="ml-auto"
                    disabled={selectedModel === '0'}
                  >
                    Save
                  </Button>
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
            <div>Don't worry, this questionnarie will help you find the right model for you!</div>
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
