import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { Group } from 'gpa-backend/src/drizzle/schema'
import { StudentScoreItem } from 'gpa-backend/src/group/dto/group.response'
import { Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'
import EditScoreDialog from '../../dialog/EditScoreDialog'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const ScoresTab = ({ groupId }: { groupId: Group['groupId'] }) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getScores', groupId],
    queryFn: async () => await api.group.getScores({ groupId }),
  })

  const data = res?.data

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  const chartData = [{ groupScore: data?.groupScore?.score ?? '-', fill: 'var(--chart-2)' }]
  const chartConfig = {
    groupScore: {
      label: 'Group Score',
    },
  }

  const degree = ((data?.groupScore?.score ?? 0) / 100) * 360
  const offset = (360 - degree) / 2

  return (
    <SuspenseArea loading={isLoading}>
      <div className="flex flex-col flex-grow gap-4">
        <EditScoreDialog
          groupId={groupId}
          data={data}
          triggerButton={
            <Button>
              <Pencil />
              Edit Scores
            </Button>
          }
        />
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 h-fit md:w-fit">
            <CardContent className="gap-0 px-4! sm:pl-8! md:pl-6! sm:pr-0!">
              <CardTitle className="text-xl">Group score</CardTitle>
              <CardDescription>January - June 2024</CardDescription>
            </CardContent>
            <CardContent className="pl-4! sm:pr-8! md:pr-6! sm:pl-0!">
              <ChartContainer
                config={chartConfig}
                className="w-[150px] h-[150px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={270 - offset} // max 270
                  endAngle={-90 + offset} // max -90
                  innerRadius={64}
                  outerRadius={80}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-white"
                    polarRadius={[69, 57]}
                  />
                  <RadialBar
                    dataKey="groupScore"
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
                                className="fill-foreground text-3xl font-bold"
                              >
                                {chartData[0].groupScore}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Group Score
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
          </Card>

          <Card className="gap-2 flex-grow">
            <CardHeader>
              <CardTitle className="text-2xl">Student scores</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentTable studentScores={data?.studentScores ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </SuspenseArea>
  )
}

export default ScoresTab

const StudentTable = ({ studentScores }: { studentScores: Array<StudentScoreItem> }) => {
  return (
    <Table className="flex-grow">
      <TableCaption>A list of student scores in this group.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {studentScores.map((item) => (
          <TableRow key={item.userId}>
            <TableCell>{item?.name ?? '-'}</TableCell>
            <TableCell className="text-right">{item?.studentScore?.score ?? '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
