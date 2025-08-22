import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { model } from '@/config/app'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Assessment, Group } from 'gpa-backend/src/drizzle/schema'
import { StudentScoreItem } from 'gpa-backend/src/group/dto/group.response'
import { Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts'
import EditScoreDialog from '../../dialog/EditScoreDialog'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const ScoresTab = ({
  assessmentId,
  groupId,
}: {
  assessmentId: Assessment['assessmentId']
  groupId: Group['groupId']
}) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getScores', groupId],
    queryFn: async () => await api.group.getScores({ groupId }),
  })

  const data = res?.data

  const {
    data: assessmentRes,
    isLoading: isLoadingAssessment,
    error: errorAssessment,
  } = useQuery({
    queryKey: ['getAssessmentById', assessmentId],
    queryFn: async () => await api.assessment.getAssessmentById({ assessmentId }),
  })

  const assessmentData = assessmentRes?.data ?? null
  const isWebAvalia = assessmentData?.modelId === model.WebAVALIA

  useEffect(() => {
    if (error || errorAssessment) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error, errorAssessment])

  const groupScore =
    typeof data?.groupScore?.score === 'number'
      ? isWebAvalia
        ? data.groupScore.score
        : data.groupScore.score * 100
      : undefined

  const chartData = [{ groupScore: groupScore ?? '-', fill: 'var(--chart-2)' }]
  const chartConfig = {
    groupScore: {
      label: 'Group Score',
    },
  }

  const degree = isWebAvalia ? ((data?.groupScore?.score ?? 0) / 20) * 360 : (data?.groupScore?.score ?? 0) * 360
  const offset = (360 - degree) / 2

  const groupScoreUpdatedDate = data?.groupScore?.updatedDate || data?.groupScore?.createdDate

  return (
    <SuspenseArea loading={isLoading || isLoadingAssessment}>
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
              <CardTitle className="text-xl text-center sm:text-left">
                {isWebAvalia ? 'Group grade' : 'Group score'}
              </CardTitle>
              <CardDescription>{`Last update: ${groupScoreUpdatedDate ? format(groupScoreUpdatedDate, 'PPP') : '-'}`}</CardDescription>
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
                  outerRadius={96}
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
                                {groupScore ? (isWebAvalia ? groupScore : `${groupScore.toFixed(0)}%`) : '-'}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                {isWebAvalia ? 'Group grade' : 'Group score'}
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
              <StudentTable
                studentScores={data?.studentScores ?? []}
                isWebAvalia={isWebAvalia}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SuspenseArea>
  )
}

export default ScoresTab

const StudentTable = ({
  studentScores,
  isWebAvalia,
}: {
  studentScores: Array<StudentScoreItem>
  isWebAvalia: boolean
}) => {
  return (
    <Table className="flex-grow">
      {studentScores.length === 0 && (
        <TableCaption className="text-foreground font-semibold">No student found</TableCaption>
      )}
      <TableCaption>A list of student scores in this group.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {studentScores.map((item) => {
          let score = '-'
          if (typeof item?.studentScore?.score === 'number') {
            if (isWebAvalia) {
              score = item.studentScore.score.toString()
            } else {
              score = (item.studentScore.score * 100).toFixed(2) + '%'
            }
          }
          return (
            <TableRow key={item.userId}>
              <TableCell>{item?.name ?? '-'}</TableCell>
              <TableCell className="text-right">{score}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
