import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GetAssessmentByIdResponse } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { SettingsIcon, TrendingUp } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'
import { useEffect } from 'react'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'

const formSchema = z.object({
  groupScore: z
    .string()
    .min(1, { message: 'Please enter a group score.' })
    .refine((val) => /^[0-9]*\.?[0-9]+$/.test(val), {
      message: 'Weight must be a number.',
    })
    .refine((val) => Number(val) > 0, {
      message: 'Weight must be greater than zero.',
    }),
})

const ScoresTab = ({ groupId }: { groupId: Group['groupId'] }) => {
  const queryClient = useQueryClient()

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getScores', groupId],
    queryFn: async () => await api.group.getScores({ groupId }),
  })

  const data = res?.data

  const defaultValues = {
    groupScore: data?.groupScore?.toString() ?? '',
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  const updateMutation = useMutation({
    mutationFn: api.group.upsertScore,
    onSuccess: () => {
      toast.success('Scoring component updated successfully')
      queryClient.invalidateQueries({ queryKey: ['upsertScore', groupId] })
    },
    onError: () => {
      toast.error('Failed to update scoring component.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('TLOG ~ values:', values)
    // updateMutation.mutate(payload)
  }

  const chartData = [{ browser: 'safari', visitors: 200, fill: 'var(--color-safari)' }]
  const chartConfig = {
    visitors: {
      label: 'Visitors',
    },
    safari: {
      label: 'Safari',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Text</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={240} // 270
            endAngle={-60} // -90
            innerRadius={80}
            outerRadius={96}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-white"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="visitors"
              background
              cornerRadius={10}
            />
            <PolarRadiusAxis
              tick={false}
              tickLine={false}
              axisLine={false}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
      </CardFooter>
    </Card>
    // <SuspenseArea loading={isLoading}>
    //   <div className="flex flex-row h-full">
    //     <Card className="flex-grow flex gap-4 max-w-[50%]">
    //       <CardHeader>
    //         <CardTitle className="text-xl flex gap-2 items-center">
    //           {/* <SettingsIcon className="w-6 h-6 text-primary" /> */}
    //           Group Score
    //         </CardTitle>
    //       </CardHeader>
    //       <CardContent className="h-full">
    //         <Form {...form}>
    //           <form
    //             onSubmit={form.handleSubmit(onSubmit)}
    //             className="space-y-4 h-full flex flex-col"
    //           >
    //             <div className="flex-grow">
    //               <div className="grid w-full items-center gap-4">
    //                 <FormField
    //                   control={form.control}
    //                   name="groupScore"
    //                   render={({ field }) => (
    //                     <FormItem>
    //                       <FormLabel>Weight</FormLabel>
    //                       <FormControl>
    //                         <Input
    //                           {...field}
    //                           placeholder="Enter scoring component groupScore"
    //                         />
    //                       </FormControl>
    //                       <FormMessage />
    //                     </FormItem>
    //                   )}
    //                 />
    //               </div>
    //             </div>
    //             <Button
    //               type="submit"
    //               loading={updateMutation.isPending}
    //               // className="ml-auto"
    //             >
    //               Save
    //             </Button>
    //           </form>
    //         </Form>
    //       </CardContent>
    //     </Card>
    //     <div className="flex-grow max-w-[50%] p-4">Questionnaire & Model detail</div>
    //   </div>
    // </SuspenseArea>
  )
}

export default ScoresTab
