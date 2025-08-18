import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AssessmentModel } from '@/config/app'
import {
  modelSelectionSet,
  qassConfigurationSet,
  QuestionnaireCoverItem,
  QuestionnaireModelConfigurationQuestionItem,
  QuestionnaireModelSelectionQuestionItem,
  QuestionnaireModelSelectionQuestionOption,
  QuestionnaireSummaryrItem,
  webavaliaConfigurationSet,
} from '@/config/questionnaire'
import { cn } from '@/lib/utils'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface QuestionnaireDialogProps {
  triggerButton: React.ReactNode
}

const QuestionnaireDialog = ({ triggerButton }: QuestionnaireDialogProps) => {
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AssessmentModel | null>(null)
  console.log('TLOG ~ selectedModel:', selectedModel)

  useEffect(() => {
    return () => {
      if (!open) setSelectedModel(null)
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
        {selectedModel ? (
          <ModelConfigurationPageContainer
            model={selectedModel}
            setOpen={setOpen}
          />
        ) : (
          <ModelSelectionPageContainer setSelectedModel={setSelectedModel} />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default QuestionnaireDialog

const ModelSelectionPageContainer = ({
  setSelectedModel,
}: {
  setSelectedModel: React.Dispatch<React.SetStateAction<AssessmentModel | null>>
}) => {
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<QuestionnaireModelSelectionQuestionOption[]>([])
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [model, setModel] = useState<AssessmentModel | null>(null)
  const content = modelSelectionSet[step]

  const onClickPrevious = () => {
    const temp = [...result]
    temp.pop()
    setResult(temp)
    setStep(step - 1)
  }

  const onClickNext = () => {
    setStep(step + 1)
    if (content.type === 'question' && selectedChoice !== null) {
      const temp = [...result]
      temp.push(content.options?.[selectedChoice])
      setResult(temp)
      setSelectedChoice(null)
    }
  }

  const onClickChooseAgain = () => {
    setResult([])
    setSelectedChoice(null)
    setStep(0)
  }

  const onClickUseSelectedModel = () => {
    setSelectedModel(model)
  }

  const onChoiceSelected = (selectedIndex: number) => {
    setSelectedChoice(selectedIndex)
  }

  const onModelChange = (model: AssessmentModel) => {
    setModel(model)
  }

  const renderPage = () => {
    if (content.type === 'question') {
      return (
        <QuestionPage
          data={content}
          selectedChoice={selectedChoice}
          onChoiceSelected={onChoiceSelected}
        />
      )
    }
    if (content.type === 'summary') {
      return (
        <CompareModelPage
          data={content}
          options={result}
          onChange={onModelChange}
        />
      )
    }
    return <CoverPage data={content} />
  }

  return (
    <>
      {renderPage()}
      <Separator className="mt-4" />
      <div className="flex sm:justify-end gap-2">
        {step === modelSelectionSet.length - 1 ? (
          <>
            <Button
              variant="secondary"
              onClick={onClickChooseAgain}
              className="flex-grow sm:max-w-fit"
            >
              Choose again
            </Button>
            <Button
              onClick={onClickUseSelectedModel}
              className="flex-grow sm:max-w-fit"
            >
              Use selected model
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onClickPrevious}
              className="flex-grow sm:max-w-fit"
              disabled={step === 0}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={onClickNext}
              className="flex-grow sm:max-w-fit"
              disabled={step !== 0 && selectedChoice === null}
            >
              Next
              <ChevronRight />
            </Button>
          </>
        )}
      </div>
    </>
  )
}

const ModelConfigurationPageContainer = ({
  model,
  setOpen,
}: {
  model: AssessmentModel
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<QuestionnaireModelSelectionQuestionOption[]>([])
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const configurationSet = model === AssessmentModel.QASS ? qassConfigurationSet : webavaliaConfigurationSet
  const content = configurationSet[step]

  const onClickPrevious = () => {
    const temp = [...result]
    temp.pop()
    setResult(temp)
    setStep(step - 1)
  }

  const onClickNext = () => {
    setStep(step + 1)
    if (content.type === 'question' && selectedChoice !== null) {
      const temp = [...result]
      // temp.push(content.options?.[selectedChoice])
      setResult(temp)
      setSelectedChoice(null)
    }
  }

  const onClickChooseAgain = () => {
    setResult([])
    setSelectedChoice(null)
    setStep(0)
  }

  const onChoiceSelected = (selectedIndex: number) => {
    setSelectedChoice(selectedIndex)
  }

  const renderPage = () => {
    if (content.type === 'question') {
      return (
        <QuestionPage
          data={content}
          selectedChoice={selectedChoice}
          onChoiceSelected={onChoiceSelected}
        />
      )
    }
    return <CoverPage data={content} />
  }

  return (
    <>
      {renderPage()}
      <Separator className="mt-4" />
      <div className="flex sm:justify-end gap-2">
        {step === configurationSet.length - 1 ? (
          <Button
            className="flex-grow sm:max-w-fit sm:ml-auto"
            onClick={() => setOpen(false)}
          >
            Apply
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={onClickPrevious}
              className="flex-grow sm:max-w-fit"
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={onClickNext}
              className="flex-grow sm:max-w-fit"
              disabled={step !== 0 && selectedChoice === null}
            >
              Next
              <ChevronRight />
            </Button>
          </>
        )}
      </div>
    </>
  )
}

const CoverPage = ({ data }: { data: QuestionnaireCoverItem }) => {
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

const QuestionPage = ({
  data,
  selectedChoice,
  onChoiceSelected,
}: {
  data: QuestionnaireModelSelectionQuestionItem | QuestionnaireModelConfigurationQuestionItem
  selectedChoice: number | null
  onChoiceSelected: (value: number) => void
}) => {
  return (
    <div className="flex flex-col justify-between h-100 md:h-120 md:p-8 lg:p-16">
      <h1 className="text-2xl md:text-3xl font-bold">{data.question}</h1>
      <div className="grid grid-cols-1 grid-rows-1 pb-8 sm:pb-10 md:pb-0 lg:grid-cols-2 lg:grid-rows-2 gap-4">
        {data.options.map((option, index) => (
          <div
            onClick={() => onChoiceSelected(index)}
            className={cn(
              'cursor-pointer shadow rounded text-lg font-semibold transition-colors duration-300 ease-in-out hover:bg-primary/90 hover:text-primary-foreground p-4 lg:p-6',
              index === selectedChoice && 'bg-primary/90 text-primary-foreground'
            )}
          >
            {option.answer}
          </div>
        ))}
      </div>
    </div>
  )
}

const CompareModelPage = ({
  data,
  options,
  onChange,
}: {
  data: QuestionnaireSummaryrItem
  options: QuestionnaireModelSelectionQuestionOption[]
  onChange: (value: AssessmentModel) => void
}) => {
  const [initModel, setInitModel] = useState<AssessmentModel | null>(null)
  const [selectedModel, setSelectedModel] = useState<AssessmentModel | null>(null)
  const [isPerfectMatch, setIsPerfectMatch] = useState(false)

  useEffect(() => {
    const result = options.reduce((acc, curr) => acc.map((item, index) => item + curr.values[index]), [0, 0])
    if (result[0] >= result[1]) {
      setSelectedModel(AssessmentModel.QASS)
      setInitModel(AssessmentModel.QASS)
    } else {
      setSelectedModel(AssessmentModel.WebAVALIA)
      setInitModel(AssessmentModel.WebAVALIA)
    }
    if (result[0] === 8 || result[1] === 8) {
      setIsPerfectMatch(true)
    }
  }, [options])

  useEffect(() => {
    if (selectedModel) onChange(selectedModel)
  }, [selectedModel])

  const displayData = options.map((item) => ({
    label: item.description,
    [AssessmentModel.QASS]: item.values[0],
    [AssessmentModel.WebAVALIA]: item.values[1],
  }))

  const handleSelect = (value: AssessmentModel) => {
    setSelectedModel(value)
  }

  const customBorder = (index: number, curr: AssessmentModel) => {
    if (selectedModel !== curr) return
    if (index === 0) return 'border-primary border-b-transparent'
    if (index === displayData.length - 1) return 'border-primary border-t-transparent'
    return 'border-primary border-y-transparent'
  }

  const renderButton = (curr: AssessmentModel) => {
    if (selectedModel === curr)
      return (
        <div className="px-1 mt-4">
          <Button
            className="flex w-full"
            onClick={() => handleSelect(curr)}
          >
            Selected
          </Button>
        </div>
      )
    return (
      <div className="px-1 mt-4">
        <Button
          variant="outline"
          className="flex w-full"
          onClick={() => handleSelect(curr)}
        >
          Click to select
        </Button>
      </div>
    )
  }

  const description1 = data.description1.replace(
    /\${selectedModel}/g,
    initModel === AssessmentModel.QASS ? 'QASS' : 'WebAVALIA'
  )
  const description2 = data.description2.replace(
    /\${selectedModel}/g,
    initModel === AssessmentModel.QASS ? 'QASS' : 'WebAVALIA'
  )

  return (
    <>
      <div className="space-y-4 mt-4 mb-8">
        <h2 className="text-center text-2xl font-semibold">{data.title}</h2>
        <div className="text-center">{isPerfectMatch ? description1 : description2}</div>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-1/2"></TableHead>
              <TableHead
                className={cn(
                  'text-center w-1/4',
                  selectedModel === AssessmentModel.QASS
                    ? 'bg-primary text-white border-2 border-primary'
                    : 'bg-white text-foreground'
                )}
              >
                QASS
              </TableHead>
              <TableHead
                className={cn(
                  'text-center w-1/4',
                  selectedModel === AssessmentModel.WebAVALIA
                    ? 'bg-primary text-white border-2 border-primary'
                    : 'bg-white text-foreground'
                )}
              >
                WebAVALIA
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item, index) => (
              <TableRow
                key={index}
                className={`${index % 2 === 0 ? 'bg-secondary/50' : 'bg-white'}`}
              >
                <TableCell className="font-medium text-left border-y-1 border-transparent">{item.label}</TableCell>
                <TableCell
                  className={cn(
                    'text-center select-none border-2 border-transparent border-r-primary',
                    customBorder(index, AssessmentModel.QASS)
                  )}
                >
                  {item[AssessmentModel.QASS] ? (
                    <Check className="mx-auto text-green-600" />
                  ) : (
                    <X className="mx-auto text-red-600" />
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-center select-none border-2 border-transparent',
                    customBorder(index, AssessmentModel.WebAVALIA)
                  )}
                >
                  {item[AssessmentModel.WebAVALIA] ? (
                    <Check className="mx-auto text-green-600" />
                  ) : (
                    <X className="mx-auto text-red-600" />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* Selection row */}
            <TableRow className="border-b bg-white hover:bg-white">
              <TableCell className="text-left"></TableCell>
              <TableCell className="text-center p-0">{renderButton(AssessmentModel.QASS)}</TableCell>
              <TableCell className="text-center p-0">{renderButton(AssessmentModel.WebAVALIA)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  )
}
