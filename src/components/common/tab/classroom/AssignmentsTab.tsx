import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'
import ActionCard from '../../ActionCard'
import EmptyState from '../../EmptyState'
import SuspenseArea from '../../SuspenseArea'
import toast from '../../toast'

const AssignmentsTab = ({ classroomId }: { classroomId: Classroom['classroomId'] }) => {
  const {
    data: res,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['getAssignmentByClassroomId', classroomId],
    queryFn: async () => await api.classroom.getAssignmentByClassroomId({ classroomId }),
  })

  const data = res?.data ?? []

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }, [error])

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="text-2xl font-semibold">Assignments</div>
        <Button>
          <Plus />
          Create
        </Button>
      </div>
      <div className="flex flex-col gap-4 flex-grow">
        <SuspenseArea loading={isLoading}>
          {data.length == 0 ? (
            <EmptyState
              title="No Classrooms Yet"
              description1="It looks like you haven't created any classrooms."
              icon={<NoDocuments className="w-[200px] h-[160px] md:w-[350px] md:h-[280px]" />}
              action={<Button>Create Assignment</Button>}
            />
          ) : (
            data.map((assignment, index) => {
              return (
                <ActionCard
                  key={index}
                  header={assignment.assignmentName}
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
    </div>
  )
}

export default AssignmentsTab
