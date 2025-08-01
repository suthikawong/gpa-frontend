import { api } from '@/api'
import NoDocuments from '@/components/svg/NoDocuments'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Assessment, Group, User } from 'gpa-backend/src/drizzle/schema'
import { GetGroupMembersResponse } from 'gpa-backend/src/group/dto/group.response'
import { Check, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import ActionCard from '../ActionCard'
import EmptyState from '../EmptyState'
import { PaginationControlled } from '../PaginationControlled'
import SuspenseArea from '../SuspenseArea'
import toast from '../toast'
import { AxiosError } from 'axios'
import { ErrorResponse } from 'gpa-backend/src/app.response'

interface AddMemberDialogProps {
  triggerButton: React.ReactNode
  assessmentId: Assessment['assessmentId']
  groupId: Group['groupId']
  members: GetGroupMembersResponse
  canEdit: boolean
}

const AddMemberDialog = ({ triggerButton, assessmentId, groupId, members, canEdit }: AddMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [clickedStudentId, setClickedStudentId] = useState<User['userId'] | null>(null)
  const pageSize = 5
  const memberUserIds = members.map((member) => member.userId)

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

  const addMemberMutation = useMutation({
    mutationFn: api.group.addGroupMember,
    onSuccess: (_, req) => {
      toast.success('Member added successfully')
      const user = data.find((item) => item.userId === req.studentUserId)
      if (user) {
        const newData = [...members]
        newData.push(user)
        queryClient.setQueryData(['getMembersByGroupId', groupId], { data: newData })
      }
      setClickedStudentId(null)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message)
      } else {
        toast.error('Failed to add member.')
      }
    },
  })

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

  const onClickAddMember = (studentUserId: User['userId']) => {
    setClickedStudentId(studentUserId)
    addMemberMutation.mutate({ groupId, studentUserId })
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
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-2xl font-semibold">Add Members</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Search and select students to join this group.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          <Label htmlFor="search">Search</Label>
          <div className="flex gap-2">
            <Input
              id="search"
              placeholder="Student name"
              onChange={onKeywordChange}
              value={keyword}
              className="h-10"
            />
            <Button
              onClick={onSearch}
              loading={isFetching}
              size="lg"
            >
              Search
            </Button>
          </div>
          {!canEdit && (
            <div className="text-destructive text-sm">
              Some assessments already started. You can't add students to the group anymore.
            </div>
          )}
        </div>

        <Separator className="mt-4" />

        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex flex-col flex-grow [&>div]:border-t-1 [&>div:first-child]:border-t-0">
            <SuspenseArea loading={isLoading}>
              {data.length == 0 ? (
                <EmptyState
                  title="No Matched Student"
                  description1="It looks like there is no student in this assessment or no matched student."
                  icon={<NoDocuments className="w-[140px] h-[112px] md:w-[200px] md:h-[160px]" />}
                />
              ) : (
                data.map((student, index) => {
                  const isMember = memberUserIds.includes(student.userId)
                  const alreadyJoinedGroup = !!student.group
                  const actions = []

                  if (alreadyJoinedGroup && !isMember) {
                    actions.push(<div className="text-sm text-muted-foreground">Joined Other</div>)
                  } else {
                    actions.push(
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isMember || !canEdit}
                        onClick={() => onClickAddMember(student.userId)}
                        loading={clickedStudentId === student.userId && addMemberMutation.isPending}
                      >
                        {isMember ? (
                          <Check />
                        ) : clickedStudentId === student.userId && addMemberMutation.isPending ? null : (
                          <Plus />
                        )}
                        <span className="hidden sm:block">{isMember ? 'Added' : 'Add'}</span>
                      </Button>
                    )
                  }

                  return (
                    <ActionCard
                      key={index}
                      title={
                        <div className="flex gap-3 items-center">
                          <Avatar className="size-10">
                            {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
                            <AvatarFallback>{student?.name?.[0] ?? ''}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div>{student.name}</div>
                            <div className="text-sm text-muted-foreground font-normal">{student.email}</div>
                          </div>
                        </div>
                      }
                      actions={actions}
                      dialog={true}
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
