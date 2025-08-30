import { api } from '@/api'
import JoinAssessmentDialog from '@/components/pages/dialog/JoinAssessmentDialog'
import EmptyState from '@/components/common/EmptyState'
import SuspenseArea from '@/components/common/SuspenseArea'
import toast from '@/components/common/toast'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Roles } from '@/config/app'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { Assessment } from 'gpa-backend/src/drizzle/schema'
import { Plus, SearchIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import study from '@/assets/study.png'
import { Input } from '@/components/ui/input'
import { PaginationControlled } from '@/components/common/PaginationControlled'

export const Route = createFileRoute('/student/assessment/')({
  component: RouteComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.user?.userId) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: location.href,
        },
      })
    } else if (context.user?.roleId === Roles.Instructor) {
      throw redirect({
        to: '/instructor/assessment',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [isSearch, setIsSearch] = useState(false)
  const pageSize = 10

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['searchAssessmentsByStudent', page],
    queryFn: async () => {
      const res = await api.assessment.searchAssessmentsByStudent({
        keyword,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
      setIsSearch(false)
      return res
    },
  })

  const data = res?.data ?? []
  const total = res?.total ?? 0

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value === '' ? undefined : e.target.value)
  }

  const onSearch = () => {
    setIsSearch(true)
    queryClient.invalidateQueries({ queryKey: ['searchAssessmentsByStudent', 1] })
    setPage(1)
  }

  const isLoadingDisplay = isLoading || isSearch

  return (
    <DashboardLayout className="gap-4">
      <div className="flex justify-between items-center md:mb-4">
        <div className="text-xl font-bold md:text-3xl">My Assessments</div>
        <JoinAssessmentDialog
          triggerButton={
            <Button size="lg">
              <Plus />
              Join
            </Button>
          }
        />
      </div>
      <div className="flex rounded-xl mb-16 h-[40px] sm:h-[220px] md:h-[300px] w-full sm:px-4 bg-transparent sm:bg-gradient-to-r from-indigo-500 to-purple-500">
        <div className="relative w-full flex-grow">
          <div className="hidden sm:flex items-center justify-between">
            <img
              src={study}
              alt="study image"
              className="size-[200px] md:size-[280px]"
            />
            <div className="text-white text-center sm:text-right font-semibold text-lg md:text-2xl mt-6 mx-4 -translate-y-[16px] max-w-[600px]">
              Join in peer assessment to ensure fair recognition of everyone's contribution.
            </div>
          </div>
          <div className="flex flex-col gap-4 bg-white py-2 px-4 rounded-xl absolute w-full translate-y-[50%] bottom-0">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center flex-grow">
                  <div className="font-semibold border-r-1 pl-2 pr-4 h-full! hidden sm:block">Assessment</div>
                  <Input
                    className="text-sm bg-white py-6 px-4 border-0! ring-0!"
                    placeholder="Search by assessment name"
                    onChange={onKeywordChange}
                  />
                </div>
                <Button
                  onClick={onSearch}
                  loading={isLoadingDisplay}
                  className="rounded-4xl sm:h-[40px] sm:w-[110px]"
                >
                  {!isLoadingDisplay && <SearchIcon />}
                  <span className="hidden sm:block">Search</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuspenseArea loading={isLoading}>
        {data.length == 0 ? (
          <EmptyState
            title="No Joined Assessment"
            description1="It looks like you haven't joined any assessments."
            icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
          />
        ) : (
          <div className="space-y-4 flex-grow">
            <div className="font-semibold text-lg mb-6">
              We've found <span className="text-primary">{total}</span> assessments!
            </div>
            {data.map((assessment, index) => {
              return (
                <AssessmentCard
                  key={index}
                  data={assessment}
                />
              )
            })}
          </div>
        )}
      </SuspenseArea>
      <PaginationControlled
        page={page}
        pageSize={pageSize}
        totalCount={total}
        onPageChange={setPage}
      />
    </DashboardLayout>
  )
}

const AssessmentCard = ({ data }: { data: Omit<Assessment, 'modelId' | 'modelConfig'> }) => {
  const router = useRouter()

  const onClickAssessment = (assessmentId: Assessment['assessmentId']) => {
    router.history.push(`/student/assessment/${assessmentId}`)
  }

  return (
    <Card className="w-full sm:py-4!">
      <CardContent className="flex-col sm:px-4!">
        <div className="flex justify-between items-center sm:mb-0">
          <CardTitle className="text-lg">{data.assessmentName}</CardTitle>
          <Button
            className="hidden sm:block"
            onClick={() => onClickAssessment(data.assessmentId)}
          >
            View Details
          </Button>
        </div>
        <Button
          className="w-full mt-4 sm:hidden"
          onClick={() => onClickAssessment(data.assessmentId)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
