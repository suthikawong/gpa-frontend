import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActionCard from '../../ActionCard'
import ConfirmDeleteDialog from '../../ConfirmDeleteDialog'
import EmptyState from '../../EmptyState'
import { PaginationControlled } from '../../PaginationControlled'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const StudentsTab = ({ classroomId }: { classroomId: Classroom['classroomId'] }) => {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 4

  const {
    data: res,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['searchStudentsInClassroom', classroomId, page],
    queryFn: async () => {
      return await api.classroom.searchStudentsInClassroom({
        classroomId,
        name: keyword,
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
    queryClient.invalidateQueries({ queryKey: ['searchStudentsInClassroom', classroomId, 1] })
    setPage(1)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="text-2xl font-semibold">Students</div>
        <div className="flex flex-col md:flex-row gap-4 mt-6 p-4 bg-primary-foreground rounded-xl md:bg-transparent md:p-0 md:mt-0">
          <Label className="md:hidden">Search:</Label>
          <div className="flex gap-4">
            <Input
              className="bg-border"
              placeholder="Search student name"
              onChange={onKeywordChange}
            />
            <Button
              onClick={onSearch}
              loading={isFetching}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-grow">
        <div className="flex flex-col flex-grow gap-4 ">
          <SuspenseArea loading={isLoading}>
            {data.length == 0 ? (
              <EmptyState
                title="No Classrooms Yet"
                description1="It looks like you haven't created any classrooms."
                icon={<NoDocuments className="w-[200px] h-[160px] md:w-[350px] md:h-[280px]" />}
                action={<Button>Create Assignment</Button>}
              />
            ) : (
              data.map((student, index) => {
                return (
                  <ActionCard
                    key={index}
                    header={student.name}
                    actions={[
                      <ConfirmDeleteDialog
                        triggerButton={
                          <Button
                            size="sm"
                            variant="destructiveOutline"
                          >
                            <Trash2 className="sm:hidden" />
                            <span className="hidden sm:block">Remove</span>
                          </Button>
                        }
                        data={{ classroomId, studentUserId: student.userId }}
                        api={api.classroom.removeStudentFromClassroom}
                        title="Confirm Delete"
                        onSuccessMessage="Student removed successfully."
                        onErrorMessage="Failed to remove student."
                        refetchKeys={['searchStudentsInClassroom']}
                      />,
                    ]}
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
