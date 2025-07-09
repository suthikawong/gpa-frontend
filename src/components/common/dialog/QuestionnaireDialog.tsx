import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  modelSelectionSet,
  qassConfigurationSet,
  QuestionnaireCoverItem,
  QuestionnaireQuestionItem,
} from '@/config/questionnaire'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface QuestionnaireDialogProps {
  triggerButton: React.ReactNode
}

const QuestionnaireDialog = ({ triggerButton }: QuestionnaireDialogProps) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [pages, setPages] = useState(modelSelectionSet)

  const content = pages[step]

  const onClickPrevious = () => {
    setStep(step - 1)
  }

  const onClickNext = () => {
    if (modelSelectionSet.length === step + 1) {
      // last page of first set
      setPages(modelSelectionSet.concat(qassConfigurationSet))
    } else {
      setStep(step + 1)
    }
  }

  useEffect(() => {
    if (step > 0) {
      setStep(step + 1)
    }
  }, [pages])

  useEffect(() => {
    return () => {
      if (!open) {
        setStep(0)
        setPages(modelSelectionSet)
      }
    }
  }, [open])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <div
          className="flex justify-end"
          onClick={() => setOpen(true)}
        >
          {triggerButton}
        </div>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Questionnaire</DialogTitle>
        </DialogHeader>

        {content.type === 'cover' ? <CoverPage data={content} /> : <QuestionPage data={content} />}

        <div className="flex sm:justify-end gap-2">
          {pages.length > modelSelectionSet.length && pages.length === step + 1 ? (
            <Button
              className="flex-grow sm:max-w-fit sm:ml-auto"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          ) : (
            <>
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={onClickPrevious}
                  className="flex-grow sm:max-w-fit"
                >
                  <ChevronLeft />
                  Previous
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onClickNext}
                className="flex-grow sm:max-w-fit"
              >
                Next
                <ChevronRight />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QuestionnaireDialog

const CoverPage = ({ data }: { data: QuestionnaireCoverItem }) => {
  console.log(data.image)
  return (
    <div className="flex flex-col justify-center items-center h-100 md:h-120">
      <img
        src={`/src/assets/${data.image}`}
        alt={data.type}
        className="m-4 mb-12"
      />
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <div>{data.description1}</div>
        {data.description2 && <div>{data.description2}</div>}
      </div>
    </div>
  )
}

const QuestionPage = ({ data }: { data: QuestionnaireQuestionItem }) => {
  return (
    <div className="flex flex-col justify-between h-100 md:h-120 md:p-8 lg:p-16">
      <h1 className="text-2xl md:text-3xl font-bold">{data.question}</h1>
      <div className="grid grid-cols-1 grid-rows-1 pb-8 sm:pb-10 md:pb-0 lg:grid-cols-2 lg:grid-rows-2 gap-4">
        {data.options.map((option) => (
          <div className="cursor-pointer shadow rounded text-lg font-semibold transition-colors duration-300 ease-in-out hover:bg-primary/90 hover:text-primary-foreground p-4 lg:p-6">
            {option.answer}
          </div>
        ))}
      </div>
    </div>
  )
}
