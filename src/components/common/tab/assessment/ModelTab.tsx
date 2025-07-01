import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  tuningFactor: z
    .string()
    .min(1, { message: 'Please enter a turing factor.' })
    .refine((val) => /^[0-9]*\.?[0-9]+$/.test(val), {
      message: 'Turing factor must be a number.',
    }),
})

const webavaliaSchema = z.object({
  modelId: z.literal(model.WebAVALIA),
  selfAssessmentWeight: z
    .string()
    .min(1, { message: 'Please enter a self assessment weight.' })
    .refine((val) => /^[0-9]*\.?[0-9]+$/.test(val), {
      message: 'Self assessment weight must be a number.',
    }),
  peerAssessmentWeight: z
    .string()
    .min(1, { message: 'Please enter a peer assessment weight.' })
    .refine((val) => /^[0-9]*\.?[0-9]+$/.test(val), {
      message: 'Peer assessment weight must be a number.',
    }),
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
          return { modelId: model.QASS, tuningFactor: '' }
        }
        const modelConfigQASS = qassSchema.omit({ modelId: true }).parse(data.modelConfig)
        return { ...modelConfigQASS, modelId: model.QASS }
      //generate default value for WebAVALIA
      case model.WebAVALIA:
        if (data?.modelId?.toString() !== model.WebAVALIA) {
          return { modelId: model.WebAVALIA, selfAssessmentWeight: '', peerAssessmentWeight: '' }
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
      <div className="flex flex-row h-full">
        <Card className="flex-grow flex gap-4 max-w-[50%]">
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
                        <FormField
                          control={form.control}
                          name="tuningFactor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tuning Factor</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter tuning factor"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                    placeholder="Enter self assessment weight"
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
                                    placeholder="Enter peer assessment weight"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
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
        <div className="flex-grow max-w-[50%] p-4">Questionnaire & Model detail</div>
      </div>
    </>
  )
}

export default ModelTab
