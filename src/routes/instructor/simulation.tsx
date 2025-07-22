import { api } from '@/api'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Roles } from '@/config/app'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { CalcualteScoresByQASSResponse } from 'gpa-backend/src/simulation/dto/simulation.response'
import { Calculator, ChartSpline, CircleMinus, CirclePlus, GraduationCap, RotateCw, SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { QASSMode } from '../../../gpa-backend/src/utils/qass.model'

export const Route = createFileRoute('/instructor/simulation')({
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

const model = {
  QASS: '1',
  WebAVALIA: '2',
}

const mode = {
  Bijunction: 'B',
  Conjunction: 'C',
  Disjunction: 'D',
}

const baseSchema = z.object({
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  peerMatrix: z.array(z.array(z.union([z.number().finite().min(0).max(1), z.nan()]).optional())),
})

const emptySchema = baseSchema.extend({
  modelId: z.literal('0'),
})

const qassSchema = baseSchema.extend({
  modelId: z.literal(model.QASS),
  mode: z.enum([mode.Bijunction, mode.Conjunction, mode.Disjunction], { required_error: 'Mode is required' }),
  // selfRating: z.boolean(),
  tuningFactor: z
    .number({ required_error: 'Tuning factor is required', invalid_type_error: 'Tuning factor must be a number' })
    .finite()
    .gt(0, { message: 'Tuning factor must be greater than 0' })
    .lt(0.5, { message: 'Tuning factor must be less than 0.5' }),
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
    .min(0, { message: 'Group spread must be greater than or equal 0' })
    .max(1, { message: 'Group spread must be less than or equal 1' }),
  weights: z.array(
    z
      .number({ required_error: 'Please enter a weight', invalid_type_error: 'Weight must be a number' })
      .int()
      .min(0, { message: 'Weights must be greater than or equal 0' })
  ),
})

const webavaliaSchema = baseSchema.extend({
  modelId: z.literal(model.WebAVALIA),
  // selfRating: z.boolean(),
  selfAssessmentWeight: z
    .number({
      required_error: 'Self-assessment weight is required',
      invalid_type_error: 'Self-assessment weight must be a number',
    })
    .finite()
    .min(0, { message: 'Self-assessment weight must be greater than or equal to 0' })
    .max(1, { message: 'Self-assessment weight must be less than or equal to 1' }),
  peerAssessmentWeight: z
    .number({
      required_error: 'Peer assessment weight is required',
      invalid_type_error: 'Peer assessment weight must be a number',
    })
    .finite()
    .min(0, { message: 'Peer assessment weight must be greater than or equal to 0' })
    .max(1, { message: 'Peer assessment weight must be less than or equal to 1' }),
})

const formSchema = z.discriminatedUnion('modelId', [emptySchema, qassSchema, webavaliaSchema])

type ModelFormSchema = z.infer<typeof formSchema>

function RouteComponent() {
  const [groupSize, setGroupSize] = useState(5)
  const [result, setResult] = useState<CalcualteScoresByQASSResponse | null>(null)

  const getDefaultValues = (modelId: string): Partial<ModelFormSchema> => {
    switch (modelId) {
      // generate default value for QASS
      case model.QASS:
        return {
          modelId: model.QASS,
          mode: undefined,
          // selfRating: false,
          tuningFactor: undefined,
          peerRatingImpact: undefined,
          groupSpread: undefined,
        }
      //generate default value for WebAVALIA
      case model.WebAVALIA:
        return {
          modelId: model.WebAVALIA,
          // selfRating: false,
          selfAssessmentWeight: undefined,
          peerAssessmentWeight: undefined,
        }
      // select none
      default:
        return {
          modelId: '0',
          // selfRating: false
        }
    }
  }

  const form = useForm<ModelFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues('0'),
  })

  const selectedModel = useWatch({
    control: form.control,
    name: 'modelId',
  })

  useEffect(() => {
    if (selectedModel === '0' || selectedModel === model.QASS) {
      form.unregister(['selfAssessmentWeight', 'peerAssessmentWeight'])
    }
    if (selectedModel === '0' || selectedModel === model.WebAVALIA) {
      form.unregister(['mode', 'tuningFactor', 'peerRatingImpact', 'groupSpread'])
      for (let i = 0; i < groupSize; i++) {
        form.unregister(`weights.${i}`)
      }
    }
    const values = getDefaultValues(selectedModel)
    setFormValues(values)
  }, [selectedModel])

  const setFormValues = (values: Partial<ModelFormSchema>) => {
    for (const key in values) {
      const field = key as keyof typeof values
      form.setValue(field, values[field]!)
    }
  }

  const mutation = useMutation({
    mutationFn: api.simulation.calcualteScoresByQASS,
    onSuccess: (res) => {
      setResult(res.data)
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const onSubmit = async (values: ModelFormSchema) => {
    console.log('calculate values:', values)
    if (values.modelId === model.QASS) {
      const payload = qassSchema.parse(values)
      const enumMode =
        payload.mode === mode.Bijunction ? QASSMode.B : payload.mode === mode.Conjunction ? QASSMode.C : QASSMode.D
      mutation.mutate({
        ...payload,
        mode: enumMode,
        groupProductScore: payload.groupScore,
        peerRatingWeights: payload.weights,
      })
    }
  }

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Simulation</div>
      </div>
      <div className="flex flex-col gap-8 w-full">
        <ModelConfigurationCard form={form} />
        <OtherParametersCard
          form={form}
          groupSize={groupSize}
        />
        <PeerMatrix
          form={form}
          groupSize={groupSize}
          setGroupSize={setGroupSize}
        />
        {result && <ResultCard result={result} />}
        <div className="flex self-end gap-2">
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={selectedModel === '0'}
            loading={mutation.isPending}
          >
            <Calculator />
            Calculate scores
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

const ModelConfigurationCard = ({ form }: { form: UseFormReturn<ModelFormSchema> }) => {
  const selectedModel = useWatch({
    control: form.control,
    name: 'modelId',
  })
  return (
    <Card className="flex gap-4 w-full">
      <CardHeader>
        <CardTitle className="text-xl flex gap-2 items-center">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Model Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4 h-full flex flex-col">
            <div className="flex-grow">
              <div className="grid sm:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
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
                  </>
                )}

                {/* WebAVALIA */}
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

                {/* All */}
                {/* {selectedModel !== '0' && (
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
                )} */}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

const OtherParametersCard = ({ form, groupSize }: { form: UseFormReturn<ModelFormSchema>; groupSize: number }) => {
  const groupSizeList = [...Array(groupSize)]

  const selectedModel = useWatch({
    control: form.control,
    name: 'modelId',
  })

  return (
    <Card className="flex flex-grow gap-4 w-full">
      <CardHeader>
        <CardTitle className="text-xl flex gap-2 items-center">
          <GraduationCap className="w-6 h-6 text-primary" />
          Other Parameters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4 h-full flex flex-col">
            <div className="flex-grow grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
              <FormField
                control={form.control}
                name="groupScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group score</FormLabel>
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
            </div>
            {selectedModel === model.QASS && (
              <>
                <div className="flex items-center gap-4 border-t mt-2">
                  <h2 className="font-semibold text-lg mt-4 mb-2">Student Weights</h2>
                </div>
                <div className="flex-grow grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
                  {groupSizeList.map((_, i) => (
                    <FormField
                      key={i}
                      control={form.control}
                      name={`weights.${i}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{`Weight of student ${i + 1}`}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              type="number"
                              placeholder="Enter weight"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

const ResultCard = ({ result }: { result: CalcualteScoresByQASSResponse }) => {
  return (
    <Card className="flex flex-grow gap-4 w-full">
      <CardHeader>
        <CardTitle className="text-xl flex gap-2 items-center">
          <ChartSpline className="w-6 h-6 text-primary" />
          Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="flex-grow">
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Contribution</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.studentScores?.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item?.student ?? '-'}</TableCell>
                <TableCell>{item?.rating ?? '-'}</TableCell>
                <TableCell>{item?.contribution ?? '-'}</TableCell>
                <TableCell className="text-right">{item?.score ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Mean</TableCell>
              <TableCell>{result?.mean?.rating ?? '-'}</TableCell>
              <TableCell>{result?.mean?.contribution ?? '-'}</TableCell>
              <TableCell className="text-right">{result?.mean?.score ?? '-'}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

const PeerMatrix = ({
  form,
  groupSize,
  setGroupSize,
}: {
  form: UseFormReturn<ModelFormSchema>
  groupSize: number
  setGroupSize: React.Dispatch<React.SetStateAction<number>>
}) => {
  const groupSizeList = [...Array(groupSize)]

  const selectedModel = useWatch({
    control: form.control,
    name: 'modelId',
  })

  const selectedMode = useWatch({
    control: form.control,
    name: 'mode',
  })

  useEffect(() => {
    if (selectedMode === mode.Conjunction) {
      setDiagonalValues(1)
    } else if (selectedMode === mode.Disjunction) {
      setDiagonalValues(0)
    }
  }, [selectedMode])

  const setDiagonalValues = (value: number) => {
    const peerMatrix = form.getValues('peerMatrix') || []
    for (let i = 0; i < peerMatrix.length; i++) {
      form.setValue(`peerMatrix.${i}.${i}`, value)
    }
  }

  const randomPeerMatrix = () => {
    const peerMatrix: number[][] = []
    for (let i = 0; i < groupSize; i++) {
      peerMatrix.push([])
      for (let j = 0; j < groupSize; j++) {
        if (i === j && selectedMode === mode.Conjunction) {
          peerMatrix[i].push(1)
          continue
        }
        if (i === j && selectedMode === mode.Disjunction) {
          peerMatrix[i].push(0)
          continue
        }
        const randomScore = Math.round(Math.random() * 100) / 100
        peerMatrix[i].push(randomScore)
      }
    }
    return peerMatrix
  }

  useEffect(() => {
    if (selectedMode === mode.Conjunction) {
      form.setValue(`peerMatrix.${groupSize - 1}.${groupSize - 1}`, 1)
    } else if (selectedMode === mode.Disjunction) {
      form.setValue(`peerMatrix.${groupSize - 1}.${groupSize - 1}`, 0)
    }
  }, [groupSize])

  const onClickRandomPeerMatrix = () => {
    const peerMatrix = randomPeerMatrix()
    form.setValue('peerMatrix', peerMatrix)
  }

  const onClickAddStudent = () => {
    setGroupSize((prev) => prev + 1)
  }

  const onClickRemoveStudent = () => {
    const peerMatrix = form.getValues('peerMatrix') || []
    const newSize = peerMatrix.length - 1
    if (newSize < 2) return

    const newPeerMatrix = peerMatrix.slice(0, newSize).map((row) => row.slice(0, newSize))

    for (let i = 0; i < peerMatrix.length; i++) {
      form.unregister(`peerMatrix.${newSize}.${i}`)
      form.unregister(`peerMatrix.${i}.${newSize}`)
    }

    form.setValue('peerMatrix', newPeerMatrix)
    if (selectedModel === model.QASS) {
      const weights = form.getValues('weights')
      weights.pop()
      form.unregister(`weights.${newSize}`)
      form.setValue('weights', weights)
    }
    setGroupSize(newSize)
  }

  return (
    <Form {...form}>
      <form className="flex flex-col gap-8 items-center">
        <div className="max-w-[796px] w-full md:w-auto overflow-x-auto md:overflow-x-visible">
          {/* Peer matrix */}
          <div className="w-fit">
            <div className="flex flex-row">
              <div className="w-22" />
              <div>
                <div className="flex flex-grow justify-center text-lg font-semibold">Rater</div>
                <div className="flex mb-3 mt-4 gap-1">
                  {groupSizeList.map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center font-semibold w-15"
                    >
                      <span>{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <div className="h-fit rotate-270 text-lg font-semibold">Ratee</div>
              <div className="mx-4 space-y-1">
                {groupSizeList.map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center h-15 font-semibold"
                  >
                    <span>{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {groupSizeList.map((_, i) => {
                  return (
                    <div
                      key={i}
                      className="flex flex-row gap-1"
                    >
                      {groupSizeList.map((_, j) => (
                        <FormField
                          control={form.control}
                          name={`peerMatrix.${i}.${j}`}
                          key={j}
                          render={({ field }) => {
                            let value = field.value
                            if (i === j) {
                              if (selectedMode === mode.Conjunction) {
                                value = 1
                              } else if (selectedMode === mode.Disjunction) {
                                value = 0
                              }
                            }
                            return (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    disabled={selectedMode !== mode.Bijunction && i === j ? true : false}
                                    type="number"
                                    step="0.1"
                                    className={cn(
                                      'matrix-input size-15 text-center bg-white',
                                      i == j && 'bg-secondary'
                                    )}
                                  />
                                </FormControl>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full size-9 p-0! bg-success-foreground hover:bg-success text-success hover:text-success-foreground"
                  disabled={groupSize >= 10}
                  onClick={onClickAddStudent}
                >
                  <CirclePlus className="size-6" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full size-9 p-0! bg-destructive-foreground hover:bg-destructive text-destructive hover:text-destructive-foreground"
                  onClick={onClickRemoveStudent}
                  disabled={groupSize <= 2}
                >
                  <CircleMinus className="size-6" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full size-9 p-0! bg-primary-foreground hover:bg-primary text-primary hover:text-primary-foreground"
                  onClick={onClickRandomPeerMatrix}
                >
                  <RotateCw className="size-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
