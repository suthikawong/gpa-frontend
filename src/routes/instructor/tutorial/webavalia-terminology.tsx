import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Roles } from '@/config/app'
import { webavaliaTerminology } from '@/config/tutorial'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/instructor/tutorial/webavalia-terminology')({
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

function RouteComponent() {
  const router = useRouter()
  return (
    <DashboardLayout className="gap-4">
      <Button
        className="w-fit"
        onClick={() => router.history.push('/instructor/tutorial')}
      >
        <ChevronLeft />
        Back
      </Button>
      <div className="space-y-8">
        <Card className="flex gap-4 w-full shadow-none border-0 py-6 px-2 md:py-8 md:px-4">
          <CardHeader>
            <CardTitle className="text-3xl flex gap-2 items-center m-auto mb-8">WebAVALIA Terminologies</CardTitle>
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
                {webavaliaTerminology.map((item) => (
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
      </div>
    </DashboardLayout>
  )
}
