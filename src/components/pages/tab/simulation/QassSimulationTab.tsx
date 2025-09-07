import { api } from '@/api'
import toast from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mode, ScaleType } from '@/config/app'
import { cn } from '@/lib/utils'
import { validateBoundConflict, validateConstraintConflict, validateScoreConstraint } from '@/utils/qass'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CalcualteScoresByQASSResponse } from 'gpa-backend/src/simulation/dto/simulation.response'
import {
  Calculator,
  ChartSpline,
  CircleMinus,
  CirclePlus,
  NotebookPen,
  RotateCw,
  SettingsIcon,
  UsersRound,
  Weight,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm, UseFormReturn, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { QASSMode } from '../../../../../gpa-backend/src/utils/qass.model'
import {
  ApplyConstraintTooltip,
  ConstraintTooltip,
  GroupScoreTooltip,
  GroupSpreadTooltip,
  LowerBoundTooltip,
  ModeTooltip,
  PeerRatingImpactTooltip,
  PolishingFactorTooltip,
  ScaleTooltip,
  StudentWeightTooltip,
  UpperBoundTooltip,
} from '../../tooltip/ModelTooltips'

const formSchema = z
  .object({
    mode: z.enum([mode.Bijunction, mode.Conjunction, mode.Disjunction], { required_error: 'Mode is required' }),
    polishingFactor: z
      .number({ required_error: 'Polishing factor is required', invalid_type_error: 'Polishing factor is required' })
      .finite()
      .gt(0, { message: 'Polishing factor must be greater than 0' })
      .lt(0.5, { message: 'Polishing factor must be less than 0.5' }),
    peerRatingImpact: z
      .number({
        required_error: 'Peer rating impact is required',
        invalid_type_error: 'Peer rating impact is required',
      })
      .finite()
      .min(0, { message: 'Peer rating impact must be greater than or equal 0' }),
    groupSpread: z
      .number({ required_error: 'Group spread is required', invalid_type_error: 'Group spread is required' })
      .finite()
      .gt(0, { message: 'Group spread must be greater than 0' })
      .lt(1, { message: 'Group spread must be less than 1' }),
    weights: z.array(
      z
        .number({ required_error: 'Student weight is required', invalid_type_error: 'Weight must be an integer' })
        .int()
        .min(0, { message: 'Weights must be greater than or equal 0' })
    ),
    groupScore: z
      .number({ required_error: 'Group score is required', invalid_type_error: 'Group score is required' })
      .finite()
      .gt(0, { message: 'Group score must be greater than 0' })
      .lt(1, { message: 'Group score must be less than 1' }),
    scaleType: z.string({ required_error: 'Scale is required', invalid_type_error: 'Scale is required' }),
    lowerBound: z
      .number({ required_error: 'Lower bound is required', invalid_type_error: 'Lower bound is required' })
      .finite(),
    upperBound: z
      .number({ required_error: 'Upper bound is required', invalid_type_error: 'Upper bound is required' })
      .finite(),
    isTotalScoreConstrained: z.boolean(),
    scoreConstraint: z
      .number({ required_error: 'Constraint is required', invalid_type_error: 'Constraint is required' })
      .finite()
      .gt(0, { message: 'Constraint must be greater than 0' })
      .max(100, { message: 'Constraint must be lower than or equal 100' })
      .optional(),
    peerMatrix: z.array(z.array(z.union([z.number().finite(), z.nan()]))),
  })
  .refine((data) => validateBoundConflict(data.lowerBound, data.upperBound), {
    message: 'Lower bound must be less than upper bound',
    path: ['lowerBound'],
  })
  .refine((data) => validateScoreConstraint(data.isTotalScoreConstrained, data.scoreConstraint), {
    message: 'Constraint is required',
    path: ['scoreConstraint'],
  })
  .refine(
    (data) =>
      validateConstraintConflict(
        data.lowerBound,
        data.upperBound,
        data.peerMatrix.length,
        data.isTotalScoreConstrained,
        data.scoreConstraint
      ),
    {
      message: 'Constraint conflicts with lower or upper bound',
      path: ['scoreConstraint'],
    }
  )

type FormSchema = z.infer<typeof formSchema>

interface QassSimulationTabProps {
  scrollToBottom: () => void
}

const QassSimulationTab = ({ scrollToBottom }: QassSimulationTabProps) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [groupSize, setGroupSize] = useState(5)
  const [result, setResult] = useState<CalcualteScoresByQASSResponse | null>(null)
  const [errorMatrix, setErrorMatrix] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: undefined,
      polishingFactor: undefined,
      peerRatingImpact: undefined,
      groupScore: undefined,
      groupSpread: undefined,
      weights: Array(groupSize).fill(1),
      isTotalScoreConstrained: false,
      scoreConstraint: 1,
      lowerBound: 0,
      upperBound: 0,
    },
  })

  const isTotalScoreConstrained = useWatch({
    control: form.control,
    name: 'isTotalScoreConstrained',
  })

  const selectedScaleType = useWatch({
    control: form.control,
    name: 'scaleType',
  }) as keyof typeof ScaleType

  const lowerBound = useWatch({
    control: form.control,
    name: 'lowerBound',
  })

  const upperBound = useWatch({
    control: form.control,
    name: 'upperBound',
  })

  const scoreConstraint = useWatch({
    control: form.control,
    name: 'scoreConstraint',
  })

  useEffect(() => {
    if (result) scrollToBottom()
  }, [result])

  const mutation = useMutation({
    mutationFn: api.simulation.calcualteScoresByQASS,
    onSuccess: (res) => {
      setTimeout(() => {
        setResult(res.data)
        setLoading(false)
      }, 100)
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    },
  })

  const onSubmit = async (values: FormSchema) => {
    const payload = formSchema.parse(values)
    const valid = validateInputType(payload) && validatePeerMatrix(payload.peerMatrix)
    if (!valid) return
    setErrorMatrix(null)
    setLoading(true)

    const enumMode =
      payload.mode === mode.Bijunction ? QASSMode.B : payload.mode === mode.Conjunction ? QASSMode.C : QASSMode.D
    mutation.mutate({
      ...payload,
      mode: enumMode,
      groupProductScore: payload.groupScore,
      peerRatingWeights: payload.weights,
    })
  }

  const validateInputType = (payload: FormSchema) => {
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

  const validatePeerMatrix = (values: number[][]) => {
    const tolerance = 0.001
    for (let i = 0; i < values.length; i++) {
      let sum = 0
      // check ratings in each cell
      for (let j = 0; j < values.length; j++) {
        if (isNaN(values[j][i])) continue
        if (values[j][i]! > upperBound || values[j][i]! < lowerBound) {
          setErrorMatrix(`Ratings are lower than ${lowerBound} or higher than ${upperBound}`)
          return false
        }
        if (selectedScaleType !== ScaleType.PercentageScale && !Number.isInteger(values[j][i])) {
          setErrorMatrix(`Ratings of ${selectedScaleType} must be integer`)
          return false
        }
        sum += values[j][i] ?? 0
      }
      // check sum of ratings in vertical line
      if (isTotalScoreConstrained && Math.abs(scoreConstraint! - sum) > tolerance) {
        setErrorMatrix(
          `The sum of scores in each column must equal ${scoreConstraint}. Please adjust the values so that each vertical line adds up to ${scoreConstraint}.`
        )
        return false
      }
    }
    return true
  }

  return (
    <div
      ref={ref}
      className="space-y-10"
    >
      <Card className="flex gap-4 w-full shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-xl flex gap-2 items-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
            Model configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <ModelConfigurationForm
            form={form}
            groupSize={groupSize}
          />
          <PeerMatrix
            form={form}
            groupSize={groupSize}
            setGroupSize={setGroupSize}
          />
          <div className="w-full max-w-[400px] md:m-auto mt-8!">
            <div className="text-destructive text-sm text-center">{errorMatrix}</div>
          </div>

          <div className="flex self-end gap-2 mt-16">
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loading={loading}
            >
              {!loading && <Calculator />}
              Calculate scores
            </Button>
          </div>
        </CardContent>
      </Card>
      {result && <ResultCard result={result} />}
    </div>
  )
}

