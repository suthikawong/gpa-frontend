import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { ControllerRenderProps, FieldValues } from 'react-hook-form'

interface DatePickerProps<T extends FieldValues = FieldValues> {
  field: ControllerRenderProps<T, any>
  disabled?: boolean
  isInvalid?: boolean
}

export function DatePicker<T extends FieldValues>({ field, disabled, isInvalid }: DatePickerProps<T>) {
  return (
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
          onSelect={field.onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
