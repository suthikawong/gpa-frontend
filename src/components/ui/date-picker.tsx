import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format, setHours, setMinutes, setSeconds } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Matcher } from 'react-day-picker'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'
import { Input } from './input'

interface DatePickerProps<T extends FieldValues = FieldValues> {
  type?: 'date' | 'datetime' | 'time'
  field: ControllerRenderProps<T, any>
  disabled?: boolean
  isInvalid?: boolean
  disabledDates?: Matcher | Matcher[] | undefined
}

export function DatePicker<T extends FieldValues>({
  type = 'date',
  field,
  disabled,
  isInvalid,
  disabledDates,
}: DatePickerProps<T>) {
  const handleDateChange = (value: any) => {
    if (field.value) {
      const [hours, minutes, seconds] = format(field.value, 'HH:mm:ss')
        .split(':')
        .map((item) => parseInt(item))
      const selectedDateTime = setHours(setMinutes(setSeconds(new Date(value), seconds), minutes), hours)
      field.onChange(selectedDateTime)
    } else {
      field.onChange(value)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes, seconds] = e.target.value.split(':').map((item) => parseInt(item))
    const date = field.value ? new Date(field.value) : new Date()
    const selectedDateTime = setHours(setMinutes(setSeconds(date, seconds), minutes), hours)
    field.onChange(selectedDateTime)
  }

  return (
    <div className="flex gap-4">
      {type !== 'time' && (
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                type="button"
                disabled={disabled}
                className={cn(
                  'w-full justify-start text-left font-normal border-input shadow-none text-foreground hover:bg-transparent',
                  !field.value && 'text-muted-foreground',
                  isInvalid && 'border-destructive! ring-1 ring-destructive/20!'
                )}
              >
                <CalendarIcon />
                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={handleDateChange}
                disabled={disabledDates}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
      {type !== 'date' && (
        <div>
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={field.value ? format(field.value, 'HH:mm:ss') : '00:00:00'}
            onChange={handleTimeChange}
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            aria-invalid={isInvalid}
          />
        </div>
      )}
    </div>
  )
}
