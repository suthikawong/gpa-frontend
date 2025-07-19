import { api } from '@/api'
import { Button } from '@/components/ui/button'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { GetGroupByIdResponse } from 'gpa-backend/src/group/dto/group.response'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import toast from '../toast'
import Uploader, { FileTypes } from '../Uploader'

interface GroupDialogProps {
  triggerButton: React.ReactNode
  data?: GetGroupByIdResponse
}

enum DialogState {
  Select = 1,
  SingleGroup,
  ImportMultipleGroup,
  RandomMultipleGroup,
}

enum ImportStep {
  UploadFile = 1,
  AlertError,
}

const formSchema = z.object({
  groupName: z.string().min(1, { message: 'Please enter the group name.' }),
})

const randomFormSchema = z.object({
  groupSize: z
    .number({ required_error: 'Group size is required', invalid_type_error: 'Group size must be a number' })
    .int()
    .gt(0, { message: 'Group size must be greater than 0' }),
})

const createGroupOptions = [
  {
    dialogState: DialogState.SingleGroup,
    label: 'Create a single group',
    description: 'Manually create one group and define its members yourself.',
  },
  {
    dialogState: DialogState.ImportMultipleGroup,
    label: 'Create multiple groups from a file',
    description: 'Upload a file to import and create multiple groups at once.',
  },
  {
    dialogState: DialogState.RandomMultipleGroup,
    label: 'Create multiple groups randomly',
    description: 'Automatically generate groups by randomly assigning members.',
  },
]

