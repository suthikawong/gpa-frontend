import { api } from '@/api'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Group, StudentScore, User } from 'gpa-backend/src/drizzle/schema'
import { GetScoresResponse, StudentScoreItem } from 'gpa-backend/src/group/dto/group.response'
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'

interface EditScoreDialogProps {
  triggerButton: React.ReactNode
  data?: GetScoresResponse
  groupId: Group['groupId']
}

const formSchema = z.object({
  groupScore: z
    .number({ required_error: 'Group score is required', invalid_type_error: 'Group score must be a number' })
    .finite()
    .gt(0, { message: 'Group score must be greater than 0' })
    .lt(1, { message: 'Group score must be less than 1' }),
  studentScores: z.array(
    z.object({
      studentUserId: z.number(),
      score: z
        .union([
          z
            .number()
            .int()
            .min(0, { message: 'Student score must be greater than or equal zero' })
            .max(100, { message: 'Student score must be less than or equal one hundred' }),
          z.nan(),
        ])
        .optional(),
      remark: z.string().optional(),
    })
  ),
})

type FormType = z.infer<typeof formSchema>

const EditScoreDialog = ({ triggerButton, data, groupId }: EditScoreDialogProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const defaultValues = {
    groupScore: data?.groupScore?.score,
    studentScores: data?.studentScores?.map((student) => ({
      studentUserId: student.userId,
      score: student?.studentScore?.score,
      remark: student?.studentScore?.remark ?? '',
    })),
  }
  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const upsertMutation = useMutation({
    mutationFn: api.group.upsertScore,
    onSuccess: () => {
      setOpen(false)
      toast.success('Scores were updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getScores', groupId] })
    },
    onError: () => {
      toast.error('Failed to update scores.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const studentPayload: {
      studentUserId: User['userId']
      score: StudentScore['score']
      remark: StudentScore['remark']
    }[] = []
    values?.studentScores?.forEach((value) => {
      if (value.score && typeof value.score === 'number' && !isNaN(value.score)) {
        studentPayload.push({ studentUserId: value.studentUserId, score: value.score, remark: value?.remark ?? null })
      }
    })
    upsertMutation.mutate({ ...values, studentScores: studentPayload, groupId })
  }

  useEffect(() => {
    if (open) form.reset(defaultValues)
  }, [open, data, form])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div
          className="self-end"
          onClick={() => setOpen(true)}
        >
          {triggerButton}
        </div>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit scores</DialogTitle>
              <DialogDescription>Enter group score and student scores. Click save when you're done.</DialogDescription>
            </DialogHeader>

            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="groupScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg mb-2">Group [product] score</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        type="number"
                        placeholder="Enter group score"
                        step="0.1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="my-4" />
              <div className="flex justify-between">
                <h1 className="text-lg mb-2 font-semibold">Student scores</h1>
                <Button type="button">
                  <Calculator />
                  <div className="hidden sm:block">Auto Calculate</div>
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {data?.studentScores?.map((studentScore, index) => (
                  <StudentScoreCollapsible
                    index={index}
                    form={form}
                    studentScore={studentScore}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={upsertMutation.isPending}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditScoreDialog

const StudentScoreCollapsible = ({
  index,
  studentScore,
  form,
}: {
  index: number
  studentScore: StudentScoreItem
  form: UseFormReturn<FormType, any, FormType>
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-2 rounded-md border">
        <div>
          <div className="text-sm font-semibold">{studentScore?.name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">{studentScore?.email ?? '-'}</div>
        </div>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
          >
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="flex flex-col gap-2 p-4 pr-0">
        <FormField
          control={form.control}
          name={`studentScores.${index}.score`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student score</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  type="number"
                  placeholder="Enter group score"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`studentScores.${index}.remark`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter group score"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