export default QassSimulationTab

const ModelConfigurationForm = ({ form, groupSize }: { form: UseFormReturn<FormSchema>; groupSize: number }) => {
  const groupSizeList = [...Array(groupSize)]

  const randomWeight = () => Math.floor(Math.random() * 6) // random number 0 - 5

  const onClickRandomWeights = () => {
    form.setValue(
      'weights',
      groupSizeList.map(() => randomWeight())
    )
  }

  const setDefaultWeights = () => {
    form.setValue('weights', Array(groupSize).fill(1))
  }

  useEffect(() => {
    setDefaultWeights()
  }, [groupSize])

  return (
    <Form {...form}>
      <form className="space-y-4 flex flex-col">
        <div className="grid sm:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>
                  Polishing factor <PolishingFactorTooltip />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('polishingFactor')
                    }}
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
                <FormLabel>
                  Peer rating impact <PeerRatingImpactTooltip />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('peerRatingImpact')
                    }}
                    type="number"
                    placeholder="Enter peer rating impact"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4 border-t mt-2" />

        <div className="flex items-center gap-2 mb-8">
          <UsersRound className="w-6 h-6 text-primary" />
          <h2 className="font-semibold text-lg">Group</h2>
        </div>
        <div className="grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
          <FormField
            control={form.control}
            name="groupScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group score <GroupScoreTooltip />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('groupScore')
                    }}
                    type="number"
                    placeholder="Enter group score"
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
                <FormLabel>
                  Group spread <GroupSpreadTooltip />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value))
                      form.trigger('groupSpread')
                    }}
                    type="number"
                    placeholder="Enter group spread"
                    step="0.1"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4 border-t mt-2" />
        <div className="flex items-center gap-2 mb-8">
          <Weight className="w-6 h-6 text-primary" />
          <h2 className="font-semibold text-lg">Student Weights</h2>
        </div>
        <div className="grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
          {groupSizeList.map((_, i) => (
            <FormField
              key={i}
              control={form.control}
              name={`weights.${i}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {`Weight of student ${i + 1}`} <StudentWeightTooltip />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value))
                        form.trigger(`weights.${i}`)
                      }}
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
        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={onClickRandomWeights}
          >
            Randomize
          </Button>
          <Button
            type="button"
            className="w-fit"
            onClick={setDefaultWeights}
          >
            Default
          </Button>
        </div>
      </form>
    </Form>
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
  form: UseFormReturn<FormSchema>
  groupSize: number
  setGroupSize: React.Dispatch<React.SetStateAction<number>>
}) => {
  const groupSizeList = [...Array(groupSize)]

  const selectedMode = useWatch({
    control: form.control,
    name: 'mode',
  })

  const isTotalScoreConstrained = useWatch({
    control: form.control,
    name: 'isTotalScoreConstrained',
  })

  const lowerBound = useWatch({
    control: form.control,
    name: 'lowerBound',
  })

  const upperBound = useWatch({
    control: form.control,
    name: 'upperBound',
  })

  const scoreConstraint = useWatch({
    control: form.control,
    name: 'scoreConstraint',
  })

  const selectedScaleType = useWatch({
    control: form.control,
    name: 'scaleType',
  }) as keyof typeof ScaleType

  useEffect(() => {
    if (selectedMode === mode.Conjunction) {
      setDiagonalValues(1)
    } else if (selectedMode === mode.Disjunction) {
      setDiagonalValues(0)
    }
  }, [selectedMode])

  useEffect(() => {
    if (selectedScaleType === ScaleType.PercentageScale) {
      form.setValue('lowerBound', 0)
      form.setValue('upperBound', 1)
      form.setValue('scoreConstraint', 1)
    } else if (selectedScaleType === ScaleType.NPointScale) {
      form.setValue('lowerBound', 1)
      form.setValue('upperBound', 5)
      form.setValue('scoreConstraint', 20)
    }
    form.setValue('isTotalScoreConstrained', false)
  }, [selectedScaleType])

  const setDiagonalValues = (value: number) => {
    const peerMatrix = form.getValues('peerMatrix') || []
    for (let i = 0; i < peerMatrix.length; i++) {
      form.setValue(`peerMatrix.${i}.${i}`, value)
    }
  }

  const randomPeerMatrix = () => {
    if (isTotalScoreConstrained) {
      return randomConstraintPeerMatrix()
    }
    return randomUnconstraintPeerMatrix()
  }

  const randomUnconstraintPeerMatrix = () => {
    if (selectedScaleType === ScaleType.PercentageScale) {
      return randomUnconstraintPercentageScale()
    }
    return randomUnconstraintNPointScale()
  }

  const randomConstraintPeerMatrix = () => {
    if (selectedScaleType === ScaleType.PercentageScale) {
      return randomConstraint(0.01)
    }
    return randomConstraint(1)
  }

  const randomUnconstraintPercentageScale = () => {
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
        const random = Math.random() * (upperBound - lowerBound) + lowerBound
        const randomScore = parseFloat(random.toFixed(2))
        peerMatrix[i].push(randomScore)
      }
    }
    return peerMatrix
  }

  const randomUnconstraintNPointScale = () => {
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
        const min = Math.ceil(lowerBound)
        const max = Math.floor(upperBound)
        const randomScore = Math.floor(Math.random() * (max - min + 1)) + min
        peerMatrix[i].push(randomScore)
      }
    }
    return peerMatrix
  }

  const randomConstraint = (steps: number) => {
    const peerMatrix: number[][] = []
    const temp: number[][] = []
    for (let i = 0; i < groupSize; i++) {
      temp.push(generateRandomConstraintRating(steps, i))
    }
    for (let i = 0; i < groupSize; i++) {
      const newRow = []
      for (let j = 0; j < groupSize; j++) {
        newRow.push(temp[j][i])
      }
      peerMatrix.push(newRow)
    }
    return peerMatrix
  }

  const generateRandomConstraintRating = (steps: number, i: number) => {
    const parts = Array(groupSize)
      .fill(lowerBound)
      .map((item, j) => {
        if (i === j) {
          if (selectedMode === mode.Conjunction) return 1
          else if (selectedMode === mode.Disjunction) return 0
          else return item
        }
        return item
      })

    let remaining = scoreConstraint! - lowerBound * groupSize
    if (selectedMode === mode.Conjunction) {
      remaining = remaining - lowerBound - 1
    } else if (selectedMode === mode.Disjunction) {
      remaining = remaining - lowerBound
    }
    const indexList = parts.map((_, j) => j)
    if (selectedMode === mode.Conjunction || selectedMode === mode.Disjunction) {
      indexList.splice(i, 1)
    }

    while (remaining > 0) {
      const j = Math.floor(Math.random() * indexList.length)
      const index = indexList[j]
      if (parts[index] >= upperBound) {
        const j = indexList.indexOf(index)
        if (j !== -1) indexList.splice(j, 1)
        continue
      }
      parts[index] = parseFloat((parts[index] + steps).toFixed(2))
      remaining = parseFloat((remaining - steps).toFixed(2))
    }

    return parts
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
    const weights = form.getValues('weights')
    weights.pop()
    form.unregister(`weights.${newSize}`)
    form.setValue('weights', weights)
    setGroupSize(newSize)
  }

  const scaleTypeOptions = Object.values(ScaleType).map((value) => ({ label: value, value }))

  return (
    <>
      <div className="flex items-center gap-4 border-t my-6" />
      <div className="flex items-center gap-2 mb-8">
        <NotebookPen className="w-6 h-6 text-primary" />
        <h2 className="font-semibold text-lg">Peer Matrix</h2>
      </div>
      <Form {...form}>
        <form className="space-y-4 flex flex-col">
          <div className="grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
            <FormField
              control={form.control}
              name="scaleType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Scale <ScaleTooltip />
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
            <div />

            <FormField
              control={form.control}
              name="isTotalScoreConstrained"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3">
                  <FormControl>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms-2"
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                      <div className="grid gap-2">
                        <FormLabel htmlFor="terms-2">
                          Apply total score constraint <ApplyConstraintTooltip />
                        </FormLabel>
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
                <FormItem className="mb-4">
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
                      disabled={!isTotalScoreConstrained}
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
                <FormItem>
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
                <FormItem>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center gap-4 border-t mt-4 mb-8" />
          <div className="flex flex-col gap-8 items-center">
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
                      disabled={
                        selectedScaleType === ScaleType.PercentageScale &&
                        ((!isTotalScoreConstrained && !validateBoundConflict(lowerBound, upperBound)) ||
                          (isTotalScoreConstrained &&
                            (!validateBoundConflict(lowerBound, upperBound) ||
                              !validateConstraintConflict(
                                lowerBound,
                                upperBound,
                                groupSize,
                                isTotalScoreConstrained,
                                scoreConstraint
                              ))))
                      }
                    >
                      <RotateCw className="size-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}
