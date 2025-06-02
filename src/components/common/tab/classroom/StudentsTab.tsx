import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import ActionCard from '../../ActionCard'
import EmptyState from '../../EmptyState'
import { PaginationControlled } from '../../PaginationControlled'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const StudentsTab = ({ classroomId }: { classroomId: Classroom['classroomId'] }) => {
  const [page, setPage] = useState(1)
  const pageSize = 4

  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['searchStudentsInClassroom', classroomId, page],
    queryFn: async () => {
      return await api.classroom.searchStudentsInClassroom({
        classroomId,
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

  return (
    <>
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Students</div>
        <Button>
          <Plus />
          Create
        </Button>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log('view')}
                      >
                        View <span className="hidden md:block">Details</span>
                      </Button>,
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
