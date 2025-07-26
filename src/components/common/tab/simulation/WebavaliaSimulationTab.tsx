import { api } from '@/api'
import toast from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Calculator, ChartSpline, CircleMinus, CirclePlus, RotateCw, SettingsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { CalcualteScoresByWebavaliaResponse } from '../../../../../gpa-backend/src/simulation/dto/simulation.response'

const formSchema = z.object({
  selfWeight: z
    .number({
      required_error: 'Self-assessment weight is required',
      invalid_type_error: 'Self-assessment weight must be a number',
    })
    .finite()
    .min(0, { message: 'Self-assessment weight must be greater than or equal to 0' })
    .max(1, { message: 'Self-assessment weight must be less than or equal to 1' }),
  peerWeight: z
    .number({
      required_error: 'Peer assessment weight is required',
      invalid_type_error: 'Peer assessment weight must be a number',
    })
    .finite()
    .min(0, { message: 'Peer assessment weight must be greater than or equal to 0' })
    .max(1, { message: 'Peer assessment weight must be less than or equal to 1' }),
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  peerMatrix: z.array(z.array(z.union([z.number().int().min(0).max(100), z.nan()]).optional())),
})

type FormSchema = z.infer<typeof formSchema>

const WebavaliaSimulationTab = () => {
  const [groupSize, setGroupSize] = useState(5)
  const [result, setResult] = useState<CalcualteScoresByWebavaliaResponse | null>(null)
  const [errorMatrix, setErrorMatrix] = useState<string | null>(null)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selfWeight: undefined,
      peerWeight: undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: api.simulation.calcualteScoresByWebAvalia,
    onSuccess: (res) => {
      setResult(res.data)
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })
  const onSubmit = async (values: FormSchema) => {
    const payload = formSchema.parse(values)
    const valid = validatePeerMatrix(payload.peerMatrix)
    if (!valid) return
    setErrorMatrix(null)
    mutation.mutate({ ...payload, groupProductScore: payload.groupScore })
  }

  const validatePeerMatrix = (values: (number | undefined)[][]) => {
    for (let i = 0; i < values.length; i++) {
      let sum = 0
      for (let j = 0; j < values.length; j++) {
        sum += values[j][i] ?? 0
      }
      if (sum !== 100) {
        setErrorMatrix(
          'The sum of scores in each column must equal 100. Please adjust the values so that each vertical line adds up to 100.'
        )
        return false
      }
    }
    return true
  }

  return (
    <div className="space-y-10">
      <Card className="flex gap-4 w-full shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-xl flex gap-2 items-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
            Configuration
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
              loading={mutation.isPending}
            >
              <Calculator />
              Calculate scores
            </Button>
          </div>
        </CardContent>
      </Card>
      {result && <ResultCard result={result} />}
    </div>
  )
}

export default WebavaliaSimulationTab

const ModelConfigurationForm = ({ form, groupSize }: { form: UseFormReturn<FormSchema>; groupSize: number }) => {
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

  return (
    <Form {...form}>
      <form className="space-y-4 flex flex-col">
        <div className="grid sm:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
          <FormField
            control={form.control}
            name="selfWeight"
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

        <div className="flex items-center gap-4 border-t mt-2" />
        <div className="grid md:grid-cols-2 w-full items-center gap-y-4 gap-x-8">
          <FormField
            control={form.control}
            name="groupScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-lg">Group score</FormLabel>
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
      </form>
    </Form>
  )
}

const ResultCard = ({ result }: { result: CalcualteScoresByWebavaliaResponse }) => {
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
              {/* <TableHead>Rating</TableHead>
              <TableHead>Contribution</TableHead> */}
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.studentScores?.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item?.student ?? '-'}</TableCell>
                {/* <TableCell>{item?.rating ?? '-'}</TableCell>
                <TableCell>{item?.contribution ?? '-'}</TableCell> */}
                <TableCell className="text-right">{item?.score ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Mean</TableCell>
              {/* <TableCell>{result?.mean?.rating ?? '-'}</TableCell>
              <TableCell>{result?.mean?.contribution ?? '-'}</TableCell> */}
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

  const randomPeerMatrix = () => {
    const peerMatrix: number[][] = []
    const temp: number[][] = []
    for (let i = 0; i < groupSize; i++) {
      temp.push(generateRandomVoting())
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

  const generateRandomVoting = () => {
    const steps = 100 / 5
    const parts = Array(groupSize).fill(1)
    let remaining = steps - groupSize

    while (remaining > 0) {
      const index = Math.floor(Math.random() * groupSize)
      parts[index]++
      remaining--
    }

    return parts.map((n) => n * 5)
  }

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
    setGroupSize(newSize)
  }

  return (
    <>
      <div className="flex items-center gap-4 border-t my-6" />
      <h2 className="font-semibold text-lg mb-12">Peer Matrix</h2>
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
                              return (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
    </>
  )
}
