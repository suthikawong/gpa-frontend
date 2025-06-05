import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Classroom } from 'gpa-backend/src/drizzle/schema'
import { GetGroupMembersResponse } from 'gpa-backend/src/group/dto/group.response'
import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActionCard from '../ActionCard'
import EmptyState from '../EmptyState'
import { PaginationControlled } from '../PaginationControlled'
import SuspenseArea from '../SuspenseArea'
import toast from '../toast'

interface AddMemberDialogProps {
  triggerButton: React.ReactNode
  classroomId: Classroom['classroomId']
  members: GetGroupMembersResponse
}

const AddMemberDialog = ({ triggerButton, classroomId, members }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const memberUserIds = members.map((member) => member.userId)

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
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Add members</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <Input
            className="bg-border"
            placeholder="Search student name"
            onChange={onKeywordChange}
            value={keyword}
          />
          <Button
            onClick={onSearch}
            loading={isFetching}
          >
            Search
          </Button>
        </div>

        <div className="flex flex-col gap-4 flex-grow">
          <Label className="text-xl">Students</Label>
          <div className="flex flex-col flex-grow gap-4 ">
            <SuspenseArea loading={isLoading}>
              {data.length == 0 ? (
                <EmptyState
                  title="No Member Yet"
                  description1="It looks like you haven't added any members."
                  icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
                />
              ) : (
                data.map((student, index) => {
                  const isMember = memberUserIds.includes(student.userId)
                  const actions = []
                  if (isMember) {
                    actions.push(
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={true}
                      >
                        <Check />
                        <span className="hidden sm:block">Added</span>
                      </Button>
                    )
                  } else {
                    actions.push(
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Plus />
                        <span className="hidden sm:block">Add</span>
                      </Button>
                    )
                  }
                  return (
                    <ActionCard
                      key={index}
                      header={student.name}
                      actions={actions}
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
      </DialogContent>
    </Dialog>
  )
}

export default AddMemberDialog
