import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SearchStudentsInAssessmentResponse } from 'gpa-backend/src/assessment/dto/assessment.response'
import { Assessment, AssessmentStudent, User } from 'gpa-backend/src/drizzle/schema'
import { Plus, SearchIcon, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActionCard from '../../../common/ActionCard'
import AlertDialog from '../../../common/AlertDialog'
import ConfirmDeleteDialog from '../../../common/ConfirmDeleteDialog'
import AddStudentDialog from '../../dialog/AddStudentDialog'
import EmptyState from '../../../common/EmptyState'
import { PaginationControlled } from '../../../common/PaginationControlled'
import SuspenseArea from '../../../common/SuspenseArea'
import toast from '../../../common/toast'

const StudentsTab = ({ assessmentId, canEdit }: { assessmentId: Assessment['assessmentId']; canEdit: boolean }) => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [clickedStudentId, setClickedStudentId] = useState<User['userId'] | null>(null)
  const [oldData, setOldData] = useState<SearchStudentsInAssessmentResponse>([])
  const pageSize = 4

  const {
    data: res,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['searchStudentsInAssessment', assessmentId, page],
    queryFn: async () => {
      return await api.assessment.searchStudentsInAssessment({
        assessmentId,
        keyword,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      })
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
    queryClient.invalidateQueries({ queryKey: ['searchStudentsInAssessment', assessmentId, 1] })
    setPage(1)
  }

  const mutation = useMutation({
    mutationFn: api.assessment.confirmStudentJoinAssessment,
    onSuccess: (_, req) => {
      if (req.isConfirmed) {
        const newData = oldData.map((item) =>
          item.userId === req.studentUserId ? { ...item, isConfirmed: true } : item
        )
        queryClient.setQueryData(['searchStudentsInAssessment', assessmentId, page], { data: newData, total })
      } else {
        const newData = oldData.filter((item) => item.userId !== req.studentUserId)
        if (oldData.length === 1 && page > 1) {
          setPage(page - 1)
        } else {
          console.log({ data: newData, total: total - 1 })
          queryClient.setQueryData(['searchStudentsInAssessment', assessmentId, page], {
            data: newData,
            total: total - 1,
          })
        }
      }

      toast.success(`${req.isConfirmed ? 'Accept' : 'Reject'} student joined request successfully.`)
      setClickedStudentId(null)
    },
    onError: (_, req) => {
      toast.error(`Failed to ${req.isConfirmed ? 'accept' : 'reject'} student joined request.`)
    },
  })

  const onClickAcceptReject = async (studentUserId: User['userId'], isConfirmed: AssessmentStudent['isConfirmed']) => {
    setClickedStudentId(studentUserId)
    setOldData(data)
    mutation.mutate({ assessmentId, studentUserId, isConfirmed })
  }

  return (
    <>
      <div className="flex flex-col justify-between mb-6">
        <div className="flex justify-between">
          <div className="text-2xl font-semibold">Students</div>
          <AddStudentDialog
            assessmentId={assessmentId}
            triggerButton={
              <Button>
                <Plus />
                Add
              </Button>
            }
          />
        </div>
        <div className="flex flex-col gap-4 mt-6 p-4 bg-primary-foreground rounded-xl border-2">
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-muted-foreground">Search by student name</Label>
            <div className="flex gap-2 items-center">
              <Input
                className="bg-border/80 text-sm"
                placeholder="Enter student name..."
                onChange={onKeywordChange}
              />
              <Button
                onClick={onSearch}
                loading={isFetching}
              >
                {!isFetching && <SearchIcon />}
                <span className="hidden sm:block">Search</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        <div className="flex flex-col flex-grow gap-4 ">
          <SuspenseArea loading={isLoading}>
            {data?.length == 0 ? (
              <EmptyState
                title="No Student Yet"
                description1="It looks like there is no student joined the assessment yet."
                icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
              />
            ) : (
              data?.map((student, index) => {
                const actionButtons = []
                if (student.group?.groupId && !canEdit) {
                  actionButtons.push(
                    <AlertDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                        >
                          <Trash2 className="sm:hidden" />
                          <span className="hidden sm:block">Remove</span>
                        </Button>
                      }
                      title="Cannot remove student"
                      content="Can't remove this student from assessment. Student who already joined group when peer rating started can't be deleted."
                      confirmButtonText="Okay"
                      showCancelButton={false}
                    />
                  )
                } else if (student.isConfirmed) {
                  actionButtons.push(
                    <ConfirmDeleteDialog
                      triggerButton={
                        <Button
                          size="sm"
                          variant="destructiveOutline"
                          disabled={isFetching}
                        >
                          <Trash2 className="sm:hidden" />
                          <span className="hidden sm:block">Remove</span>
                        </Button>
                      }
                      data={{ assessmentId, studentUserId: student.userId }}
                      api={api.assessment.removeStudentFromAssessment}
                      title="Confirm Delete"
                      onSuccessMessage="Student removed successfully."
                      onErrorMessage="Failed to remove student."
                      refetchKeys={['searchStudentsInAssessment', assessmentId, 1]}
                    />
                  )
                } else {
                  actionButtons.push(
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onClickAcceptReject(student.userId, true)}
                      loading={clickedStudentId === student.userId && mutation.isPending}
                      disabled={isFetching}
                    >
                      <Trash2 className="sm:hidden" />
                      <span className="hidden sm:block">Accept</span>
                    </Button>
                  )
                  actionButtons.push(
                    <Button
                      size="sm"
                      variant="destructiveOutline"
                      onClick={() => onClickAcceptReject(student.userId, false)}
                      loading={clickedStudentId === student.userId && mutation.isPending}
                      disabled={isFetching}
                    >
                      <Trash2 className="sm:hidden" />
                      <span className="hidden sm:block">Reject</span>
                    </Button>
                  )
                }

                return (
                  <ActionCard
                    key={index}
                    title={student.name}
                    description={student.email}
                    actions={actionButtons}
                  />
                )
              })
            )}
          </SuspenseArea>
        </div>
        <PaginationControlled
          page={page}
          pageSize={pageSize}
          totalCount={total}
          onPageChange={setPage}
        />
      </div>
    </>
  )
}

export default StudentsTab
