import { api } from '@/api'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ConfirmDeleteDialog from '@/components/common/ConfirmDeleteDialog'
import CopyButton from '@/components/common/CopyButton'
import AssessmentDialog from '@/components/common/dialog/AssessmentDialog'
import SuspenseArea from '@/components/common/SuspenseArea'
import GroupsTab from '@/components/common/tab/assessment/GroupsTab'
import ModelTab from '@/components/common/tab/assessment/ModelTab'
import ScoringComponentsTab from '@/components/common/tab/assessment/ScoringComponentsTab'
import StudentsTab from '@/components/common/tab/assessment/StudentsTab'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsScrollBar, TabsTrigger } from '@/components/ui/tabs'
import { appPaths, Roles } from '@/config/app'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { AssessmentWithInstructor } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { Pencil, Trash2, Upload, Users } from 'lucide-react'
import { useEffect } from 'react'
import { z } from 'zod'

export const Route = createFileRoute('/instructor/assessment/$assessmentId/')({
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
  validateSearch: z.object({
    tab: z.coerce.string().optional(),
  }),
})

export const AssessmentTabs = {
  Students: 'students',
  Groups: 'groups',
  Model: 'model',
  ScoringComponents: 'scoring-components',
}

function RouteComponent() {
  const params = Route.useParams()
  const search = Route.useSearch()
  const router = useRouter()
  const assessmentId = parseInt(params.assessmentId)

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getAssessmentById', assessmentId],
    queryFn: async () => await api.assessment.getAssessmentById({ assessmentId }),
  })

  const data = res?.data ?? null

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  const onClickTab = (tab: (typeof AssessmentTabs)[keyof typeof AssessmentTabs]) => {
    router.history.push(`/instructor/assessment/${assessmentId}?tab=${tab}`)
  }

  return (
    <DashboardLayout className="gap-4">
      <SuspenseArea loading={isLoading}>
        {data && (
          <div className="flex flex-col gap-8 flex-grow">
            <div className="flex flex-col gap-6">
              <Breadcrumbs
                items={[
                  { label: 'Peer Assessments', href: `/instructor/assessment` },
                  {
                    label: 'Assessment',
                    href: `/instructor/assessment/${assessmentId}`,
                    isCurrentPage: true,
                  },
                ]}
              />
              <AssessmentCard data={data} />
            </div>
            <Tabs
              defaultValue={AssessmentTabs.Students}
              value={search.tab}
              className="flex flex-col flex-grow"
            >
              <ScrollArea>
                <div className="w-full relative">
                  <TabsList>
                    <TabsTrigger
                      value={AssessmentTabs.Students}
                      onClick={() => onClickTab(AssessmentTabs.Students)}
                    >
                      Students
                    </TabsTrigger>
                    <TabsTrigger
                      value={AssessmentTabs.Groups}
                      onClick={() => onClickTab(AssessmentTabs.Groups)}
                    >
                      Groups
                    </TabsTrigger>
                    <TabsTrigger
                      value={AssessmentTabs.Model}
                      onClick={() => onClickTab(AssessmentTabs.Model)}
                    >
                      Model
                    </TabsTrigger>
                    <TabsTrigger
                      value={AssessmentTabs.ScoringComponents}
                      onClick={() => onClickTab(AssessmentTabs.ScoringComponents)}
                    >
                      Scoring Components
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsScrollBar />
              </ScrollArea>
              <TabsContent
                value={AssessmentTabs.Students}
                className="flex flex-col flex-grow"
              >
                <StudentsTab
                  assessmentId={assessmentId}
                  canEdit={data.canEdit}
                />
              </TabsContent>
              <TabsContent
                value={AssessmentTabs.Groups}
                className="flex flex-col flex-grow"
              >
                <GroupsTab assessmentId={assessmentId} />
              </TabsContent>
              <TabsContent
                value={AssessmentTabs.Model}
                className="flex flex-col flex-grow"
              >
                <ModelTab
                  assessmentId={assessmentId}
                  data={data}
                  isLoading={isLoading}
                />
              </TabsContent>
              <TabsContent
                value={AssessmentTabs.ScoringComponents}
                className="flex flex-col flex-grow"
              >
                <ScoringComponentsTab assessmentId={assessmentId} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SuspenseArea>
    </DashboardLayout>
  )
}

const AssessmentCard = ({ data }: { data: AssessmentWithInstructor }) => {
  const mutation = useMutation({
    mutationFn: api.assessment.exportAssessmentScores,
    onSuccess: (res) => {
      const filename = 'export-scores.xlsx'
      const url = window.URL.createObjectURL(new Blob([res]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const exportStudentScores = async () => {
    mutation.mutate({ assessmentId: data.assessmentId })
  }

  return (
    <Card className="w-full">
      <CardContent className="flex-col">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg md:text-2xl md:mb-1">{data.assessmentName}</CardTitle>
            <div className="hidden md:flex gap-2 items-center">
              <Users
                size={16}
                className="block text-muted-foreground"
              />
              <CardDescription className="text-sm">{data.instructor.name}</CardDescription>
            </div>
          </div>
          <Badge
            size="lg"
            variant={data.isPublished ? 'success' : 'destructive'}
            className="h-fit mt-1"
            asChild
          >
            <div>{data.isPublished ? 'Published' : 'Private'}</div>
          </Badge>
        </div>
        <div className="flex justify-between my-4 md:mb-0">
          <div className="flex flex-col gap-y-2">
            <div className="flex gap-2">
              <div className="text-muted-foreground text-sm">Assessment Code:</div>
              <Badge
                variant="secondary"
                className="rounded-sm h-fit"
                asChild
              >
                <div>{data.assessmentCode}</div>
              </Badge>
              <Badge
                variant="secondary"
                className="rounded-sm cursor-pointer h-fit p-1"
              >
                <CopyButton value={data.assessmentCode} />
              </Badge>
            </div>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button
              variant="secondary"
              onClick={exportStudentScores}
              loading={mutation.isPending}
            >
              {!mutation.isPending && <Upload />}
              Export
            </Button>
            <AssessmentDialog
              data={data}
              triggerButton={
                <Button
                  variant="outline"
                  className="w-22"
                >
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <DeleteAssessmentDialog
              triggerButton={
                <Button variant="destructiveOutline">
                  <Trash2 />
                  Delete
                </Button>
              }
              assessmentId={data.assessmentId}
            />
          </div>
        </div>
        <Separator className="md:hidden" />
        <div className="mt-4 flex gap-2 justify-end md:hidden">
          <Button
            variant="secondary"
            onClick={exportStudentScores}
            loading={mutation.isPending}
          >
            {!mutation.isPending && <Upload />}
            Export
          </Button>
          <AssessmentDialog
            data={data}
            triggerButton={
              <Button
                variant="outline"
                className="w-22"
              >
                <Pencil />
                Edit
              </Button>
            }
          />
          <DeleteAssessmentDialog
            triggerButton={
              <Button variant="destructiveOutline">
                <Trash2 />
                Delete
              </Button>
            }
            assessmentId={data.assessmentId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const DeleteAssessmentDialog = ({
  triggerButton,
  assessmentId,
}: {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
}) => {
  return (
    <ConfirmDeleteDialog
      triggerButton={triggerButton}
      data={{ assessmentId }}
      api={api.assessment.deleteAssessment}
      title="Delete assessment"
      onSuccessMessage="Assessment deleted successfully."
      onErrorMessage="Failed to delete classroom."
      refetchKeys={['getAssessmentsByInstructor']}
      redirectTo={appPaths.instructor.assessment}
      content={
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="mt-1 text-sm">
            Deleting this assessment will also remove all associated information, including:
          </div>

          <div className="rounded-xl border border-gray-200 bg-muted p-5">
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Model configuration</li>
              <li>Scoring components</li>
              <li>Groups</li>
              <li>Group scores</li>
              <li>Student scores</li>
              <li>Student's peer rating</li>
            </ul>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            This action cannot be undone. Please make sure you've backed up any important data before continuing.
          </div>
        </div>
      }
    />
  )
}
