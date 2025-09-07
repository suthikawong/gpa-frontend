import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Roles } from '@/config/app'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/instructor/tutorial')({
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

const qassTerminologies = [
  {
    term: 'QASS (Quasi-Arithmetic Scoring System)',
    definition:
      'A family of educational scoring systems for assessment and evaluation of student performance. Members are called variants or modes.',
  },
  {
    term: 'Mode',
    definition: 'A variant of QASS for peer assessment, defined by the rating question given to students.',
  },
  {
    term: 'Bijunction',
    definition: `Bijunction mode refers to rating peers relative to one's own performance/competence. Student scores can be either higher or lower than the group score.`,
  },
  {
    term: 'Conjunction',
    definition: `Conjunction mode refers to rating peers relative to the best performance possible. A student's score will always be less than or equal to the group score.`,
  },
  {
    term: 'Disjunction',
    definition: `Disjunction mode refers to rating peers relative to the worst performance possible. A student's score will always be greater than or equal to the group score.`,
  },
  {
    term: 'Polishing Factor',
    definition: 'Technical parameter that excludes extreme scale values. For expert mode only.',
  },
  {
    term: 'Peer Rating Impact (Polarisation Factor)',
    definition:
      'A parameter used to adjust the influence of student ratings, which affects the calculation of the final score. A high factor pushes scores toward the upper bound, while a low factor pushes them toward the lower bound. It cannot alter the scale bounds.',
  },
  {
    term: 'Group Spread',
    definition: `The measure of how far apart students' scores are within a group. A small spread means students' scores are close to the group score, while a large spread means individual student scores may differ more from the group score.`,
  },
  {
    term: 'Group Score',
    definition: `The group location on the percentage scale represents product quality.`,
  },
  {
    term: 'Percentage Scale',
    definition:
      'A scale used to represent scores in two forms: (a) a discrete scale consisting of integers from 0 to 100 (101 points in total), and (b) a continuous scale consisting of all real numbers between 0 and 1.',
  },
  {
    term: 'N-Point Scale',
    definition: 'A discrete scale with exactly N integers between a lower and upper bound.',
  },
  {
    term: 'Lower Bound',
    definition: 'The lowest number that defines a bounded scale.',
  },
  {
    term: 'Upper Bound',
    definition: 'The highest number that defines a bounded scale.',
  },
  {
    term: 'Student Weight',
    definition: `An integer representing a student's relative importance. A higher value gives more weight to that student's rating. The system converts this value into a decimal between 0 and 1, and all student weights must sum to 1.`,
  },
  {
    term: 'Scoring Component',
    definition: `An independent instance of peer assessment producing a student contribution. In WebAVALIA, called a "moment".`,
  },
  {
    term: 'Scoring Component Weight',
    definition:
      'An integer that represents the importance of a student contribution in a given component. A higher value gives more weight to the ratings in that component. The system converts this value into a decimal between 0 and 1, and all scoring component weights must sum to 1.',
  },
  {
    term: 'Peer Ratings',
    definition: 'The ratings given by students to their peers.',
  },
  {
    term: 'Student Ratings',
    definition: 'The ratings calculated from the peer ratings for that student.',
  },
  {
    term: 'Group Rating',
    definition: 'The ratings calculated from all students of a given group.',
  },
  {
    term: 'Peer Matrix (Peer Rating Matrix)',
    definition: 'An n × n matrix containing peer ratings (including self-ratings).',
  },
]

const webavaliaTerminologies = [
  {
    term: 'WebAVALIA',
    definition: `A peer assessment tool developed at the University of Porto (Portugal) by Prof. Babo. A student's score will always be less than or equal to the Group Grade.`,
  },
  {
    term: 'Moment',
    definition: `An independent instance of peer assessment producing a student contribution. Equivalent to a scoring component.`,
  },
  {
    term: 'Self Assessment Weight',
    definition: `Fixed weight for self-votes.`,
  },
  {
    term: 'Peer Assessment Weight',
    definition: `Equal weights given to peer votes for a student.`,
  },
  {
    term: 'Group Grade',
    definition: `Model parameter given by the teacher for each component, based on quality criteria. Uses the 21-point Portuguese grading scale.`,
  },
  {
    term: 'Voting',
    definition: `Process of collecting peer votes. Each student distributes 100 votes (in chunks of 5) across peers and self.`,
  },
  {
    term: 'Peer Matrix',
    definition: `An n × n matrix containing peer ratings (including self-ratings), constrained by the voting rules that require each student to allocate exactly 100 votes.`,
  },
]

function RouteComponent() {
  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">Tutorial</div>
      </div>
      <div className="space-y-8">
        <QassTerminologiesCard />
        <WebavaliaTerminologiesCard />
      </div>
    </DashboardLayout>
  )
}

const QassTerminologiesCard = () => {
  return (
    <section id="qass">
      <Card className="flex gap-4 w-full shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-xl flex gap-2 items-center">QASS Terminologies</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-primary/90 hover:bg-primary/90">
                <TableHead className="sm:min-w-[200px] text-primary-foreground">Term</TableHead>
                <TableHead className="text-primary-foreground">Definition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qassTerminologies.map((item) => (
                <TableRow
                  key={item.term}
                  className="even:bg-secondary/50 border-0"
                >
                  <TableCell className="font-medium whitespace-normal break-words">{item.term}</TableCell>
                  <TableCell className="whitespace-normal break-words">{item.definition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

const WebavaliaTerminologiesCard = () => {
  return (
    <section id="webavalia">
      <Card className="flex gap-4 w-full shadow-none border-0">
        <CardHeader>
          <CardTitle className="text-xl flex gap-2 items-center">WebAVALIA Terminologies</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-primary/90 hover:bg-primary/90">
                <TableHead className="sm:min-w-[200px] text-primary-foreground">Term</TableHead>
                <TableHead className="text-primary-foreground">Definition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webavaliaTerminologies.map((item) => (
                <TableRow
                  key={item.term}
                  className="even:bg-secondary/50 border-0"
                >
                  <TableCell className="font-medium whitespace-normal break-words">{item.term}</TableCell>
                  <TableCell className="whitespace-normal break-words">{item.definition}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}