const GroupDialog = ({ triggerButton, data }: GroupDialogProps) => {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(DialogState.Select)

  useEffect(() => {
    return () => {
      if (!open) setState(DialogState.Select)
    }
  }, [open])

  const renderContent = () => {
    if (data) {
      return (
        <SingleGroupForm
          data={data}
          setOpen={setOpen}
          setState={setState}
        />
      )
    }
    if (state === DialogState.Select) {
      return (
        <SelectGroup
          setOpen={setOpen}
          setState={setState}
        />
      )
    }
    if (state === DialogState.SingleGroup) {
      return (
        <SingleGroupForm
          data={data}
          setOpen={setOpen}
          setState={setState}
        />
      )
    }
    if (state === DialogState.ImportMultipleGroup) {
      return (
        <ImportMultipleGroup
          setOpen={setOpen}
          setState={setState}
        />
      )
    }
    if (state === DialogState.RandomMultipleGroup) {
      return (
        <RandomMultipleGroup
          setOpen={setOpen}
          setState={setState}
        />
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div onClick={() => setOpen(true)}>{triggerButton}</div>
      </DialogTrigger>
      <DialogContent>{renderContent()}</DialogContent>
    </Dialog>
  )
}

export default GroupDialog

const SelectGroup = ({
  setOpen,
  setState,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setState: React.Dispatch<React.SetStateAction<DialogState>>
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">Create group</DialogTitle>
        <DialogDescription>Choose one of the options below to create a group.</DialogDescription>
      </DialogHeader>
      {createGroupOptions.map((option) => (
        <div
          className="rounded-xl border-2 p-4 cursor-pointer hover:bg-secondary hover:border-primary"
          onClick={() => setState(option.dialogState)}
        >
          <h3 className="font-semibold">{option.label}</h3>
          <span className="text-sm text-muted-foreground">{option.description}</span>
        </div>
      ))}
      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </DialogFooter>
    </>
  )
}

const SingleGroupForm = ({
  data,
  setOpen,
  setState,
}: {
  data?: GetGroupByIdResponse
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setState: React.Dispatch<React.SetStateAction<DialogState>>
}) => {
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assessmentId = parseInt(params?.assessmentId!)

  const defaultValues = {
    groupName: data?.groupName ?? '',
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const createMutation = useMutation({
    mutationFn: api.group.createGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Group created successfully')
      queryClient.invalidateQueries({ queryKey: ['getGroupsByAssessmentId', assessmentId] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create group.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: api.group.updateGroup,
    onSuccess: () => {
      setOpen(false)
      toast.success('Group updated successfully')
      queryClient.invalidateQueries({ queryKey: ['getGroupById', data?.groupId] })
      form.reset()
    },
    onError: () => {
      toast.error('Failed to update group.')
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (data?.groupId) {
      updateMutation.mutate({
        groupId: data.groupId,
        groupName: values.groupName,
      })
    } else {
      createMutation.mutate({
        assessmentId: assessmentId,
        groupName: values.groupName,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">{data ? 'Edit ' : 'Create '}group</DialogTitle>
          <DialogDescription>Enter group details. Click {data ? 'save' : 'create'} when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="groupName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter group name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          {data ? (
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              type="button"
              onClick={() => setState(DialogState.Select)}
            >
              Back
            </Button>
          )}
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {data ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

const ImportMultipleGroup = ({
  setOpen,
  setState,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setState: React.Dispatch<React.SetStateAction<DialogState>>
}) => {
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assessmentId = parseInt(params?.assessmentId!)
  const [step, setStep] = useState(ImportStep.UploadFile)
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([])

  const importGroupsMutation = useMutation({
    mutationFn: api.group.importGroups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getGroupsByAssessmentId', assessmentId] })
      toast.success('Group created successfully')
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create group.')
    },
  })

  const verifyMutation = useMutation({
    mutationFn: api.group.verifyImportGroups,
    onSuccess: (res) => {
      setErrors(res?.data?.errors ?? [])
      setStep(ImportStep.AlertError)
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })

  const onClickImportGroups = async () => {
    if (files.length > 0) {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('assessmentId', assessmentId.toString())
      importGroupsMutation.mutate(formData)
    }
  }

  const onClickContinue = async () => {
    if (files.length > 0) {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('assessmentId', assessmentId.toString())
      verifyMutation.mutate(formData)
    }
  }

  const onClickUploadAgain = () => {
    setFiles([])
    setStep(ImportStep.UploadFile)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">Import Groups from File</DialogTitle>
      </DialogHeader>
      {step === ImportStep.AlertError ? (
        <>
          {errors.length === 0 ? (
            <>
              <DialogDescription>
                Your file was validated successfully. No errors were found and you can proceed.
              </DialogDescription>
              <div className="flex w-full gap-2 bg-destructive/10 border border-destructive rounded-lg p-4">
                <AlertTriangle className="text-destructive" />
                <div className="text-left text-sm text-destructive">
                  <p className="font-medium">Warning:</p>
                  <p>Continuing will delete all existing groups and their related data. This includes:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Group scores</li>
                    <li>Student scores</li>
                    <li>Student's peer ratings</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              <DialogDescription>
                The uploaded file contains errors. Please review the issues below, correct them in your file, and upload
                it again before you can proceed.
              </DialogDescription>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-xl border border-gray-200 bg-muted p-5">
                  <ScrollArea className="max-h-[200px]">
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {errors?.map((error) => (
                        <li>{(error.row > 0 ? `Row ${error.row}: ` : '') + `${error.message}`}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClickUploadAgain}
            >
              Upload Again
            </Button>
            <Button
              disabled={errors.length > 0}
              loading={importGroupsMutation.isPending}
              onClick={onClickImportGroups}
            >
              Import Groups
            </Button>
          </DialogFooter>
        </>
      ) : (
        <>
          <DialogDescription>
            Upload an Excel of CSV file to import and create multiple groups at once. This is ideal for bulk group
            creation when you already have the group structure prepared.
          </DialogDescription>
          <Uploader
            files={files}
            setFiles={setFiles}
            allowFileTypes={[FileTypes.XLSX]}
            className="m-auto mt-4"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setState(DialogState.Select)}
            >
              Back
            </Button>
            <Button
              disabled={files.length === 0}
              loading={verifyMutation.isPending}
              onClick={onClickContinue}
            >
              Continue
            </Button>
          </DialogFooter>
        </>
      )}
    </>
  )
}

const RandomMultipleGroup = ({
  setOpen,
  setState,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setState: React.Dispatch<React.SetStateAction<DialogState>>
}) => {
  const queryClient = useQueryClient()
  const route = useRouter()
  const params: any = route.routeTree.useParams()
  const assessmentId = parseInt(params?.assessmentId!)

  const defaultValues = {
    groupSize: undefined,
  }
  const form = useForm<z.infer<typeof randomFormSchema>>({
    resolver: zodResolver(randomFormSchema),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: api.group.createRandomGroups,
    onSuccess: () => {
      setOpen(false)
      toast.success('Group created successfully')
      queryClient.invalidateQueries({ queryKey: ['getGroupsByAssessmentId', assessmentId] })
      form.reset()
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to create group.')
    },
  })

  const onSubmit = async (values: z.infer<typeof randomFormSchema>) => {
    mutation.mutate({
      assessmentId: assessmentId,
      groupSize: values.groupSize,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Random Groups</DialogTitle>
          <DialogDescription>
            Automatically generate multiple groups by randomly assigning members. This is fast, fair, and effortless —
            perfect for large teams or classes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full items-center gap-4">
          <FormField
            control={form.control}
            name="groupSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Size</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    type="number"
                    placeholder="Enter group size"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex w-full gap-2 bg-destructive/10 border border-destructive rounded-lg p-4">
          <AlertTriangle className="text-destructive" />
          <div className="text-left text-sm text-destructive">
            <p className="font-medium">Warning:</p>
            <p>Continuing will delete all existing groups and their related data. This includes:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Group scores</li>
              <li>Student scores</li>
              <li>Student's peer ratings</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setState(DialogState.Select)}
          >
            Back
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
          >
            Start Random Grouping
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
